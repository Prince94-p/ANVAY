import React from 'react';
import { FileText, Download, X, Building2, User, Calendar, FileCheck, Tag, Info } from 'lucide-react';

export const DocumentViewerModal = ({ isOpen, onClose, document }) => {
  if (!isOpen || !document) return null;

  const isPdf = document.fileType?.includes('pdf') || document.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = document.fileType?.includes('image') || /\.(jpg|jpeg|png)$/i.test(document.fileName || '');
  const isTxt = document.fileType?.includes('text') || document.fileName?.toLowerCase().endsWith('.txt');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-700 rounded-lg">
              <FileText className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {document.fileName || 'Medical Document Viewer'}
              </h3>
              <p className="text-xs text-slate-300">
                {document.category || 'Clinical Record'} • {document.fileSize || 'Standard Attachment'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={document.fileUrl}
              download={document.fileName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content & Metadata Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Main Document Preview Pane */}
          <div className="md:col-span-2 bg-slate-100 p-4 overflow-y-auto flex items-center justify-center border-r border-slate-200">
            {isImage ? (
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 max-w-full">
                <img
                  src={document.fileUrl}
                  alt={document.fileName}
                  className="max-h-[60vh] object-contain rounded-lg mx-auto"
                />
              </div>
            ) : isTxt ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 w-full font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {document.description || 'Clinical plain text record attachment.\nSource verified by network hospital.'}
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md shadow-sm">
                <FileText className="w-16 h-16 text-teal-600 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">{document.fileName}</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Multi-Format Preserved Clinical Document ({document.fileType || 'Medical Report'})
                </p>
                <div className="flex justify-center gap-2">
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                  >
                    Open Document in New Tab
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Inspector Sidebar */}
          <div className="p-5 bg-white overflow-y-auto space-y-4 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600" />
              Document Metadata
            </h4>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                <span className="inline-flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-xs mt-0.5">
                  <Tag className="w-3 h-3" />
                  {document.category || 'General'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Originating Hospital</span>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {document.hospitalName || 'Network Hospital'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Uploading Physician / Staff</span>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {document.uploadedBy || document.doctorName || 'Authorized Clinician'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Upload Date & Time</span>
                <p className="font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(document.uploadDate || Date.now()).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Clinical Description</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                  {document.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>File Format: <strong>{document.fileType || 'binary'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
