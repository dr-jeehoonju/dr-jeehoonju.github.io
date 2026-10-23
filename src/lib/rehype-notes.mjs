// Apply reading affordances at build time, including when JavaScript is disabled.
export default function rehypeNotes() {
  return (tree, file) => {
    if (!file.path?.replaceAll("\\", "/").includes("/src/content/notes/"))
      return;

    const korean = file.data.astro?.frontmatter?.lang === "ko";
    let tableIndex = 0;
    const text = (node) =>
      node.value ?? node.children?.map(text).join("") ?? "";
    const element = (tagName, properties, children) => ({
      type: "element",
      tagName,
      properties,
      children,
    });

    function visit(parent, tableHead = false) {
      if (!parent.children) return;
      parent.children = parent.children.flatMap((node) => {
        // JSX tables in MDX have explicit captions/scopes; wrap those too.
        const tag = node.tagName ?? node.name;
        visit(node, tag === "thead" || (tableHead && tag !== "tbody"));
        if (tag === "th") {
          if (node.type === "element")
            node.properties.scope ??= tableHead ? "col" : "row";
        }
        if (tag === "table") {
          tableIndex++;
          const caption = node.children.find(
            (child) => (child.tagName ?? child.name) === "caption",
          );
          const name = caption
            ? text(caption)
            : korean
              ? `표 ${tableIndex}`
              : `Article table ${tableIndex}`;
          return [
            element(
              "div",
              {
                className: ["table-scroll"],
                tabIndex: 0,
                role: "region",
                ariaLabel: `${name}; ${korean ? "작은 화면에서는 좌우로 스크롤" : "scroll horizontally on small screens"}`,
              },
              [node],
            ),
          ];
        }
        if (tag === "pre" && node.type === "element") {
          const code = node.children.find((child) => child.tagName === "code");
          const language =
            node.properties.dataLanguage ??
            node.properties["data-language"] ??
            code?.properties?.className
              ?.find((name) => name.startsWith("language-"))
              ?.slice(9) ??
            "text";
          node.properties.tabIndex = 0;
          node.properties.ariaLabel ??= `${language.toUpperCase()} ${korean ? "코드" : "code"}`;
          return [
            element("p", { className: ["code-label"] }, [
              { type: "text", value: language.toUpperCase() },
            ]),
            node,
          ];
        }
        return [node];
      });
    }
    visit(tree);
  };
}
