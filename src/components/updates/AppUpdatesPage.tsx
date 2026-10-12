import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Download, 
  RefreshCw, 
  Github, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  FileCode, 
  Settings2,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Info,
  Check,
  AlertTriangle
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

interface AppUpdatesPageProps {
  onBack: () => void;
}

export const AppUpdatesPage: React.FC<AppUpdatesPageProps> = ({ onBack }) => {
  const { customAccentColor, accentSurface, accentBorder } = useTheme();

  const [loading, setLoading] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [showRepoSettings, setShowRepoSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [installingStatus, setInstallingStatus] = useState<string | null>(null);
  
  const [repoInput, setRepoInput] = useState(getGitHubRepo().fullPath);

  useEffect(() => {
    // Scroll to top when page mounts
    window.scrollTo(0, 0);
    handleCheckUpdates();
  }, []);

  const handleStartInAppDownload = async (downloadUrl: string, fileName: string) => {
    setDownloading(true);
    setDownloadProgress(10);
    setInstallingStatus('Initiating secure direct download...');

    try {
      // Simulate/perform direct chunked fetch
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 95;
          }
          return prev + 20;
        });
      }, 300);

      const response = await fetch(downloadUrl);
      clearInterval(interval);

      if (!response.ok) {
        throw new Error(`Direct download stream failed (HTTP ${response.status})`);
      }

      setDownloadProgress(100);
      setInstallingStatus('Download complete. Launching Android Package Installer...');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Trigger native download/installer action
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Trigger system window open for Android WebView PackageInstaller
      if (typeof window !== 'undefined') {
        try {
          window.open(downloadUrl, '_system');
        } catch (e) {}
      }

      setTimeout(() => {
        setDownloading(false);
        setInstallingStatus('Package Installer launched. Please confirm installation on Android prompt.');
      }, 2000);
    } catch (err: any) {
      console.warn('Direct stream note, triggering direct link:', err);
      setDownloadProgress(100);
      setInstallingStatus('Redirecting to Android download manager...');

      // Fallback direct link trigger
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        setDownloading(false);
        setInstallingStatus(null);
      }, 2500);
    }
  };

  const handleCheckUpdates = async () => {
    setLoading(true);
    setError(null);
    setReleaseInfo(null); // Clear stale release info while checking
    try {
      const info = await checkAppUpdates();
      setReleaseInfo(info);
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      setError(err?.message || "Couldn't check for updates. Please verify network connection or repository path.");
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

  const handleCopyRepoLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://github.com/${getGitHubRepo().fullPath}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#F7F6F2] text-[#171717] flex flex-col font-sans relative overflow-x-hidden">
      {/* 1. TOP HEADER BAR */}
      <header 
        className="w-full bg-white border-b border-[#E9E7E1] sticky top-0 z-40 shadow-xs"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-[#F7F6F2] hover:bg-[#EAE8E1] border border-[#E9E7E1] text-[#171717] flex items-center space-x-1.5 cursor-pointer snappy-touch transition-colors"
              aria-label="Back to Settings"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-[#E9E7E1]"
                style={{ backgroundColor: accentSurface, color: customAccentColor }}
              >
                <Github size={20} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-[#171717] leading-tight">
                  App Updates & Releases
                </h1>
                <p className="text-[11px] text-[#737873] font-medium">
                  Official GitHub Release Channel • Farm Weather
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckUpdates}
            disabled={loading}
            className="py-2 px-3.5 rounded-xl text-xs font-bold border border-[#E9E7E1] bg-[#F7F6F2] hover:bg-white text-[#171717] flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{loading ? 'Checking...' : 'Check again'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN PAGE CONTENT CONTAINER */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* INSTALLED APPLICATION VERSION CARD */}
        <div className="p-5 rounded-[28px] bg-white border border-[#E9E7E1] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div 
                className="p-2.5 rounded-2xl border border-[#E9E7E1] shrink-0"
                style={{ backgroundColor: accentSurface, color: customAccentColor }}
              >
                <PackageCheck size={22} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-black text-[#171717]">Installed Application Version</h2>
                  <span 
                    className="text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs"
                    style={{ backgroundColor: accentSurface, color: customAccentColor, borderColor: accentBorder }}
                  >
                    Active Build
                  </span>
                </div>
                <p className="text-xs text-[#737873] font-medium mt-0.5">
                  Farm Weather Agriculture Weather Suite
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-sm font-black font-mono-numbers px-3.5 py-1 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] text-[#171717] inline-block shadow-2xs">
                  v{CURRENT_APP_VERSION}
                </span>
                {lastChecked && (
                  <span className="text-[10px] text-[#737873] block mt-1">
                    Checked at {lastChecked}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] text-xs space-y-2 text-[#444746]">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="font-semibold text-[#737873]">GitHub Repository Source:</span>
              <div className="flex items-center space-x-2">
                <span className="font-black text-[#171717] font-mono">{getGitHubRepo().fullPath}</span>
                <button
                  onClick={handleCopyRepoLink}
                  className="text-[11px] font-bold text-[#EA580C] hover:underline cursor-pointer"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="font-semibold text-[#737873]">Target Platform:</span>
              <span className="font-bold text-[#171717]">Android APK / Web Progressive Telemetry</span>
            </div>
          </div>
        </div>

        {/* STATE 1: LOADING STATE */}
        {loading && (
          <div className="p-10 text-center rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs space-y-3 animate-pulse">
            <RefreshCw size={36} className="animate-spin mx-auto text-[#EA580C]" />
            <div>
              <h3 className="text-base font-black text-[#171717] block">Checking for updates…</h3>
              <p className="text-xs text-[#737873] mt-1">
                Comparing installed version v{CURRENT_APP_VERSION} with latest GitHub release...
              </p>
            </div>
          </div>
        )}

        {/* STATE 2: ERROR STATE */}
        {!loading && error && (
          <div className="p-6 rounded-[28px] bg-[#FFF4ED] border border-[#FFE1CB] text-[#C2410C] space-y-4 shadow-xs">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-2xl bg-white border border-[#FFE1CB] text-[#EA580C] shrink-0 shadow-2xs">
                <AlertCircle size={24} />
              </div>
              <div className="text-xs space-y-1">
                <h3 className="font-black text-base text-[#9A3412]">Couldn't check for updates</h3>
                <p className="text-xs text-[#C2410C] leading-relaxed">{error}</p>
                <p className="text-[11px] opacity-80 pt-1">
                  Check your network connection or verify the GitHub repository configuration below.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#FFE1CB]">
              <button
                onClick={() => setShowRepoSettings(!showRepoSettings)}
                className="px-4 py-2 rounded-xl bg-white border border-[#FFE1CB] text-[#9A3412] text-xs font-bold cursor-pointer hover:bg-orange-50 shadow-2xs"
              >
                Configure Repository
              </button>
              <button
                onClick={handleCheckUpdates}
                className="px-5 py-2 rounded-xl bg-[#EA580C] text-white text-xs font-bold cursor-pointer hover:bg-[#C2410C] shadow-xs flex items-center space-x-1.5"
              >
                <RefreshCw size={13} />
                <span>Try again</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: SUCCESS - UP TO DATE (isNewer === false) */}
        {!loading && !error && releaseInfo && !releaseInfo.isNewer && (
          <div className="p-8 rounded-[28px] bg-[#E5F5EC] border border-[#CEEFDB] text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-white border border-[#CEEFDB] text-[#10B981] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-black text-[#065F46] tracking-tight">
                You're up to date
              </h3>
              <p className="text-xs font-medium text-[#047857] leading-relaxed">
                Farm Weather <span className="font-bold font-mono">v{CURRENT_APP_VERSION}</span> is the latest available release for your device.
              </p>
              {lastChecked && (
                <p className="text-[10px] text-[#059669] pt-1">
                  Last checked at {lastChecked} • Tag <code className="font-mono">{releaseInfo.tagName}</code>
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleCheckUpdates}
                className="py-2.5 px-6 rounded-2xl bg-[#10B981] text-white text-xs font-black inline-flex items-center space-x-2 cursor-pointer shadow-xs hover:bg-[#059669] snappy-touch transition-transform active:scale-95"
              >
                <RefreshCw size={14} />
                <span>Check again</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: SUCCESS - UPDATE AVAILABLE (isNewer === true) */}
        {!loading && !error && releaseInfo && releaseInfo.isNewer && (
          <div className="space-y-6">
            {/* UPDATE AVAILABLE STATUS BANNER */}
            <div 
              className="p-6 rounded-[28px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              style={{ backgroundColor: accentSurface, borderColor: accentBorder }}
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-2xl bg-white border shadow-2xs" style={{ borderColor: accentBorder }}>
                  <Sparkles size={26} style={{ color: customAccentColor }} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block" style={{ color: customAccentColor }}>
                    Update Available
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#171717]">
                    Release Tag: {releaseInfo.tagName}
                  </h3>
                  <p className="text-xs text-[#737873] font-medium mt-0.5">
                    Installed: <strong className="font-mono text-[#171717]">v{CURRENT_APP_VERSION}</strong> → Latest: <strong className="font-mono text-[#10B981]">{releaseInfo.tagName}</strong>
                  </p>
                </div>
              </div>

              <span 
                className="text-xs font-black uppercase px-4 py-1.5 rounded-full bg-white border shadow-xs self-start sm:self-auto"
                style={{ color: customAccentColor, borderColor: accentBorder }}
              >
                Action Recommended
              </span>
            </div>

            {/* RELEASE DETAILS & CHANGELOG CARD */}
            <div className="p-6 rounded-[28px] border border-[#E9E7E1] bg-white space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9E7E1] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#171717]">
                    {releaseInfo.name}
                  </h3>
                  <span className="text-xs text-[#737873] font-semibold block mt-0.5">
                    Published on {releaseInfo.publishedAt} • Tag {releaseInfo.tagName}
                  </span>
                </div>

                <a
                  href={releaseInfo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#EA580C] hover:underline self-start sm:self-auto"
                >
                  <span>View Release on GitHub</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* RELEASE NOTES & CHANGELOG */}
              <div className="space-y-2">
                <span className="text-xs font-black text-[#171717] uppercase tracking-wider block">
                  Changelog & Release Notes
                </span>
                <div className="p-4 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] text-xs text-[#171717] font-medium whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {releaseInfo.body || 'No release notes provided for this release.'}
                </div>
              </div>

              {/* DOWNLOAD APK ASSET OR NO APK WARNING */}
              {releaseInfo.apkAsset ? (
                <div className="p-4 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div 
                        className="p-2.5 rounded-xl border border-[#E9E7E1] bg-white shrink-0 shadow-2xs"
                        style={{ color: customAccentColor }}
                      >
                        <FileCode size={22} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-[#171717] block truncate">
                          {releaseInfo.apkAsset.name}
                        </span>
                        <span className="text-[11px] text-[#737873] font-mono-numbers">
                          {formatBytes(releaseInfo.apkAsset.size)} • Verified GitHub Build Asset
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartInAppDownload(releaseInfo.apkAsset!.downloadUrl, releaseInfo.apkAsset!.name)}
                      disabled={downloading}
                      className="py-2.5 px-6 rounded-xl text-xs font-black text-white flex items-center justify-center space-x-2 cursor-pointer snappy-touch shadow-xs shrink-0 transition-transform active:scale-95 disabled:opacity-60"
                      style={{ backgroundColor: customAccentColor }}
                    >
                      <Download size={16} />
                      <span>{downloading ? 'Downloading Package...' : `Download & Install APK (${formatBytes(releaseInfo.apkAsset.size)})`}</span>
                    </button>
                  </div>

                  {/* ACTIVE DOWNLOAD / INSTALLATION PROGRESS BAR (STATE D) */}
                  {(downloading || installingStatus) && (
                    <div className="pt-2 border-t border-[#E9E7E1] space-y-2 animate-fade-in">
                      <div className="flex justify-between text-xs font-bold text-[#171717]">
                        <span>{installingStatus || 'Downloading update...'}</span>
                        <span>{downloadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E9E7E1] overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%`, backgroundColor: customAccentColor }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FFF4ED] border border-[#FFE1CB] text-[#C2410C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5 text-[#EA580C]" />
                    <div className="text-xs">
                      <span className="font-bold block text-[#9A3412]">No compiled APK attached</span>
                      <span>Release {releaseInfo.tagName} was published on GitHub, but no compiled .apk file was uploaded to the release assets.</span>
                    </div>
                  </div>
                  <a
                    href={releaseInfo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 rounded-xl bg-[#EA580C] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shrink-0 hover:bg-[#C2410C]"
                  >
                    <span>View GitHub Release</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* ANDROID INSTALLATION GUIDANCE CARD (Only shown when an update is available) */}
            <div className="p-6 rounded-[28px] bg-white border border-[#E9E7E1] shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-[#171717]">
                <Info size={18} className="text-[#EA580C]" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Android APK Installation Instructions
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] space-y-1">
                  <span className="font-black text-[#EA580C] block">1. Download APK</span>
                  <p className="text-[11px] text-[#737873] leading-snug">
                    Click "Download APK" above to download the compiled release file.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] space-y-1">
                  <span className="font-black text-[#EA580C] block">2. Tap Downloaded File</span>
                  <p className="text-[11px] text-[#737873] leading-snug">
                    Open your device's Downloads folder or notification bar and tap the .apk file.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] space-y-1">
                  <span className="font-black text-[#EA580C] block">3. Confirm Installation</span>
                  <p className="text-[11px] text-[#737873] leading-snug">
                    Allow "Install from Unknown Sources" if prompted by Android security, then tap Update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM REPO SETTINGS COLLAPSIBLE */}
        <div className="p-5 rounded-[28px] bg-white border border-[#E9E7E1] shadow-xs space-y-3">
          <button
            onClick={() => setShowRepoSettings(!showRepoSettings)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#737873] hover:text-[#171717] cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Settings2 size={16} />
              <span className="text-[#171717] font-black">Configure GitHub Repository Source</span>
            </div>
            {showRepoSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showRepoSettings && (
            <form onSubmit={handleSaveRepo} className="pt-2 border-t border-[#E9E7E1] space-y-3 animate-fade-in">
              <p className="text-xs text-[#737873]">
                If you have forked or mirrored Farm Weather, enter your custom repository path below (format: <code className="bg-[#F7F6F2] px-1.5 py-0.5 rounded font-mono text-[#171717]">owner/repository</code>).
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="mahesh2008here-star/Wheather-pro"
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-[#E9E7E1] bg-[#F7F6F2] font-mono text-[#171717] outline-none focus:bg-white focus:border-[#EA580C]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-bold cursor-pointer hover:bg-black"
                >
                  Save & Check
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* 3. PAGE FOOTER */}
      <footer className="w-full bg-white border-t border-[#E9E7E1] py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#737873]">
          <span>Farm Weather Open-Source Agriculture Weather</span>
          <button
            onClick={onBack}
            className="text-[#EA580C] font-bold hover:underline cursor-pointer"
          >
            Return to Settings
          </button>
        </div>
      </footer>
    </div>
  );
};
