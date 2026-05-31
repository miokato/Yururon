// Yururon 紹介サイトのビルドスクリプト.
// `docs/` をソースとし、静的ファイルを `dist/` へコピーしつつ、
// 法的文書 (Markdown) を共通テンプレートで HTML 化する.
// Cloudflare Pages はこの `dist/` を配信する (クリーン URL により
// `dist/PrivacyPolicy/Japanese.html` は `/PrivacyPolicy/Japanese` で配信される).
import { readFile, writeFile, cp, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "docs");
const outDir = path.join(root, "dist");

// HTML 化する法的文書. [フォルダ, ファイル名 (拡張子なし)].
const legalDocs = [
  ["PrivacyPolicy", "Japanese"],
  ["PrivacyPolicy", "English"],
  ["TermsOfService", "Japanese"],
  ["TermsOfService", "English"],
];

const isJapanese = (file) => file === "Japanese";

// 法的文書 1 ページ分の HTML. ヘッダ/フッタ/スタイルは紹介サイト本体と揃える.
// 法的文書はいずれも 1 階層下に配置されるため、相対パスは `../` 基準で整合する.
function renderPage({ lang, title, bodyHtml }) {
  const ja = lang === "ja";
  const langFile = ja ? "Japanese" : "English";
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="icon" type="image/jpeg" href="../assets/icon.jpeg">
    <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <a class="logo" href="../">Yururon</a>
        </div>
    </header>

    <main>
        <article class="container legal">
${bodyHtml}
        </article>
    </main>

    <footer class="site-footer">
        <div class="container">
            <nav>
                <a href="../">${ja ? "ホーム" : "Home"}</a>
                <a href="../PrivacyPolicy/${langFile}">${ja ? "プライバシーポリシー" : "Privacy Policy"}</a>
                <a href="../TermsOfService/${langFile}">${ja ? "利用規約" : "Terms of Service"}</a>
            </nav>
            <p>&copy; 2026 miokato</p>
        </div>
    </footer>
</body>
</html>
`;
}

async function main() {
  // 出力先をクリーンに作り直す.
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  // 静的ファイルを丸ごとコピー (.md と .DS_Store は除外).
  await cp(srcDir, outDir, {
    recursive: true,
    filter: (src) => {
      const base = path.basename(src);
      if (base === ".DS_Store") return false;
      if (src.endsWith(".md")) return false;
      return true;
    },
  });

  // 法的文書を Markdown から HTML へ変換.
  for (const [folder, file] of legalDocs) {
    const md = await readFile(path.join(srcDir, folder, `${file}.md`), "utf8");
    const bodyHtml = await marked.parse(md);
    const lang = isJapanese(file) ? "ja" : "en";
    // タイトルは本文先頭の H1 から導出する.
    const h1 = md.match(/^#\s+(.+)$/m);
    const title = `${h1 ? h1[1].trim() : folder} - Yururon`;

    const outPath = path.join(outDir, folder, `${file}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, renderPage({ lang, title, bodyHtml }));
    console.log(`generated ${path.relative(root, outPath)}`);
  }

  console.log("build complete");
}

await main();
