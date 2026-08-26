import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { QuizPlayerModal } from './components/QuizPlayerModal';
import { DocumentUploaderModal } from './components/DocumentUploaderModal';
import { JudgeDemoScenario } from './components/JudgeDemoScenario';
import { AIMentorChat } from './components/AIMentorChat';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentOnboardingPage } from './pages/StudentOnboardingPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { PersonalizedPathPage } from './pages/PersonalizedPathPage';
import { QuizCenterPage } from './pages/QuizCenterPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { InstructorDashboardPage } from './pages/InstructorDashboardPage';
import { SkillGapHeatmapPage } from './pages/SkillGapHeatmapPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { iGOTIntegrationPage } from './pages/iGOTIntegrationPage';
import { AchievementsPage } from './pages/AchievementsPage';

import { getNotificationsApi, generateQuizApi } from './services/api';

export const App = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Modals & Drawers
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [quizModalQuiz, setQuizModalQuiz] = useState(null);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [judgeDemoOpen, setJudgeDemoOpen] = useState(false);
  const [activeDocumentForMentor, setActiveDocumentForMentor] = useState(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getNotificationsApi();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  const handleOpenQuizWithTopic = async ({ topic, course_id, document_id }) => {
    try {
      const data = await generateQuizApi({
        topic: topic || 'Core Foundations & Applied Problem Solving',
        course_id,
        document_id,
        difficulty: 'Medium',
        question_count: 5,
        question_type: 'mcq',
      });
      setQuizModalQuiz(data.quiz);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenQuizDirectly = (quizObject) => {
    setQuizModalQuiz(quizObject);
  };

  const handleAskMentorAboutDoc = (doc) => {
    setActiveDocumentForMentor(doc);
  };

  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100">
      
      {/* Global Top Navbar */}
      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenDemoModal={() => setJudgeDemoOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        
        {/* Role-based Sidebar (hidden on public landing/login/register) */}
        {!isPublicPage && (
          <Sidebar onOpenJudgeDemo={() => setJudgeDemoOpen(true)} />
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Routes>
            <Route path="/" element={<LandingPage onOpenJudgeDemo={() => setJudgeDemoOpen(true)} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<StudentOnboardingPage />} />
            
            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <StudentDashboardPage
                  onOpenQuiz={handleOpenQuizWithTopic}
                  onOpenUpload={() => setUploaderOpen(true)}
                  onOpenDemoModal={() => setJudgeDemoOpen(true)}
                />
              }
            />
            <Route
              path="/learning-path"
              element={<PersonalizedPathPage onOpenQuiz={handleOpenQuizWithTopic} />}
            />
            <Route
              path="/quizzes"
              element={<QuizCenterPage onStartQuiz={handleOpenQuizDirectly} />}
            />
            <Route
              path="/documents"
              element={
                <DocumentsPage
                  onOpenUpload={() => setUploaderOpen(true)}
                  onGenerateQuizFromDoc={(doc) => handleOpenQuizWithTopic({ document_id: doc.id, topic: doc.title })}
                  onAskMentorAboutDoc={handleAskMentorAboutDoc}
                />
              }
            />
            <Route path="/courses" element={<CoursesPage />} />
            <Route
              path="/courses/:id"
              element={<CourseDetailPage onOpenQuiz={handleOpenQuizWithTopic} />}
            />
            <Route path="/achievements" element={<AchievementsPage />} />

            {/* Instructor Routes */}
            <Route path="/instructor" element={<InstructorDashboardPage />} />
            <Route path="/instructor/heatmap" element={<SkillGapHeatmapPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/audit" element={<AuditLogsPage />} />

            {/* iGOT Karmayogi Portal */}
            <Route path="/igot" element={<iGOTIntegrationPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global AI Mentor Chat Drawer / Widget */}
      <AIMentorChat activeDocument={activeDocumentForMentor} />

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onNotificationUpdated={fetchNotifications}
      />

      {quizModalQuiz && (
        <QuizPlayerModal
          isOpen={!!quizModalQuiz}
          quiz={quizModalQuiz}
          onClose={() => setQuizModalQuiz(null)}
          onQuizCompleted={fetchNotifications}
        />
      )}

      <DocumentUploaderModal
        isOpen={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        onUploadSuccess={() => fetchNotifications()}
        onGenerateQuizFromDoc={(doc) => {
          setUploaderOpen(false);
          handleOpenQuizWithTopic({ document_id: doc.id, topic: doc.title });
        }}
      />

      <JudgeDemoScenario
        isOpen={judgeDemoOpen}
        onClose={() => setJudgeDemoOpen(false)}
        onFinishDemo={() => {
          navigate('/dashboard');
          fetchNotifications();
        }}
      />

    </div>
  );
};
export default App;
