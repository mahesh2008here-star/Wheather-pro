export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
  downloadCount: number;
  updatedAt: string;
}

export interface ReleaseInfo {
  tagName: string;
  name: string;
  body: string;
  publishedAt: string;
  updatedAt: string;
  htmlUrl: string;
  apkAsset: ReleaseAsset | null;
  isNewer: boolean;
  currentVersion: string;
  detectedVersion: string;
  sourceType?: 'release' | 'contents';
}

export const CURRENT_APP_VERSION = '1.2.0';
export const CURRENT_VERSION_CODE = extractVersionCode(CURRENT_APP_VERSION); // 10200
// Current app build release date threshold (UTC)
export const CURRENT_APP_BUILD_TIME = new Date('2026-10-10T13:00:00Z').getTime();

export const DEFAULT_GITHUB_REPO = 'mahesh2008here-star/Wheather-pro';

const STORAGE_KEY_CUSTOM_REPO = 'farmweather_custom_github_repo';

export function getGitHubRepo(): { owner: string; repo: string; fullPath: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_REPO);
    if (saved && saved.includes('/')) {
      const [owner, repo] = saved.trim().split('/');
      if (owner && repo) {
        return { owner, repo, fullPath: `${owner}/${repo}` };
      }
    }
  } catch {}
  
  const [owner, repo] = DEFAULT_GITHUB_REPO.split('/');
  return { owner, repo, fullPath: DEFAULT_GITHUB_REPO };
}

export function setGitHubRepo(fullPath: string): void {
  try {
    if (fullPath && fullPath.includes('/')) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_REPO, fullPath.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_REPO);
    }
  } catch {}
}

export function extractVersionCode(versionStr: string): number {
  if (!versionStr) return 0;
  const clean = versionStr.replace(/^v/i, '').trim();
  
  const codeMatch = clean.match(/(?:versionCode|code|build|\+|\#)\:?\s*(\d+)/i);
  if (codeMatch && codeMatch[1]) {
    return parseInt(codeMatch[1], 10);
  }

  const parts = clean.split(/[.-]/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
  if (parts.length >= 3) {
    return parts[0] * 10000 + parts[1] * 100 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 10000 + parts[1] * 100;
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

export function compareVersions(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/i, '').split('-')[0].split('+')[0].trim();
  const clean2 = v2.replace(/^v/i, '').split('-')[0].split('+')[0].trim();

  const parts1 = clean1.split('.').map(n => parseInt(n, 10) || 0);
  const parts2 = clean2.split('.').map(n => parseInt(n, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  const code1 = extractVersionCode(v1);
  const code2 = extractVersionCode(v2);
  if (code1 > 0 && code2 > 0) {
    if (code1 > code2) return 1;
    if (code1 < code2) return -1;
  }

  return 0;
}

/**
 * Universal, Bulletproof GitHub Update Fetcher
 * Works seamlessly in Web Browsers, Android WebViews, Capacitor Native APKs, and Server Mode.
 * - Prevents CORS preflight OPTIONS failures by omitting non-standard headers
 * - Supports Timeout Abort Controller
 * - Multi-layer fallback: Direct GitHub API -> Backend Proxy -> List Releases -> Repository Contents API
 */
export async function checkAppUpdates(): Promise<ReleaseInfo> {
  const { owner, repo } = getGitHubRepo();
  const cacheBust = Date.now();

  // Helper for fetch with timeout and CORS-safe headers
  const safeFetch = async (url: string, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      // NOTE: Do NOT add 'Cache-Control' header to avoid CORS preflight OPTIONS failure in WebView
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        },
        signal: controller.signal
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  let primaryError: any = null;

  // LAYER 1: Direct GitHub Latest Release API
  try {
    const latestUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest?_t=${cacheBust}`;
    const res = await safeFetch(latestUrl);

    if (res.ok) {
      const data = await res.json();
      return parseReleaseData(data);
    } else if (res.status === 404) {
      // LAYER 2: Try List Releases Endpoint
      const listUrl = `https://api.github.com/repos/${owner}/${repo}/releases?_t=${cacheBust}`;
      const listRes = await safeFetch(listUrl);
      if (listRes.ok) {
        const listData = await listRes.json();
        if (Array.isArray(listData) && listData.length > 0) {
          // Find the highest version release in the list
          return findHighestRelease(listData);
        }
      }
    } else if (res.status === 403) {
      throw new Error('GitHub API rate limit reached. Please try again in a few minutes.');
    }
  } catch (err: any) {
    primaryError = err;
    console.warn('Direct GitHub fetch note, attempting proxy/fallback layers:', err);
  }

  // LAYER 3: Backend Express Proxy Route (/api/updates)
  try {
    const proxyUrl = `/api/updates?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&_t=${cacheBust}`;
    const proxyRes = await safeFetch(proxyUrl, 5000);
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.success && json.data) {
        if (json.isContents && Array.isArray(json.data)) {
          return parseContentsData(json.data, owner, repo);
        } else if (Array.isArray(json.data) && json.data.length > 0) {
          return findHighestRelease(json.data);
        } else if (json.data.tag_name || json.data.assets) {
          return parseReleaseData(json.data);
        }
      }
    }
  } catch (proxyErr) {
    console.warn('Proxy layer note:', proxyErr);
  }

  // LAYER 4: Repository Contents API Lookup for direct APK files in repo folders
  try {
    const contentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents?_t=${cacheBust}`;
    const contentsRes = await safeFetch(contentsUrl);
    if (contentsRes.ok) {
      const contentsData = await contentsRes.json();
      if (Array.isArray(contentsData)) {
        return parseContentsData(contentsData, owner, repo);
      }
    }
  } catch (contentsErr) {
    console.warn('Contents API note:', contentsErr);
  }

  if (primaryError?.name === 'AbortError') {
    throw new Error('Connection timed out while checking for updates. Please try again.');
  }

  if (primaryError?.message && !primaryError.message.includes('fetch')) {
    throw primaryError;
  }

  throw new Error(`Couldn't connect to GitHub repository (${owner}/${repo}). Please verify network connection or repository path.`);
}

function findHighestRelease(releases: any[]): ReleaseInfo {
  if (!releases || releases.length === 0) {
    throw new Error('No releases found in repository.');
  }

  // Sort releases by semver in descending order (highest version first)
  const sorted = [...releases].sort((a, b) => {
    const tagA = a.tag_name || 'v0.0.0';
    const tagB = b.tag_name || 'v0.0.0';
    return compareVersions(tagB, tagA);
  });

  return parseReleaseData(sorted[0]);
}

function parseContentsData(contents: any[], owner: string, repo: string): ReleaseInfo {
  const apkFiles = contents.filter((item: any) => 
    item.type === 'file' && item.name?.toLowerCase().endsWith('.apk')
  );

  if (apkFiles.length === 0) {
    throw new Error(`No published releases or downloadable .apk files found in ${owner}/${repo}.`);
  }

  const apk = apkFiles[0];
  const semverMatch = apk.name.match(/v?(\d+\.\d+(?:\.\d+)?)/i);
  const detectedVersion = semverMatch ? semverMatch[1] : CURRENT_APP_VERSION;
  const isNewer = compareVersions(detectedVersion, CURRENT_APP_VERSION) > 0;

  return {
    tagName: detectedVersion,
    name: `Direct Repository Build (${apk.name})`,
    body: `This APK build was discovered directly in the ${owner}/${repo} repository files.`,
    publishedAt: 'Recently',
    updatedAt: new Date().toLocaleString(),
    htmlUrl: apk.html_url || `https://github.com/${owner}/${repo}`,
    apkAsset: {
      name: apk.name,
      downloadUrl: apk.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/main/${apk.path}`,
      size: apk.size || 0,
      downloadCount: 0,
      updatedAt: new Date().toLocaleString()
    },
    isNewer,
    currentVersion: CURRENT_APP_VERSION,
    detectedVersion,
    sourceType: 'contents'
  };
}

function parseReleaseData(data: any): ReleaseInfo {
  const tagName = data.tag_name || 'v1.0.0';
  const name = data.name || tagName;
  const body = data.body || 'No release notes provided.';
  const publishedAt = data.published_at ? new Date(data.published_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Recently';

  const updatedAtRaw = data.updated_at || data.published_at || data.created_at;
  const releaseTime = updatedAtRaw ? new Date(updatedAtRaw).getTime() : Date.now();
  const updatedAt = updatedAtRaw ? new Date(updatedAtRaw).toLocaleString() : 'Recently';

  const { owner, repo } = getGitHubRepo();
  const htmlUrl = data.html_url || `https://github.com/${owner}/${repo}/releases`;

  let apkAsset: ReleaseAsset | null = null;

  if (Array.isArray(data.assets)) {
    const foundApk = data.assets.find((asset: any) => 
      asset.name?.toLowerCase().endsWith('.apk') ||
      asset.content_type === 'application/vnd.android.package-archive'
    );

    if (foundApk) {
      apkAsset = {
        name: foundApk.name,
        downloadUrl: foundApk.browser_download_url,
        size: foundApk.size || 0,
        downloadCount: foundApk.download_count || 0,
        updatedAt: foundApk.updated_at ? new Date(foundApk.updated_at).toLocaleString() : updatedAt,
      };
    }
  }

  // Extract explicit semver version from tagName, name, or body
  const semverMatch = (tagName + ' ' + name + ' ' + body).match(/v?(\d+\.\d+(?:\.\d+)?)/i);
  const detectedVersion = semverMatch ? semverMatch[1] : (tagName.toLowerCase() !== 'latest' ? tagName : CURRENT_APP_VERSION);

  // Extract candidate versionCode from release text/metadata
  const candidateVersionCode = extractVersionCode(detectedVersion) || extractVersionCode(tagName) || extractVersionCode(name);

  // Compare candidate version against installed version
  let isNewer = false;
  if (candidateVersionCode > CURRENT_VERSION_CODE) {
    isNewer = true;
  } else if (compareVersions(detectedVersion, CURRENT_APP_VERSION) > 0) {
    isNewer = true;
  } else if (compareVersions(tagName, CURRENT_APP_VERSION) > 0) {
    isNewer = true;
  }

  return {
    tagName,
    name,
    body,
    publishedAt,
    updatedAt,
    htmlUrl,
    apkAsset,
    isNewer,
    currentVersion: CURRENT_APP_VERSION,
    detectedVersion,
    sourceType: 'release'
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
