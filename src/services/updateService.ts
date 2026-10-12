export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
  downloadCount: number;
}

export interface ReleaseInfo {
  tagName: string;
  name: string;
  body: string;
  publishedAt: string;
  htmlUrl: string;
  apkAsset: ReleaseAsset | null;
  isNewer: boolean;
  currentVersion: string;
}

export const CURRENT_APP_VERSION = '1.2.0';
export const CURRENT_VERSION_CODE = 120;
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
  
  // Look for explicit build/code match like "+130" or "code 130"
  const codeMatch = clean.match(/(?:code|build|\+|\#)\:?\s*(\d+)/i);
  if (codeMatch && codeMatch[1]) {
    return parseInt(codeMatch[1], 10);
  }

  // Fallback to semver calculation: 1.2.0 -> 10200
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

export async function checkAppUpdates(): Promise<ReleaseInfo> {
  const { owner, repo } = getGitHubRepo();
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      // Try list releases endpoint in case no release marked as "latest"
      const listUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
      const listRes = await fetch(listUrl);
      if (listRes.ok) {
        const listData = await listRes.json();
        if (Array.isArray(listData) && listData.length > 0) {
          return parseReleaseData(listData[0]);
        }
      }
      throw new Error(`Repository or releases not found for ${owner}/${repo}`);
    } else if (response.status === 403) {
      throw new Error('GitHub API rate limit reached. Please try again later.');
    }
    throw new Error(`Failed to check updates (HTTP ${response.status})`);
  }

  const data = await response.json();
  return parseReleaseData(data);
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
  const htmlUrl = data.html_url || `https://github.com/${DEFAULT_GITHUB_REPO}/releases`;

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
      };
    }
  }

  const isNewer = compareVersions(tagName, CURRENT_APP_VERSION) > 0;

  return {
    tagName,
    name,
    body,
    publishedAt,
    htmlUrl,
    apkAsset,
    isNewer,
    currentVersion: CURRENT_APP_VERSION,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
