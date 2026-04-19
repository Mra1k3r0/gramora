/**
 * @see https://semantic-release.gitbook.io/semantic-release
 * Use conventional commits (e.g. fix:, feat:, BREAKING CHANGE:) so the analyzer can pick the next semver.
 */
export default {
  branches: ["master", "main"],
  tagFormat: "v${version}",
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        config: "./scripts/changelog-preset.mjs",
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    ["@semantic-release/npm", { npmPublishArgs: ["--access", "public"] }],
    [
      "@semantic-release/github",
      {
        successComment: false,
        failComment: false,
        releasedLabels: false,
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
