import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Github, 
  Terminal, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ApkReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkReleaseModal: React.FC<ApkReleaseModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Why the APK wasn’t showing on GitHub before',
      desc: 'GitHub is a source-code host, not an automatic compiler. Pushing a web project doesn’t produce an APK file automatically unless a GitHub Actions CI/CD workflow is configured.',
      badge: 'Resolved'
    },
    {
      title: '2. GitHub Actions Workflow is now configured!',
      desc: 'We created `.github/workflows/build-apk.yml` and initialized the Android platform with Capacitor. Every push or release now triggers automated APK compilation in GitHub Actions.',
      badge: 'Active'
    },
    {
      title: '3. Where to download the APK in your GitHub repo',
      desc: 'Go to your GitHub repo → click the "Actions" tab → select the latest "Build & Release Android APK" run → scroll down to Artifacts and click "WeatherApp-Android-APK" to download your ready-to-install APK!',
      badge: 'Download'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`w-full max-w-xl rounded-3xl p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all border ${
          isDarkMode 
            ? 'bg-[#000000] border-white/20 text-white shadow-[0_10px_50px_rgba(0,0,0,0.95)]' 
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 flex items-center justify-center text-sky-400 border border-sky-500/30">
              <Download size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <span>Android APK Release Guide</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                How to get and download your Android APK from GitHub
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
          {/* NOTICE BANNER */}
          <div className={`p-4 rounded-2xl border ${
            isDarkMode 
              ? 'bg-sky-950/30 border-sky-500/30 text-sky-200' 
              : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}>
            <div className="flex items-start space-x-3">
              <Sparkles size={18} className="text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Automated APK Pipeline Ready!</p>
                <p className="leading-relaxed opacity-90">
                  Your repository now includes <strong>Capacitor Android</strong> and a <strong>GitHub Actions CI/CD workflow</strong> (<code>.github/workflows/build-apk.yml</code>) that compiles and publishes the installable Android APK directly to your GitHub Releases and Artifacts.
                </p>
              </div>
            </div>
          </div>

          {/* 3 STEPS CARDS */}
          <div className="space-y-3">
            {steps.map((s, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDarkMode 
                    ? 'bg-[#0A0A0C] border-white/10' 
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>{s.title}</span>
                  </h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    {s.badge}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-stone-600'}`}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* LOCAL BUILD CLI COMMANDS */}
          <div className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-[#0A0A0C] border-white/10' : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold flex items-center space-x-2 text-zinc-200">
                <Terminal size={14} className="text-amber-400" />
                <span>Build APK on Your Computer (CLI)</span>
              </span>
              <button
                onClick={() => copyToClipboard('npm run build:android && cd android && ./gradlew assembleDebug', 99)}
                className="text-[11px] flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-semibold"
              >
                {copiedIndex === 99 ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedIndex === 99 ? 'Copied' : 'Copy command'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-black text-[11px] font-mono text-emerald-400 border border-white/10 overflow-x-auto">
              npm run build:android &amp;&amp; cd android &amp;&amp; ./gradlew assembleDebug
            </pre>
            <p className="text-[10px] text-zinc-500 mt-2">
              Generated APK path: <code className="text-zinc-400">android/app/build/outputs/apk/debug/app-debug.apk</code>
            </p>
          </div>

          {/* INSTANT PWA ALTERNATIVE */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            isDarkMode ? 'bg-[#000000] border-white/15' : 'bg-white border-stone-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Smartphone size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Direct Android Phone Install (PWA)</p>
                <p className="text-[11px] text-zinc-400">
                  Open in Chrome on Android → tap menu (⋮) → "Add to Home Screen"
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
              No APK Needed
            </span>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-400 flex items-center space-x-1">
            <Github size={13} className="inline mr-1" />
            <span>Workflow: <code>.github/workflows/build-apk.yml</code></span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
