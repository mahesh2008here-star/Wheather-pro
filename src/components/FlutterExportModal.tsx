import React, { useState } from 'react';
import { FileCode, Check, Copy, X, FolderTree, Download } from 'lucide-react';
import { FLUTTER_PROJECT_FILES } from '../data/flutterSourceCode';
import { useTheme } from '../context/ThemeContext';

interface FlutterExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterExportModal: React.FC<FlutterExportModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = FLUTTER_PROJECT_FILES[selectedFileIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-2xl rounded-3xl p-5 shadow-2xl transition-all max-h-[90vh] flex flex-col ${
          isDarkMode ? 'bg-slate-900 text-white border border-slate-700' : 'bg-white text-stone-900'
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <FileCode size={20} className="text-emerald-500" />
            <div>
              <h3 className="font-bold text-base">Flutter & Dart Source Code</h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Complete Flutter codebase matching the reference video
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* FILE SELECTOR TABS */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar py-3 border-b border-stone-100 dark:border-slate-800">
          {FLUTTER_PROJECT_FILES.map((file, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedFileIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFileIdx === idx
                  ? isDarkMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 text-white'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* FILE INFO & COPY BUTTON */}
        <div className="flex items-center justify-between py-2 text-xs">
          <span className="font-mono text-stone-500 dark:text-slate-400">
            {currentFile.path} • {currentFile.description}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* CODE BLOCK VIEWER */}
        <div className="flex-1 overflow-auto rounded-2xl bg-stone-950 p-4 font-mono text-xs text-stone-200 leading-relaxed border border-stone-800">
          <pre>{currentFile.content}</pre>
        </div>
      </div>
    </div>
  );
};
