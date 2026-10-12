import React, { useState, useEffect } from 'react';
import { 
  Download, 
  RefreshCw, 
  Github, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  X, 
  Sparkles, 
  FileCode, 
  Settings2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { 
  checkAppUpdates, 
  ReleaseInfo, 
  CURRENT_APP_VERSION, 
  getGitHubRepo, 
  setGitHubRepo, 
  formatBytes 
} from '../../services/updateService';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({ isOpen, onClose }) => {
  const { customAccentColor, accentSurface, accentBorder } = useTheme();

  const [loading, setLoading] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [showRepoSettings, setShowRepoSettings] = useState(false);
  
  const [repoInput, setRepoInput] = useState(getGitHubRepo().fullPath);

  useEffect(() => {
    if (isOpen) {
      handleCheckUpdates();
    }
  }, [isOpen]);

  const handleCheckUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await checkAppUpdates();
      setReleaseInfo(info);
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      setError(err?.message || 'Failed to check GitHub releases.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      setGitHubRepo(repoInput.trim());
      setShowRepoSettings(false);
      handleCheckUpdates();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-[32px] border border-[#E9E7E1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 border-b border-[#E9E7E1] flex items-center justify-between bg-[#F7F6F2]">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs border border-[#E9E7E1]"
              style={{ backgroundColor: accentSurface, color: customAccentColor }}
            >
              <Github size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#171717] tracking-tight">
                App Updates & Releases
              </h2>
              <p className="text-xs text-[#737873] font-medium">
                Official GitHub Release Channel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E9E7E1] flex items-center justify-center text-[#737873] hover:text-[#171717] cursor-pointer snappy-touch"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Installed Version Pill */}
          <div className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <PackageCheck size={18} style={{ color: customAccentColor }} />
              <div>
                <span className="text-xs font-bold text-[#171717] block">Installed App Version</span>
                <span className="text-[10px] text-[#737873]">Farm Weather v{CURRENT_APP_VERSION}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black font-mono-numbers px-3 py-1 rounded-full bg-white border border-[#E9E7E1] text-[#171717] inline-block shadow-xs">
                v{CURRENT_APP_VERSION}
              </span>
              {lastChecked && (
                <span className="text-[9px] text-[#737873] block mt-0.5">
                  Checked at {lastChecked}
                </span>
              )}
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="p-8 text-center rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2]/50 space-y-3">
              <RefreshCw size={28} className="animate-spin mx-auto" style={{ color: customAccentColor }} />
              <div>
                <span className="text-xs font-bold text-[#171717] block">Querying GitHub API...</span>
                <span className="text-[10px] text-[#737873]">Checking releases for {getGitHubRepo().fullPath}</span>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="p-4 rounded-2xl bg-[#FFF4ED] border border-[#FFE1CB] text-[#C2410C] space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold block text-[#9A3412]">Check Failed</span>
                  <span>{error}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#FFE1CB]">
                <button
                  onClick={() => setShowRepoSettings(!showRepoSettings)}
                  className="px-3 py-1 rounded-xl bg-white border border-[#FFE1CB] text-[#9A3412] text-[11px] font-bold cursor-pointer"
                >
                  Configure Repository
                </button>
                <button
                  onClick={handleCheckUpdates}
                  className="px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[11px] font-bold cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* RELEASE INFO */}
          {!loading && !error && releaseInfo && (
            <div className="space-y-4">
              {/* STATUS BANNER */}
              {releaseInfo.isNewer ? (
                <div 
                  className="p-4 rounded-2xl border flex items-center justify-between"
                  style={{ backgroundColor: accentSurface, borderColor: accentBorder }}
                >
                  <div className="flex items-center space-x-3">
                    <Sparkles size={22} style={{ color: customAccentColor }} />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider block" style={{ color: customAccentColor }}>
                        Update Available!
                      </span>
                      <span className="text-sm font-black text-[#171717]">
                        New Release: {releaseInfo.tagName}
                      </span>
                    </div>
                  </div>

                  <span 
                    className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white border shadow-xs"
                    style={{ color: customAccentColor, borderColor: accentBorder }}
                  >
                    New Version
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#E5F5EC] border border-[#CEEFDB] flex items-center justify-between text-[#10B981]">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={20} />
                    <div>
                      <span className="text-xs font-black text-[#065F46] block">You are up to date!</span>
                      <span className="text-[10px] text-[#047857]">
                        Latest GitHub tag ({releaseInfo.tagName}) matches your app version.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* RELEASE CARD */}
              <div className="p-4 rounded-2xl border border-[#E9E7E1] bg-white space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#171717]">
                      {releaseInfo.name}
                    </h3>
                    <span className="text-[10px] text-[#737873] font-semibold">
                      Published on {releaseInfo.publishedAt}
                    </span>
                  </div>

                  <a
                    href={releaseInfo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-[11px] font-bold text-[#737873] hover:text-[#171717]"
                  >
                    <span>View on GitHub</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* RELEASE NOTES */}
                <div className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E9E7E1]">
                  <span className="text-[10px] font-bold text-[#737873] uppercase tracking-wider block mb-1">
                    Release Notes & Changelog
                  </span>
                  <div className="text-xs text-[#171717] font-medium whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto no-scrollbar">
                    {releaseInfo.body || 'No release notes provided for this release.'}
                  </div>
                </div>

                {/* APK ASSET OR WEBPAGE DOWNLOAD */}
                {releaseInfo.apkAsset ? (
                  <div className="p-3.5 rounded-xl border border-[#E9E7E1] bg-[#F7F6F2] flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <FileCode size={18} style={{ color: customAccentColor }} className="shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#171717] block truncate">
                          {releaseInfo.apkAsset.name}
                        </span>
                        <span className="text-[10px] text-[#737873] font-mono-numbers">
                          {formatBytes(releaseInfo.apkAsset.size)} • {releaseInfo.apkAsset.downloadCount} downloads
                        </span>
                      </div>
                    </div>

                    <a
                      href={releaseInfo.apkAsset.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-black text-white flex items-center space-x-1.5 cursor-pointer snappy-touch shadow-xs shrink-0"
                      style={{ backgroundColor: customAccentColor }}
                    >
                      <Download size={14} />
                      <span>Download APK</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E9E7E1] flex items-center justify-between">
                    <span className="text-xs text-[#737873] font-medium">
                      No compiled APK binary attached. View release page to download.
                    </span>
                    <a
                      href={releaseInfo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#171717] text-white text-xs font-bold flex items-center space-x-1 shrink-0"
                    >
                      <span>Open Release</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CUSTOM REPO SETTINGS COLLAPSIBLE */}
          <div className="pt-2 border-t border-[#E9E7E1]">
            <button
              onClick={() => setShowRepoSettings(!showRepoSettings)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#737873] hover:text-[#171717] py-1 cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <Settings2 size={14} />
                <span>GitHub Repository Source ({getGitHubRepo().fullPath})</span>
              </div>
              {showRepoSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showRepoSettings && (
              <form onSubmit={handleSaveRepo} className="mt-2.5 p-3 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] space-y-2">
                <label className="text-[11px] font-bold text-[#171717] block">
                  GitHub Repository (owner/repo)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    placeholder="mahesh2008here-star/Wheather-pro"
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-[#E9E7E1] bg-white font-mono text-[#171717] outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-[#171717] text-white text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[#E9E7E1] bg-[#F7F6F2] flex items-center justify-between">
          <button
            onClick={handleCheckUpdates}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E9E7E1] bg-white text-[#171717] hover:bg-gray-50 flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Check Now</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black text-white cursor-pointer shadow-xs"
            style={{ backgroundColor: customAccentColor }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
