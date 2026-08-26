import React, { useState, useEffect } from 'react';
import { 
  FileText, UploadCloud, Trash2, HelpCircle, Bot, 
  Sparkles, CheckCircle2, ChevronRight, Eye, RefreshCw 
} from 'lucide-react';
import { getDocumentsApi, deleteDocumentApi, getDocumentDetailApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DocumentsPage = ({ onOpenUpload, onGenerateQuizFromDoc, onAskMentorAboutDoc }) => {
  const { showToast } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspecting, setInspecting] = useState(false);

  const fetchDocs = async () => {
    try {
      const data = await getDocumentsApi();
      setDocuments(data || []);
      if (data && data.length > 0 && !selectedDoc) {
        handleInspectDoc(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleInspectDoc = async (docId) => {
    setInspecting(true);
    try {
      const detail = await getDocumentDetailApi(docId);
      setSelectedDoc(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setInspecting(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocumentApi(docId);
      showToast('Document deleted successfully.', 'info');
      if (selectedDoc?.id === docId) setSelectedDoc(null);
      await fetchDocs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-indigo-950 text-white shadow-xl border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Document Knowledge Synthesizer
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Knowledge Documents & Lecture Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Upload PDFs and lecture slides. SkillSphere chunks text, extracts key concepts, and generates grounded assessments with verified citations.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 flex-shrink-0 transition-all hover:scale-105"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Notes (PDF/Word)</span>
        </button>
      </div>

      {/* Grid: Document List (5 cols) + Document Detail & Chunks Viewer (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Document List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Synthesized Documents ({documents.length})
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500">No documents uploaded yet.</p>
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            documents.map((d) => {
              const isSelected = selectedDoc?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => handleInspectDoc(d.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-brand-50/60 dark:bg-brand-950/40 border-brand-500 dark:border-brand-500 shadow-md ring-1 ring-brand-500'
                      : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {d.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {d.file_type} • {d.page_count} pages • {(d.file_size / 1024).toFixed(0)} KB
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(d.extracted_topics || []).slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(d.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Document Chunks & Knowledge View */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
              
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Processed & Grounded
                    </span>
                    <span className="text-xs text-slate-400">{selectedDoc.original_filename}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {selectedDoc.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onGenerateQuizFromDoc && onGenerateQuizFromDoc(selectedDoc)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Generate AI Quiz</span>
                  </button>

                  <button
                    onClick={() => onAskMentorAboutDoc && onAskMentorAboutDoc(selectedDoc)}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI Mentor</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">AI Document Summary:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {selectedDoc.summary}
                </p>
              </div>

              {/* Extracted Semantic Topics */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Extracted Core Concepts
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedDoc.extracted_topics || []).map((t, idx) => (
                    <span key={idx} className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      🏷️ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chunks Inspector */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Semantic Chunks ({selectedDoc.chunks?.length || 0} Chunks)
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {(selectedDoc.chunks || []).map((ch, idx) => (
                    <div
                      key={ch.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>Chunk #{idx + 1} • Page {ch.page_number}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{ch.topic}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                        {ch.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Select a document to inspect semantic chunks, extracted concepts, and generate assessments.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
