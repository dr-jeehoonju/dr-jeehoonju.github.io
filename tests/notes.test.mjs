import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const project = fileURLToPath(new URL("../", import.meta.url));

test(
  "built notes preserve frontmatter, archive ordering and reading components",
  { timeout: 120_000 },
  () => {
    // Build an isolated copy: fixture articles never enter the real site's output.
    const root = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "notes-build-")),
    );
    try {
      for (const name of [
        "src",
        "public",
        "astro.config.mjs",
        "package.json",
        "tsconfig.json",
      ]) {
        fs.cpSync(path.join(project, name), path.join(root, name), {
          recursive: true,
        });
      }
      fs.symlinkSync(
        path.join(project, "node_modules"),
        path.join(root, "node_modules"),
        "dir",
      );
      const writeNote = (name, frontmatter, body = "Fixture body.") => {
        fs.writeFileSync(
          path.join(root, "src/content/notes", name),
          `---\n${frontmatter}\n---\n\n${body}\n`,
        );
      };
      writeNote(
        "fixture-ko.mdx",
        `title: 진료실에서 시작되는 질문
description: 더 나은 대화를 위한 질문과 기록.
category: Fixture · Building
date: "2026-10-23"
tags: [" 소통 ", building, 소통]
lang: ko
canonical: https://jeehoonju.com/notes/canonical-fixture/
republished:
  - name: Published fixture
    url: https://example.com/published-fixture`,
        `import NoteFigure from '../../components/NoteFigure.astro';

한국어 본문은 질문에서 시작합니다.

## 대화를 위한 기록

<NoteFigure src="/images/clinic.webp" alt="대기 공간의 의자" width={960} height={640} caption="공간에 관한 기록." />

| 질문 | 기록 |
| --- | --- |
| 처음의 질문 | 다음 대화를 위한 기록 |

<table><caption>질문 정리</caption><thead><tr><th scope="col">질문</th><th scope="col">기록</th></tr></thead><tbody><tr><th scope="row">처음</th><td>다음</td></tr></tbody></table>

~~~yaml
question: 다음 대화를 더 쉽게 만드는 것은 무엇일까?
status: open
~~~`,
      );
      writeNote(
        "fixture-tie.mdx",
        `title: Same date fixture
description: Stable ordering.
category: Fixture · Building
date: 2026-10-23`,
      );
      writeNote(
        "fixture-older.md",
        `title: Earlier Markdown fixture
description: Markdown support.
category: Fixture · Earlier
date: "2026-10-20"`,
        `| Question | Record |
| --- | --- |
| First question | A working note |`,
      );
      writeNote(
        "fixture-draft.mdx",
        `title: Hidden draft fixture
description: Must not be published.
category: Draft-only category
date: "2026-10-24"
draft: true`,
      );

      try {
        execFileSync(
          process.execPath,
          [
            path.join(project, "node_modules/astro/bin/astro.mjs"),
            "build",
            "--root",
            root,
          ],
          {
            cwd: root,
            env: {
              ...process.env,
              ASTRO_TELEMETRY_DISABLED: "1",
              TZ: "America/Los_Angeles",
            },
            stdio: "pipe",
          },
        );
      } catch (error) {
        throw new Error(
          `Fixture build failed:\n${error.stdout ?? ""}\n${error.stderr ?? ""}`,
          { cause: error },
        );
      }

      const read = (slug) =>
        fs.readFileSync(
          path.join(root, "dist/notes", slug, "index.html"),
          "utf8",
        );
      const korean = read("fixture-ko");
      assert.match(
        korean,
        /<link rel="canonical" href="https:\/\/jeehoonju\.com\/notes\/canonical-fixture\/"/,
      );
      assert.equal([...korean.matchAll(/rel="canonical"/g)].length, 1);
      assert.match(korean, /<html lang="ko"/);
      assert.match(korean, /<article[^>]*lang="ko"/);
      assert.match(
        korean,
        /<time datetime="2026-10-23">2026년 10월 23일<\/time>/,
      );
      assert.match(
        read("fixture-tie"),
        /<time datetime="2026-10-23">23 Oct 2026<\/time>/,
      );
      assert.match(read("fixture-older"), /class="table-scroll" tabindex="0"/);
      assert.match(
        korean,
        /<figure>\s*<img[^>]*alt="대기 공간의 의자"[^>]*width="960"[^>]*height="640"[^>]*loading="lazy"[^>]*>\s*<figcaption>공간에 관한 기록\.<\/figcaption>/,
      );
      assert.match(
        korean,
        /class="table-scroll" tabindex="0" role="region" aria-label="[^"]+"/,
      );
      assert.match(korean, /<th scope="col">질문<\/th>/);
      assert.match(korean, /<caption>질문 정리<\/caption>/);
      assert.match(korean, /<p class="code-label">YAML<\/p>/);
      assert.match(korean, /<pre[^>]*tabindex="0"[^>]*aria-label="YAML 코드"/);
      assert.match(
        korean,
        /International Director, Tune Clinic Seoul · CEO, AetherHeal/,
      );
      assert.match(korean, /I write these notes so you can\s+make an informed choice/);
      assert.match(korean, /href="https:\/\/wa\.me\/821098748575"/);
      assert.match(korean, /href="https:\/\/line\.me\/ti\/p\/S_ewS8UAKv"/);
      assert.match(korean, /href="https:\/\/t\.me\/drjeeju"/);
      assert.match(korean, /href="mailto:drjeeju@aetherheal\.com"/);
      assert.match(korean, /14 Nonhyeon-ro 176-gil/);
      assert.match(korean, /class="clinic-figure"[^]*src="\/images\/tune-clinic-lobby-logo\.webp"/);
      assert.doesNotMatch(korean, /author-clinic-photo/);
      assert.match(korean, /Sun closed\s+\(KST\)/);
      assert.match(
        korean,
        /class="republished"[^]*href="https:\/\/example\.com\/published-fixture">Published fixture<\/a>/,
      );
      assert.doesNotMatch(korean, /LinkedIn|Medium|publication pending/);

      const schemas = [
        ...korean.matchAll(
          /<script type="application\/ld\+json">([^]*?)<\/script>/g,
        ),
      ].map(([, json]) => JSON.parse(json));
      const article = schemas.find((schema) => schema["@type"] === "Article");
      assert.equal(article.author.name, "Jee Hoon Ju");
      assert.equal(
        article.url,
        "https://jeehoonju.com/notes/canonical-fixture/",
      );
      assert.equal(article.inLanguage, "ko");
      assert.equal(article.datePublished, "2026-10-23");
      assert.deepEqual(article.keywords, ["소통", "building"]);

      const archive = read("");
      const slugs = [
        ...archive.matchAll(/<h2>\s*<a href="\/notes\/([^/]+)\/"/g),
      ].map(([, slug]) => slug);
      // Real notes are added over time; assert the relative order of the
      // known set instead of the full archive list.
      const expectedOrder = [
        "fixture-ko",
        "fixture-tie",
        "fixture-older",
        "before-choosing-a-treatment",
        "evidence-and-experience",
      ];
      assert.deepEqual(
        slugs.filter((slug) => expectedOrder.includes(slug)),
        expectedOrder,
      );
      assert.match(archive, /data-filter="Fixture · Building"/);
      assert.match(archive, /class="filters"[^>]*hidden/);
      assert.doesNotMatch(archive, /Hidden draft fixture|Draft-only category/);
      assert.ok(!fs.existsSync(path.join(root, "dist/notes/fixture-draft")));
      for (const slug of [
        "before-choosing-a-treatment",
        "evidence-and-experience",
      ]) {
        const html = read(slug);
        assert.match(html, /<html lang="en"/);
        assert.match(html, /class="prose">\s*<p>/);
        assert.match(html, /Undated/);
        assert.doesNotMatch(html, /class="republished"/);
        assert.match(
          html,
          new RegExp(
            `<link rel="canonical" href="https://jeehoonju.com/notes/${slug}/"`,
          ),
        );
      }
      if (process.env.NOTES_TEST_OUTPUT) {
        fs.cpSync(path.join(root, "dist"), process.env.NOTES_TEST_OUTPUT, {
          recursive: true,
        });
      }
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  },
);
