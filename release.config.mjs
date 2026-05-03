/** Conventional commits drive semver; releases run manually so unreleased commits batch up. @see release.yml */
export default {
  branches: ["master", "main"],
  tagFormat: "v${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { breaking: true, release: "major" },
          { revert: true, release: "patch" },
          { type: "feat", release: "minor" },
          { type: "perf", release: "patch" },
          { type: "fix", release: false },
          { type: "fix", scope: "core", release: "patch" },
          { type: "fix", scope: "api", release: "patch" },
          { type: "fix", scope: "router", release: "patch" },
          { type: "fix", scope: "transport", release: "patch" },
          { type: "fix", scope: "middleware", release: "patch" },
          { type: "fix", scope: "session", release: "patch" },
          { type: "fix", scope: "security", release: "patch" },
          { type: "fix", scope: "deps", release: false },
          { type: "docs", release: false },
          { type: "style", release: false },
          { type: "refactor", release: false },
          { type: "test", release: false },
          { type: "build", release: false },
          { type: "chore", release: false },
          { scope: "no-release", release: false },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      /** Writer templates live in ./scripts/changelog-preset.mjs (avoid duplicating writerOpts here). */
      { config: "./scripts/changelog-preset.mjs" },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: "# Changelog",
      },
    ],
    ["@semantic-release/npm", { npmPublish: true }],
    [
      "@semantic-release/github",
      {
        successComment: false,
        failComment: false,
        releasedLabels: false,
        /** Full notes stay in CHANGELOG.md; keep the GitHub release body to the preset header line + pointer. */
        releaseBodyTemplate:
          '<%= nextRelease.notes.trim().split("\n")[0] %>\n\nSee [`CHANGELOG.md`](<%= options.repositoryUrl.replace(/\\.git$/i, "").replace(/^git@([^:]+):(.+)$/, "https://$1/$2") %>/blob/<%= nextRelease.gitHead %>/CHANGELOG.md) for changes.',
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]",
      },
    ],
  ],
};
