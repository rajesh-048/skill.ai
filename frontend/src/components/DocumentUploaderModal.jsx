import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X, Sparkles, HelpCircle } from 'lucide-react';
import { uploadDocumentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DocumentUploaderModal = ({ isOpen, onClose, onUploadSuccess, onGenerateQuizFromDoc }) => {
  const { showToast } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload (PDF, DOCX, TXT)');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title.trim()) {
        formData.append('title', title.trim());
      }

      const data = await uploadDocumentApi(formData);
      setUploadResult(data.document);
      showToast(`Document '${data.document.title}' processed successfully!`, 'success');
      if (onUploadSuccess) onUploadSuccess(data.document);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to process document.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setUploadResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-navy-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upload & Synthesize Learning Notes
              </h3>
              <p className="text-[11px] text-slate-500">PDF, DOCX, TXT • Chunking & Topic Extraction</p>
            </div>
          </div>

          <button onClick={resetForm} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadResult ? (
            <form onSubmit={handleUpload} className="space-y-4">
              
              {/* Dropzone */}
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group">
                <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-brand-600 mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {file ? file.name : 'Click to select or drag & drop document'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Supported formats: PDF, Word (.docx), Plain Text (.txt) up to 25MB
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Document Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document / Subject Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Machine Learning Basics & Loss Functions"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting text & computing semantic chunks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process Document with AI</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Upload Success Result Card */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Document Processed & Chunked Successfully!
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Extracted {uploadResult.chunk_count} semantic segments across {uploadResult.page_count} pages.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">AI Generated Summary:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {uploadResult.summary}
                </p>
              </div>

              {/* Extracted Topics */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Identified Academic Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(uploadResult.extracted_topics || []).map((t, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      🏷️ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    const doc = uploadResult;
                    resetForm();
                    if (onGenerateQuizFromDoc) onGenerateQuizFromDoc(doc);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Generate AI Quiz from this Doc</span>
                </button>

                <button
                  onClick={resetForm}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
