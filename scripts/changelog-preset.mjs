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

/**
 * Keep compare URL on root context only (semantic-release sets host/owner/repository/previousTag/currentTag).
 * Nested `{{#if owner}}` blobs inside the markdown link confused Handlebars in some environments.
 */
function bracketHeaderPartial() {
  return `## [{{version}}]({{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}){{~#if title}} "{{title}}"{{~/if}}{{~#if date}} ({{date}}){{/if}}\n`;
}

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
{{#each commits}}{{> commit root=@root}}{{/each}}
{{/each}}
{{> footer}}
`;

function conventionalRest(header) {
  const raw = String(header ?? "").trim();
  const m = raw.match(/^[a-z]+(?:\([^)]*\))?:\s*(.*)$/i);
  return m ? m[1].trim() : raw;
}

function lowerSentence(s) {
  const t = s.trim();
  return t.length === 0 ? t : t.charAt(0).toLowerCase() + t.slice(1);
}

/** Avoid `added add …` when the commit subject already starts with add/added/… */
function stripRedundantLeadingVerb(sentence, verbs) {
  let s = sentence.trim();
  for (const v of verbs) {
    const re = new RegExp(`^${v}\\s+`, "i");
    if (re.test(s)) {
      s = s.replace(re, "").trim();
      break;
    }
  }
  return s.length ? lowerSentence(s) : lowerSentence(sentence);
}

function resolvedOwnerRepo(ref, defaultOwner, defaultRepo) {
  const owner =
    ref.owner != null && String(ref.owner).trim() !== "" ? String(ref.owner) : defaultOwner;
  const repo =
    ref.repository != null && String(ref.repository).trim() !== ""
      ? String(ref.repository)
      : defaultRepo;
  return { owner, repo };
}

/** GitHub-style line suffix: `closes ([#34](url)), ([#35](url))` */
function buildIssueRefsMarkdown(references, context, referenceAction, isRoadmapReference) {
  if (isRoadmapReference || !Array.isArray(references) || references.length === 0) {
    return "";
  }

  const host = String(context?.host ?? "").replace(/\/$/, "");
  const defaultOwner = String(context?.owner ?? "");
  const defaultRepo = String(context?.repository ?? "");
  const linkRefs = context?.linkReferences !== false;

  const chunks = [];
  for (const ref of references) {
    const { owner, repo } = resolvedOwnerRepo(ref, defaultOwner, defaultRepo);
    const issue = String(ref.issue ?? "").trim();
    if (!issue) continue;
    const prefix = ref.prefix != null ? String(ref.prefix) : "#";
    const url = `${host}/${owner}/${repo}/issues/${issue}`;
    const sameRepo = owner === defaultOwner && repo === defaultRepo;
    const label = sameRepo ? `${prefix}${issue}` : `${owner}/${repo}${prefix}${issue}`;
    if (linkRefs) chunks.push(`([${label}](${url}))`);
    else chunks.push(`(${label})`);
  }

  if (chunks.length === 0) return "";

  const verb = referenceAction && referenceAction !== "roadmap" ? referenceAction : "closes";
  return ` ${verb} ${chunks.join(", ")}`;
}

function friendlyChangeLine(type, header) {
  const rest = conventionalRest(header);
  if (!rest) return header;
  const sentence = lowerSentence(rest);
  const t = String(type ?? "change").toLowerCase();

  if (t === "feat" || t === "feature") {
    const body = stripRedundantLeadingVerb(sentence, ["added", "add", "adds"]);
    return `added ${body}`;
  }
  if (t === "fix") {
    const body = stripRedundantLeadingVerb(sentence, ["fixed", "fix", "fixes"]);
    return `fixed ${body}`;
  }
  if (t === "perf") {
    const body = stripRedundantLeadingVerb(sentence, [
      "improved",
      "improve",
      "optimizes",
      "optimize",
      "optimized",
      "reduced",
      "reduce",
      "reduces",
    ]);
    return `improved ${body}`;
  }
  if (t === "revert") {
    const body = stripRedundantLeadingVerb(sentence, ["reverted", "revert"]);
    return `reverted ${body}`;
  }
  return `${t}: ${sentence}`;
}

/** Trailing newline only — each iteration abuts in mainTemplate so bullets stay single-spaced. */
const commitPartial = `- {{subject}}{{#if hash}}{{#if @root.linkReferences}} — [\`{{shortHash}}\`]({{~@root.host}}/{{#if this.owner}}{{~this.owner}}{{else}}{{~@root.owner}}{{/if}}/{{#if this.repository}}{{~this.repository}}{{else}}{{~@root.repository}}{{/if}}/commit/{{hash}}){{else}} — \`{{shortHash}}\`{{/if}}{{/if}}{{{issueRefsLine}}}
`;

export default function changelogPreset() {
  const base = createPreset({ types });
  const baseTransform = base.writer.transform;

  return {
    commits: base.commits,
    parser: base.parser,
    writer: {
      ...base.writer,
      mainTemplate,
      headerPartial: bracketHeaderPartial(),
      commitPartial,
      transform(commit, context) {
        const rawHeader = String(commit.header ?? "");
        const rendered = baseTransform ? baseTransform(commit, context) : commit;
        if (!rendered) return rendered;
        const text = `${rendered.subject ?? ""} ${rendered.header ?? ""}`;
        const isRoadmapReference = /\broadmap\s*#\d+\b/i.test(text);
        rendered.referenceAction = isRoadmapReference ? "roadmap" : "closes";
        rendered.isRoadmapReference = isRoadmapReference;

        // Writer sets `rendered.type` to the changelog section title (e.g. "What's Changed"), not "feat".
        const conventionalType =
          String(commit.revert ? "revert" : commit.type || "")
            .toLowerCase()
            .trim() ||
          rawHeader.match(/^([a-z]+)(?:\([^)]*\))?:/i)?.[1]?.toLowerCase() ||
          "change";

        rendered.subject = friendlyChangeLine(conventionalType, rawHeader);

        // Drop junk refs like `41/#42` → owner `41`, which breaks GitHub URLs.
        if (Array.isArray(rendered.references)) {
          rendered.references = rendered.references.filter((r) => {
            const o = r.owner != null ? String(r.owner) : "";
            if (/^\d+$/.test(o)) return false;
            return true;
          });
        }

        rendered.issueRefsLine = buildIssueRefsMarkdown(
          rendered.references,
          context,
          rendered.referenceAction,
          rendered.isRoadmapReference,
        );

        return rendered;
      },
    },
  };
}
