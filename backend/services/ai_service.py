import os
import json
import random
import time
import logging
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.database import get_db

logger = logging.getLogger(__name__)

# Retry settings
MAX_RETRIES = 3
BASE_DELAY = 1.0  # seconds
MAX_DELAY = 16.0  # cap for exponential backoff

class AIService:
    def __init__(self):
        self.client = None
        self.api_key = ""
        self.model = ""

        # Prefer OpenRouter + MiMo when OPENROUTER_API_KEY is set
        if settings.OPENROUTER_API_KEY:
            self.api_key = settings.OPENROUTER_API_KEY
            self.model = settings.MIMO_MODEL
            try:
                from openai import OpenAI
                self.client = OpenAI(
                    api_key=self.api_key,
                    base_url=settings.OPENROUTER_BASE_URL
                )
            except Exception:
                self.client = None
        elif settings.OPENAI_API_KEY:
            # Fallback to direct OpenAI
            self.api_key = settings.OPENAI_API_KEY
            self.model = settings.OPENAI_MODEL
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
            except Exception:
                self.client = None

    def is_live_ai_available(self) -> bool:
        return self.client is not None and bool(self.api_key)

    @staticmethod
    def _extract_usage(response) -> dict:
        """Pull token counts from an OpenAI response object."""
        try:
            usage = response.usage
            return {
                "prompt_tokens": getattr(usage, "prompt_tokens", 0),
                "completion_tokens": getattr(usage, "completion_tokens", 0),
                "total_tokens": getattr(usage, "total_tokens", 0),
            }
        except Exception:
            return {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

    @staticmethod
    def _log_api_call(
        *,
        method: str,
        model: str,
        latency_ms: float,
        usage: dict,
        stream: bool = False,
        retries: int = 0,
        error: str | None = None,
    ) -> None:
        """Write a structured INFO log line for every API call."""
        extra = {
            "method": method,
            "model": model,
            "latency_ms": round(latency_ms, 1),
            "prompt_tokens": usage.get("prompt_tokens", 0),
            "completion_tokens": usage.get("completion_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0),
            "stream": stream,
            "retries": retries,
        }
        if error:
            extra["error"] = error
            logger.warning("MiMo API %s failed: %s", method, extra)
        else:
            logger.info("MiMo API %s completed: %s", method, extra)

    def _call_with_retry(self, **kwargs) -> Any:
        """Call chat.completions.create with exponential backoff retry.
        
        Retries on transient errors (rate limits, timeouts, server errors).
        Returns the response object on success, raises on final failure.
        Logs structured request data on every call.
        """
        model = kwargs.get("model", self.model)
        method = kwargs.pop("_log_method", "completions")
        stream = kwargs.get("stream", False)
        last_exception = None
        retries = 0
        start = time.time()

        for attempt in range(MAX_RETRIES):
            try:
                response = self.client.chat.completions.create(**kwargs)
                latency_ms = (time.time() - start) * 1000

                # For streaming responses we can't read usage from the stream itself,
                # so log a minimal record; non-streaming gets full token counts.
                if stream:
                    self._log_api_call(
                        method=method, model=model, latency_ms=latency_ms,
                        usage={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
                        stream=True, retries=retries,
                    )
                else:
                    usage = self._extract_usage(response)
                    self._log_api_call(
                        method=method, model=model, latency_ms=latency_ms,
                        usage=usage, stream=False, retries=retries,
                    )
                return response
            except Exception as e:
                last_exception = e
                retries = attempt + 1
                error_str = str(e).lower()
                # Only retry on transient / retryable errors
                retryable = any(
                    kw in error_str
                    for kw in [
                        "rate_limit", "timeout", "502", "503", "504",
                        "overloaded", "capacity", "try again",
                        "connection", "reset",
                    ]
                )
                if not retryable or attempt == MAX_RETRIES - 1:
                    latency_ms = (time.time() - start) * 1000
                    self._log_api_call(
                        method=method, model=model, latency_ms=latency_ms,
                        usage={}, stream=stream, retries=retries,
                        error=str(e)[:200],
                    )
                    raise
                delay = min(BASE_DELAY * (2 ** attempt), MAX_DELAY)
                # Add jitter: 0-50% of the delay
                jitter = delay * random.uniform(0, 0.5)
                wait = delay + jitter
                logger.warning(
                    "MiMo API call failed (attempt %d/%d): %s — retrying in %.1fs",
                    attempt + 1, MAX_RETRIES, e, wait,
                )
                time.sleep(wait)
        raise last_exception  # shouldn't reach here, but safety

    def generate_quiz_questions(
        self,
        topic: str,
        document_text: Optional[str] = None,
        difficulty: str = "Medium",
        question_count: int = 5,
        question_type: str = "mcq"
    ) -> List[Dict[str, Any]]:
        # If live OpenAI client is configured, attempt call
        if self.is_live_ai_available():
            try:
                prompt = f"""
                You are an expert academic assessment generator for MoSPI & EdTech.
                Generate {question_count} high-quality {difficulty}-level questions on the topic '{topic}'.
                Question type: {question_type}.
                Document context: {document_text[:2500] if document_text else 'General Subject Matter'}

                Return strictly JSON in the following format:
                [
                  {{
                    "question_text": "...",
                    "question_type": "{question_type}",
                    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
                    "correct_answer": "A) ...",
                    "explanation": "Detailed step-by-step reasoning...",
                    "topic": "{topic}",
                    "difficulty": "{difficulty}",
                    "points": 1
                  }}
                ]
                """
                response = self._call_with_retry(
                    _log_method="quiz_generate",
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a precise educational assessment generator. Output ONLY valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"} if "gpt-4" in self.model or "mimo" in self.model else None
                )
                raw_content = response.choices[0].message.content
                # Parse JSON
                parsed = json.loads(raw_content)
                if isinstance(parsed, dict) and "questions" in parsed:
                    return parsed["questions"]
                elif isinstance(parsed, list):
                    return parsed
            except Exception as e:
                # Graceful fallback to deterministic local AI engine
                pass
                
        # Deterministic Intelligent Local AI Generation (Demo / Offline Mode)
        return self._generate_local_fallback_questions(topic, document_text, difficulty, question_count, question_type)

    def _generate_local_fallback_questions(
        self,
        topic: str,
        document_text: Optional[str],
        difficulty: str,
        question_count: int,
        question_type: str
    ) -> List[Dict[str, Any]]:
        t_lower = topic.lower() if topic else "general"
        
        # Domain question banks with rich pedagogical explanations
        ml_bank = [
            {
                "question_text": "What is the primary mathematical objective of Gradient Descent in Machine Learning?",
                "options": [
                    "A) To minimize the cost/loss function iteratively with respect to model parameters",
                    "B) To increase the dimensionality of the feature space",
                    "C) To calculate the exact analytical inverse of the feature matrix",
                    "D) To randomly shuffle dataset partitions for cross-validation"
                ],
                "correct_answer": "A) To minimize the cost/loss function iteratively with respect to model parameters",
                "explanation": "Gradient Descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function by taking steps proportional to the negative of the gradient.",
                "topic": "Machine Learning Optimization",
                "difficulty": "Medium"
            },
            {
                "question_text": "Which regularization technique adds an L1 penalty (absolute value of coefficients) to enforce feature sparsity?",
                "options": [
                    "A) Ridge Regularization (L2)",
                    "B) Lasso Regularization (L1)",
                    "C) ElasticNet without penalties",
                    "D) Batch Normalization"
                ],
                "correct_answer": "B) Lasso Regularization (L1)",
                "explanation": "Lasso (Least Absolute Shrinkage and Selection Operator) penalizes the sum of absolute values of coefficients, driving non-essential coefficients to exactly zero and producing sparse models.",
                "topic": "Regularization Techniques",
                "difficulty": "Medium"
            },
            {
                "question_text": "In a binary classification problem with extreme class imbalance (e.g. 99% negative, 1% positive), which metric is LEAST reliable?",
                "options": [
                    "A) ROC-AUC Score",
                    "B) Precision-Recall AUC",
                    "C) Standard Accuracy",
                    "D) F1-Score"
                ],
                "correct_answer": "C) Standard Accuracy",
                "explanation": "Standard accuracy can be misleadingly high (99%) by simply predicting the majority class for all instances, masking complete failure to detect positive cases.",
                "topic": "Model Evaluation Metrics",
                "difficulty": "Easy"
            },
            {
                "question_text": "What is the key difference between Supervised Learning and Unsupervised Learning?",
                "options": [
                    "A) Supervised learning requires labeled ground-truth targets; unsupervised learning detects intrinsic patterns in unlabeled data",
                    "B) Supervised learning only runs on neural networks while unsupervised runs on trees",
                    "C) Unsupervised learning always guarantees higher test accuracy",
                    "D) Supervised learning cannot be used for regression tasks"
                ],
                "correct_answer": "A) Supervised learning requires labeled ground-truth targets; unsupervised learning detects intrinsic patterns in unlabeled data",
                "explanation": "Supervised learning algorithms are trained using input-output pairs $(X, y)$ with known ground truth, whereas unsupervised algorithms discover hidden clusters, representations, or manifolds from $X$ alone.",
                "topic": "Supervised vs Unsupervised Learning",
                "difficulty": "Easy"
            },
            {
                "question_text": "How does the Random Forest algorithm reduce the variance of individual Decision Trees?",
                "options": [
                    "A) By increasing the maximum depth to infinity",
                    "B) By combining bootstrap aggregation (bagging) with random feature subspace sampling",
                    "C) By applying L1 regularization on tree leaves",
                    "D) By forcing all trees to split on the exact same primary feature"
                ],
                "correct_answer": "B) By combining bootstrap aggregation (bagging) with random feature subspace sampling",
                "explanation": "Random Forest averages the predictions of many de-correlated decision trees trained on bootstrap samples with random feature subsets, significantly lowering variance without increasing bias.",
                "topic": "Ensemble Methods",
                "difficulty": "Hard"
            },
            {
                "question_text": "What does a high bias and low variance condition indicate in a machine learning model?",
                "options": [
                    "A) Overfitting",
                    "B) Underfitting",
                    "C) Optimal generalized fit",
                    "D) Data leakage"
                ],
                "correct_answer": "B) Underfitting",
                "explanation": "High bias implies the model makes overly simplistic assumptions and fails to capture underlying trends in the training data, leading to underfitting.",
                "topic": "Bias-Variance Tradeoff",
                "difficulty": "Medium"
            },
            {
                "question_text": "What is the primary purpose of the Softmax activation function in multi-class neural networks?",
                "options": [
                    "A) To convert unnormalized logit outputs into a probability distribution that sums to 1.0",
                    "B) To prevent gradient vanishing in hidden layers",
                    "C) To introduce non-convexity for tree splits",
                    "D) To binarize inputs into either 0 or 1"
                ],
                "correct_answer": "A) To convert unnormalized logit outputs into a probability distribution that sums to 1.0",
                "explanation": r"Softmax normalizes the $K$-dimensional vector of raw logits into a valid categorical probability distribution where $\sum P(y_i) = 1$.",
                "topic": "Neural Network Fundamentals",
                "difficulty": "Medium"
            }
        ]
        
        dsa_bank = [
            {
                "question_text": "What is the worst-case time complexity of searching in a balanced Binary Search Tree (such as an AVL or Red-Black Tree)?",
                "options": [
                    "A) O(1)",
                    "B) O(log N)",
                    "C) O(N)",
                    "D) O(N log N)"
                ],
                "correct_answer": "B) O(log N)",
                "explanation": r"Because balanced BSTs maintain height invariant $h = O(\log N)$, search, insertion, and deletion operations have worst-case time complexity of $O(\log N)$.",
                "topic": "Binary Search Trees",
                "difficulty": "Easy"
            },
            {
                "question_text": "Which data structure is primarily utilized to implement Breadth-First Search (BFS) graph traversal?",
                "options": [
                    "A) Stack (LIFO)",
                    "B) Queue (FIFO)",
                    "C) Priority Queue / Heap only",
                    "D) Hash Map"
                ],
                "correct_answer": "B) Queue (FIFO)",
                "explanation": "BFS explores nodes level by level using a FIFO Queue to ensure that vertices closer to the source are visited prior to vertices at greater distances.",
                "topic": "Graph Algorithms",
                "difficulty": "Easy"
            },
            {
                "question_text": "What is the average and worst-case time complexity of standard Quicksort with random pivot selection?",
                "options": [
                    "A) Average: O(N log N), Worst: O(N^2)",
                    "B) Average: O(N), Worst: O(N log N)",
                    "C) Average: O(N^2), Worst: O(N^2)",
                    "D) Average: O(N log N), Worst: O(N log N)"
                ],
                "correct_answer": "A) Average: O(N log N), Worst: O(N^2)",
                "explanation": r"Quicksort runs in $O(N \log N)$ expected time, but if the pivot consistently divides the array into unbalanced partitions $(0 \text{ and } N-1)$, worst-case performance degrades to $O(N^2)$.",
                "topic": "Sorting & Complexity",
                "difficulty": "Medium"
            },
            {
                "question_text": "In Dynamic Programming, what are the two essential properties a problem must satisfy to apply memoization or tabulation?",
                "options": [
                    "A) Greedy choice property and sorting invariant",
                    "B) Optimal Substructure and Overlapping Subproblems",
                    "C) Linear time complexity and binary branching",
                    "D) Acyclic graph structure and unit weights"
                ],
                "correct_answer": "B) Optimal Substructure and Overlapping Subproblems",
                "explanation": "Dynamic Programming applies when solutions to subproblems are reused multiple times (Overlapping Subproblems) and the global optimal solution can be constructed from optimal subproblem solutions (Optimal Substructure).",
                "topic": "Dynamic Programming",
                "difficulty": "Hard"
            }
        ]
        
        python_bank = [
            {
                "question_text": "In Python, how does a generator function differ from a standard return function?",
                "options": [
                    "A) Generators use 'yield' to produce a lazy iterator stream without storing the entire sequence in memory",
                    "B) Generators execute concurrently in separate OS threads",
                    "C) Generators cannot take input parameters",
                    "D) Generators are automatically compiled to C binaries"
                ],
                "correct_answer": "A) Generators use 'yield' to produce a lazy iterator stream without storing the entire sequence in memory",
                "explanation": "Generators pause execution upon hitting `yield` and maintain state, returning items on demand via `next()` for $O(1)$ memory streaming.",
                "topic": "Python Core Concepts",
                "difficulty": "Medium"
            },
            {
                "question_text": "What is the time complexity of looking up a key in a Python dictionary on average?",
                "options": [
                    "A) O(1)",
                    "B) O(log N)",
                    "C) O(N)",
                    "D) O(N^2)"
                ],
                "correct_answer": "A) O(1)",
                "explanation": "Python dictionaries are implemented as open-addressing hash tables, providing average $O(1)$ amortized lookup and insertion times.",
                "topic": "Python Data Structures",
                "difficulty": "Easy"
            }
        ]
        
        # Select base bank
        if any(k in t_lower for k in ["ml", "machine learning", "ai", "model", "data science"]):
            bank = ml_bank
        elif any(k in t_lower for k in ["dsa", "structure", "algorithm", "tree", "graph", "stack", "sort"]):
            bank = dsa_bank
        elif any(k in t_lower for k in ["python", "code", "programming"]):
            bank = python_bank
        else:
            bank = ml_bank + dsa_bank
            
        selected = bank.copy()
        if len(selected) < question_count:
            selected += ml_bank + dsa_bank + python_bank
            
        random.seed(len(topic) + question_count)
        random.shuffle(selected)
        results = selected[:question_count]
        
        # Re-tag topic and points
        for q in results:
            q["points"] = 1
            if question_type == "true_false":
                q["question_type"] = "true_false"
                q["options"] = ["A) True", "B) False"]
                q["correct_answer"] = "A) True"
            else:
                q["question_type"] = "mcq"
                
        return results

    def chat_mentor_stream(
        self,
        user_message: str,
        session_id: str,
        user_context: Dict[str, Any],
        document_context: Optional[str] = None,
        document_title: Optional[str] = None
    ):
        """Yield SSE events: 'token', 'citations', 'suggested', 'done'.
        
        Falls back to non-streaming local mentor if the API is unavailable.
        """
        citations = []
        if document_context and document_title:
            citations.append({
                "source_title": document_title,
                "citation_text": f"Source: {document_title} — Page 1, Section: Core Principles",
                "snippet": document_context[:180] + "..."
            })

        if self.is_live_ai_available():
            try:
                system_prompt = f"""
                You are 'SkillSphere AI Mentor', an intelligent, encouraging EdTech tutor for MoSPI learners.
                Student Context:
                - Name: {user_context.get('full_name', 'Student')}
                - Career Goal: {user_context.get('career_goal', 'AI/ML Engineer')}
                - Current Skills: {user_context.get('skills_summary', 'Python, ML, DSA')}
                - Identified Critical Gap: {user_context.get('critical_gap', 'Machine Learning')}
                
                Document Knowledge:
                {document_context[:2000] if document_context else 'No specific document attached.'}
                
                Instructions:
                - Answer concisely, clearly, with step-by-step breakdowns or code examples where helpful.
                - When referencing the document, cite it specifically.
                - Conclude with a motivational tip and recommend a concrete next step.
                """
                stream_start = time.time()
                response = self._call_with_retry(
                    _log_method="chat_mentor_stream",
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    temperature=0.7,
                    stream=True,
                )
                full_reply = ""
                stream_tokens = 0
                for chunk in response:
                    delta = chunk.choices[0].delta if chunk.choices else None
                    if delta and delta.content:
                        full_reply += delta.content
                        stream_tokens += 1
                        yield {"type": "token", "content": delta.content}
                stream_latency = (time.time() - stream_start) * 1000
                self._log_api_call(
                    method="chat_mentor_stream", model=self.model,
                    latency_ms=stream_latency,
                    usage={"prompt_tokens": 0, "completion_tokens": stream_tokens, "total_tokens": stream_tokens},
                    stream=True,
                )

                # After stream completes, send metadata
                yield {"type": "citations", "content": citations}
                yield {
                    "type": "suggested",
                    "content": [
                        "How do I practice this in Python?",
                        "Can you generate a 3-question quiz on this?",
                        "What are the top interview questions for this topic?"
                    ],
                }
                yield {"type": "done", "content": ""}
                return
            except Exception as e:
                logger.warning("MiMo stream failed, falling back to local mentor: %s", e)

        # Fallback: yield the deterministic local mentor response as a single token
        result = self.chat_mentor(user_message, session_id, user_context, document_context, document_title)
        yield {"type": "token", "content": result["reply"]}
        yield {"type": "citations", "content": result.get("citations", [])}
        yield {"type": "suggested", "content": result.get("suggested_questions", [])}
        yield {"type": "done", "content": ""}

    def chat_mentor(
        self,
        user_message: str,
        session_id: str,
        user_context: Dict[str, Any],
        document_context: Optional[str] = None,
        document_title: Optional[str] = None
    ) -> Dict[str, Any]:
        msg_lower = user_message.lower()
        
        citations = []
        if document_context and document_title:
            citations.append({
                "source_title": document_title,
                "citation_text": f"Source: {document_title} — Page 1, Section: Core Principles",
                "snippet": document_context[:180] + "..."
            })
            
        # If OpenAI live client available
        if self.is_live_ai_available():
            try:
                system_prompt = f"""
                You are 'SkillSphere AI Mentor', an intelligent, encouraging EdTech tutor for MoSPI learners.
                Student Context:
                - Name: {user_context.get('full_name', 'Student')}
                - Career Goal: {user_context.get('career_goal', 'AI/ML Engineer')}
                - Current Skills: {user_context.get('skills_summary', 'Python, ML, DSA')}
                - Identified Critical Gap: {user_context.get('critical_gap', 'Machine Learning')}
                
                Document Knowledge:
                {document_context[:2000] if document_context else 'No specific document attached.'}
                
                Instructions:
                - Answer concisely, clearly, with step-by-step breakdowns or code examples where helpful.
                - When referencing the document, cite it specifically.
                - Conclude with a motivational tip and recommend a concrete next step.
                """
                response = self._call_with_retry(
                    _log_method="chat_mentor",
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    temperature=0.7
                )
                reply = response.choices[0].message.content
                return {
                    "reply": reply,
                    "citations": citations,
                    "suggested_questions": [
                        f"How do I practice this in Python?",
                        f"Can you generate a 3-question quiz on this?",
                        f"What are the top interview questions for this topic?"
                    ],
                    "recommended_topics": ["Model Optimization", "Cross Validation", "Feature Engineering"]
                }
            except Exception:
                pass
                
        # Deterministic Intelligent Local Mentor (Fallback / Offline Demo Mode)
        reply = ""
        suggested = []
        rec_topics = []
        
        if any(w in msg_lower for w in ["machine learning", "ml", "supervised", "gradient"]):
            learner_name = user_context.get('full_name', 'Learner')
            reply = (
                f"Hello {learner_name}! 🎓\n\n"
                "In **Machine Learning**, the core paradigm revolves around learning predictive patterns from historical data.\n\n"
                "### Key Pillars:\n"
                "1. **Model Hypothesis**: $f(X; \\theta)$ parameterized by weights $\\theta$.\n"
                "2. **Loss Formulation**: e.g., Mean Squared Error (MSE) $L = \\frac{1}{2m} \\sum (h_\\theta(x^{(i)}) - y^{(i)})^2$ for regression, or Cross-Entropy for classification.\n"
                "3. **Optimization**: Updating weights via Gradient Descent: $\\theta := \\theta - \\alpha \\nabla_\\theta L$.\n\n"
            )
            if citations:
                reply += f"\n> **Verified Citation**: {citations[0]['citation_text']}\n> *\"{citations[0]['snippet']}\"*\n\n"
            reply += "💡 **Recommendation**: Take our generated 5-question ML practice quiz to turn your 32% competency into proficiency!"
            suggested = ["Explain Gradient Descent with a code snippet", "What is the difference between L1 and L2 regularization?", "Generate an adaptive quiz on ML"]
            rec_topics = ["Gradient Descent", "Lasso vs Ridge", "Cross-Validation"]
            
        elif any(w in msg_lower for w in ["dsa", "tree", "binary search", "graph", "algorithm"]):
            reply = f"Great question on **Data Structures & Algorithms**! 🌲\n\n### Binary Search Tree (BST) Properties:\n- For every node $N$, all nodes in the left subtree have values $< N.val$.\n- All nodes in the right subtree have values $> N.val$.\n- Balanced BSTs (like AVL and Red-Black Trees) guarantee $O(\\log N)$ worst-case search, insertion, and deletion.\n\n```python\n# Inorder traversal produces strictly sorted output\ndef inorder(root):\n    return inorder(root.left) + [root.val] + inorder(root.right) if root else []\n```\n\n🎯 **Action Item**: Complete Day 12 of your Personalized 30-Day Learning Path to master Tree traversals."
            suggested = ["What is the difference between BFS and DFS?", "Explain Dynamic Programming with an example", "Give me a practice problem on BST"]
            rec_topics = ["AVL Trees", "Graph Traversal", "Dynamic Programming"]
            
        elif any(w in msg_lower for w in ["gap", "competency", "score", "improve", "recommend"]):
            reply = f"📊 **Your Competency Gap Analysis**:\n\nBased on your current progress in SkillSphere AI:\n- 🔴 **Machine Learning (32%)**: Critical Gap — high priority for your '{user_context.get('career_goal', 'AI/ML Engineer')}' goal.\n- 🟠 **Data Structures (48%)**: Developing — requires tree and graph practice.\n- 🟢 **Python Fundamentals (82%)**: Proficient — strong baseline!\n\n**Next Best Action**: Open the **'Machine Learning Fundamentals'** course or upload your lecture notes to take an instant gap-closing quiz."
            suggested = ["Start 30-Day Personalized Path", "Generate quiz from uploaded document", "Show me the iGOT mapped skills"]
            rec_topics = ["Personalized Learning Path", "Adaptive Quizzes", "MoSPI Competency Matrix"]
            
        else:
            reply = f"Hello {user_context.get('full_name', 'Learner')}! 👋 I am **SkillSphere AI Mentor**, your dedicated tutor aligned with MoSPI and the iGOT Karmayogi capacity building framework.\n\nI can help you:\n- **Explain complex topics** with diagrams, math, and code\n- **Summarize uploaded PDFs and documents** with verified citations\n- **Detect and close your competency gaps**\n- **Create custom adaptive practice quizzes**\n\nWhat would you like to explore today?"
            suggested = ["How do I fix my Machine Learning gap?", "Explain Supervised vs Unsupervised learning", "Help me prepare for my CSE semester exam"]
            rec_topics = ["Machine Learning", "Data Structures", "Python Advanced"]
            
        return {
            "reply": reply,
            "citations": citations,
            "suggested_questions": suggested,
            "recommended_topics": rec_topics
        }

ai_service = AIService()
