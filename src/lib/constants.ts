export const SITE_TITLE = "svvy";
export const SITE_DESCRIPTION =
  "Building practical products and tools on emerging tech.";

export const SITE_DOMAIN = "svvy.sh";

export const SOCIAL = {
  github: "https://github.com/svvysh",
  twitter: "https://x.com/svvysh",
  twitterHandle: "@svvysh",
  email: "contact@svvy.sh",
};

// Minimal descriptors for dynamic fetching.
// Provide the GitHub repo (owner/name) and optionally an npm package name.
// Additional display overrides are optional.
export const TOOLS = [
  {
    slug: "helm",
    repo: "svvysh/helm",
    npm: null,
    description: "A CLI/TUI to scaffold, break down, run, and track project specs with Codex worker/verifier loops.",
  },
  {
    slug: "electron-agent-tools",
    repo: "svvysh/electron-agent-tools",
    npm: "electron-agent-tools",
    description: "MCP‑free Playwright-powered CLI and TS helpers to launch, attach to, and drive Electron apps over CDP; built for automation, CI, and LLM agents.",
  },
];

export const PRODUCTS = [
  {
    slug: "origin",
    repo: "svvysh/origin",
    npm: null,
    description: "A local app for writing and researching with AI, with a fine focus on versioning and reviewing UX, that integrates well with your existing workflow.",
  },
];
