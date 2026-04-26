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

const commitPartial = `- {{#if displayType}}{{displayType}}{{#if scope}}({{scope}}){{/if}}: {{/if}}{{#if subject}}{{~subject}}{{else}}{{~header}}{{/if}}{{#if hash}}{{#if @root.linkReferences}} — [\`{{shortHash}}\`]({{~@root.host}}/{{#if this.owner}}{{~this.owner}}{{else}}{{~@root.owner}}{{/if}}/{{#if this.repository}}{{~this.repository}}{{else}}{{~@root.repository}}{{/if}}/commit/{{hash}}){{else}} — {{shortHash}}{{/if}}{{/if}}

{{~#if references~}}
{{~#unless isRoadmapReference~}}
  , {{#if referenceAction}}{{referenceAction}}{{else}}closes{{/if}}
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
{{~/unless~}}
{{~/if}}

`;

/**
 * Preset for `@semantic-release/release-notes-generator` `config` option:
 * version as the main header, then ### What's Changed, then list items with — [`hash`](url).
 */
export default function changelogPreset() {
  const base = createPreset({ types });
  const baseTransform = base.writer.transform;

  return {
    commits: base.commits,
    parser: base.parser,
    writer: {
      ...base.writer,
      mainTemplate,
      headerPartial: base.writer.headerPartial,
      commitPartial,
      transform(commit, context) {
        const rawHeader = String(commit.header ?? "");
        const rendered = baseTransform ? baseTransform(commit, context) : commit;
        if (!rendered) return rendered;
        const text = `${rendered.subject ?? ""} ${rendered.header ?? ""}`;
        const isRoadmapReference = /\broadmap\s*#\d+\b/i.test(text);
        rendered.referenceAction = isRoadmapReference ? "roadmap" : "closes";
        rendered.isRoadmapReference = isRoadmapReference;
        const conventionalMatch = rawHeader.match(/^([a-z]+)(?:\(([^)]+)\))?:\s/i);
        if (conventionalMatch) {
          rendered.displayType = conventionalMatch[1].toLowerCase();
          if (!rendered.scope && conventionalMatch[2]) {
            rendered.scope = conventionalMatch[2];
          }
        } else if (typeof rendered.type === "string") {
          rendered.displayType = rendered.type.toLowerCase();
        } else {
          rendered.displayType = "change";
        }
        return rendered;
      },
    },
  };
}
