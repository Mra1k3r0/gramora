import createPreset from "conventional-changelog-conventionalcommits";

const types = [
  { type: "feat", section: "what's changed" },
  { type: "feature", section: "what's changed" },
  { type: "fix", section: "what's changed" },
  { type: "perf", section: "what's changed" },
  { type: "revert", section: "what's changed" },
  { type: "docs", section: "Documentation", hidden: true },
  { type: "style", section: "Styles", hidden: true },
  { type: "chore", section: "Miscellaneous Chores", hidden: true },
  { type: "refactor", section: "Code Refactoring", hidden: true },
  { type: "test", section: "Tests", hidden: true },
  { type: "build", section: "Build System", hidden: true },
  { type: "ci", section: "Continuous Integration", hidden: true },
];

const mainTemplate = `{{> header}}
{{#if noteGroups}}
{{#each noteGroups}}

### ⚠ {{title}}

{{#each notes}}
* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}
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

/**
 * Preset for `@semantic-release/release-notes-generator` `config` option:
 * one "## what's changed" section, no per-type subheadings, lowercase subjects.
 */
export default function changelogPreset() {
  const base = createPreset({ types });
  const baseTransform = base.writer.transform;

  const headerPartial = `## what's changed

${base.writer.headerPartial.replace(/^##/m, "###")}`;

  return {
    commits: base.commits,
    parser: base.parser,
    writer: {
      ...base.writer,
      mainTemplate,
      headerPartial,
      transform(commit, context) {
        const out = baseTransform(commit, context);
        if (out?.subject) {
          out.subject = String(out.subject).toLowerCase();
        }
        return out;
      },
    },
  };
}
