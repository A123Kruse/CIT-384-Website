// build_manifest.js — robust version
const fs = require("fs");
const path = require("path");

// Always anchor to the folder this script lives in:
const projectRoot = __dirname;
const imagesDir = path.join(projectRoot, "images");
const outputPath = path.join(imagesDir, "manifest.json");

// Which file types to include
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => {
      const full = path.join(dir, name);
      return fs.lstatSync(full).isFile() && IMAGE_EXTS.has(path.extname(name).toLowerCase());
    })
    .sort();
}

function build() {
  const manifest = {};
  const kinds = ["real", "ai"];

  kinds.forEach((kind) => {
    const kindDir = path.join(imagesDir, kind);
    if (!fs.existsSync(kindDir)) return;

    fs.readdirSync(kindDir).forEach((category) => {
      const catPath = path.join(kindDir, category);
      if (!fs.lstatSync(catPath).isDirectory()) return;

      const files = listFiles(catPath);
      if (!manifest[category]) manifest[category] = { real: [], ai: [] };
      manifest[category][kind] = files;
    });
  });

  // Ensure images/ exists, then write
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), "utf8");

  // Verify and report
  const stat = fs.statSync(outputPath);
  console.log("✅ Wrote:", outputPath);
  console.log("   Size:", stat.size, "bytes");
  console.log("   From:", projectRoot);
}

try {
  build();
} catch (e) {
  console.error("❌ Failed to write manifest:", e.message);
  process.exit(1);
}

