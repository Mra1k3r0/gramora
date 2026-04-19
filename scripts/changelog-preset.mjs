import createPreset from "conventional-changelog-conventionalcommits";

const types = [
  { type: "feat", section: "What's Changed" },
  { type: "feature", section: "What's Changed" },
  { type: "fix", section: "What's Changed" },
  { type: "perf", section: "What's Changed" },
  { type: "revert", section: "What's Changed" },
  { type: "docs", section: "Documentation", hidden: true },
  { type: "style", section: "Styles", hidden: true },
  { type: "chore", section: "Miscellaneous Chores", hidden: true },
  { type: "refactor", section: "Code Refactoring", hidden: true },
  { type: "test", section: "Tests", hidden: true },
  { type: "build", section: "Build System", hidden: true },
  { type: "ci", section: "Continuous Integration", hidden: true },
];

const mainTemplate = `{{> header}}

### What's Changed

{{#if noteGroups}}
{{#each noteGroups}}

### ⚠ {{title}}

{{#each notes}}
- {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}
{{/each}}
{{/each}}
{{/if}}
{{#each commitGroups}}
{{#each commits}}
{{> commit root=@root}}
{{/each}}
{{/each}}
{{> footer}}
`;

const commitPartial = `- {{#if scope}}**{{scope}}:** {{/if}}{{#if subject}}{{~subject}}{{else}}{{~header}}{{/if}}{{#if hash}}{{#if @root.linkReferences}} — [\`{{shortHash}}\`]({{~@root.host}}/{{#if this.owner}}{{~this.owner}}{{else}}{{~@root.owner}}{{/if}}/{{#if this.repository}}{{~this.repository}}{{else}}{{~@root.repository}}{{/if}}/commit/{{hash}}){{else}} — {{shortHash}}{{/if}}{{/if}}

{{~#if references~}}
  , closes
  {{~#each references}} {{#if @root.linkReferences~}}
    [
    {{~#if this.owner}}
      {{~this.owner}}/
    {{~/if}}
    {{~this.repository}}{{this.prefix}}{{this.issue}}]({{~@root.host}}/{{#if this.owner}}{{~this.owner}}{{else}}{{~@root.owner}}{{/if}}/{{#if this.repository}}{{~this.repository}}{{else}}{{~@root.repository}}{{/if}}/issues/{{this.issue}})
  {{~else}}
    {{~#if this.owner}}
      {{~this.owner}}/
    {{~/if}}
    {{~this.repository}}{{this.prefix}}{{this.issue}}
  {{~/if}}{{/each}}
{{~/if}}

`;

/**
 * Preset for `@semantic-release/release-notes-generator` `config` option:
 * version as the main header, then ### What's Changed, then list items with — [`hash`](url).
 */
export default function changelogPreset() {
  const base = createPreset({ types });

  return {
    commits: base.commits,
    parser: base.parser,
    writer: {
      ...base.writer,
      mainTemplate,
      headerPartial: base.writer.headerPartial,
      commitPartial,
    },
  };
}
