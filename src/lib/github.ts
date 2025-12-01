// Types
export type GitHubRepoInfo = {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  homepage: string | null
  default_branch: string
  html_url: string
  clone_url: string
  ssh_url: string
  visibility?: string
  license: {
    key: string
    name: string
    spdx_id: string
    url: string | null
    node_id: string
  } | null
  topics?: string[]
  language: string | null
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
    type: string
  }
}

export type GitHubTag = {
  name: string
  commit: { sha: string; url: string }
  zipball_url: string
  tarball_url: string
  node_id: string
}

export type NpmPackageInfo = {
  name: string
  description?: string
  'dist-tags': { latest?: string; [tag: string]: string | undefined }
}

export type RepoConfig = {
  slug: string
  repo: string
  description: string
  npm?: string | null
  displayName?: string | null
}

export type RepoCardData = {
  title: string
  description: string
  version?: string | undefined
  unreleased?: boolean | undefined
  versionSource?: 'npm' | 'git' | 'unreleased' | undefined
  stars?: number | undefined
  lastUpdated?: string | undefined
  githubUrl?: string | undefined
  npmUrl?: string | undefined
  mainUrl?: string | undefined
  primaryLanguage?: string | undefined
  license?: string | undefined
  openIssues?: number | undefined
  tags?: string[] | undefined
}

// Fetch helpers with optional GitHub token
const baseHeaders = {
  'User-Agent': 'svvy-website',
  Accept: 'application/vnd.github+json',
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const headers = {
    ...baseHeaders,
    ...(import.meta.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` }
      : {}),
  }
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`fetch failed ${res.status} ${res.statusText} for ${url} ${body}`)
  }
  return res.json() as Promise<T>
}

async function buildRepoCard(config: RepoConfig): Promise<RepoCardData> {
  const base: RepoCardData = {
    title: config.displayName ?? config.slug,
    description: config.description ?? null,
    versionSource: 'unreleased',
    tags: [],
  }

  // GitHub repo info
  try {
    const repo = await fetchJson<GitHubRepoInfo>(`https://api.github.com/repos/${config.repo}`)
    base.title = config.displayName ?? repo.name ?? config.slug
    base.stars = repo.stargazers_count
    base.lastUpdated = repo.pushed_at
    base.githubUrl = repo.html_url
    base.mainUrl = repo.homepage || undefined
    base.primaryLanguage = repo.language ?? undefined
    base.license = repo.license?.spdx_id ?? repo.license?.name ?? undefined
    base.openIssues = repo.open_issues_count
    base.tags = repo.topics ?? []
  } catch (_err) {
    // keep fallback data
  }

  // Latest git tag
  const tags = await fetchJson<GitHubTag[]>(
    `https://api.github.com/repos/${config.repo}/tags?per_page=1`,
  )
  if (Array.isArray(tags) && tags.length > 0) {
    base.version = tags[0]?.name ?? ''
    base.versionSource = 'git'
  }

  // NPM info
  if (config.npm) {
    const npm = await fetchJson<NpmPackageInfo>(`https://registry.npmjs.org/${config.npm}`)
    const npmVersion = npm['dist-tags']?.latest
    if (npmVersion) {
      base.version = npmVersion
      base.versionSource = 'npm'
    }
    base.npmUrl = `https://npmjs.com/${config.npm}`
  }

  if (!base.version) {
    base.unreleased = true
    base.versionSource = 'unreleased'
  }

  return base
}

export async function fetchRepoCards(configs: RepoConfig[]): Promise<RepoCardData[]> {
  return Promise.all(
    configs.map(async (cfg) => {
      try {
        return await buildRepoCard(cfg)
      } catch (err) {
        console.error(`[github] failed for ${cfg.repo}:`, err)
        return {
          title: cfg.displayName ?? cfg.slug,
          description: cfg.description,
          githubUrl: `https://github.com/${cfg.repo}`,
          npmUrl: cfg.npm ? `https://npmjs.com/${cfg.npm}` : undefined,
          tags: [],
        } satisfies RepoCardData
      }
    }),
  )
}
