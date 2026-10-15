import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const data = JSON.parse(fs.readFileSync("src/lib/care-content.json"));
const manifest = JSON.parse(fs.readFileSync("docs/source-manifest.json"));
test("every published treatment and concern has exactly one original guide", () => {
  assert.equal(new Set(data.map((x) => x.sourcePath)).size, data.length);
  assert.deepEqual(data.map((x) => x.sourcePath).sort(), manifest.paths.sort());
  for (const item of data) {
    assert.ok(item.sections.length >= 4, item.slug);
    assert.equal(item.questions.length, 3);
    assert.ok(item.intro.length > 50);
  }
});
const files = fs
  .readdirSync("dist", { recursive: true })
  .filter((x) => x.endsWith(".html"));
test("all local links resolve, excluding separately hosted errata project", () => {
  for (const file of files) {
    const html = fs.readFileSync(path.join("dist", file), "utf8");
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
      if (href.startsWith("/errata/") || href.startsWith("//")) continue;
      const target = path.join("dist", decodeURI(href));
      assert.ok(
        fs.existsSync(target) || fs.existsSync(path.join(target, "index.html")),
        `${file} -> ${href}`,
      );
    }
  }
});
test("care pages expose canonical source context and a general clinic booking", () => {
  for (const item of data) {
    const folder = item.kind === "concern" ? "concerns" : "treatments";
    const html = fs.readFileSync(
      `dist/care/${folder}/${item.slug}/index.html`,
      "utf8",
    );
    assert.match(html, /rel="canonical"/);
    assert.ok(html.includes(`https://tuneclinic-global.com${item.sourcePath}`));
    assert.ok(/not\s+commit you to treatment/.test(html));
    assert.ok(!html.includes("undefined"));
  }
});
test("receipt is noindex and does not blindly claim booking confirmation", () => {
  const html = fs.readFileSync("dist/book/received/index.html", "utf8");
  assert.match(html, /noindex,follow/);
  assert.match(html, /This page alone does not confirm receipt/);
});
test("domain remains configured and errata is not shadowed", () => {
  assert.equal(fs.readFileSync("dist/CNAME", "utf8").trim(), "jeehoonju.com");
  assert.ok(!fs.existsSync("dist/errata"));
});
