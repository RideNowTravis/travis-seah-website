// Builds the website from content.json into ./dist. Plain Node.js, no packages.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function initials(name) { return String(name || "").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }
function pad(n) { return String(n).padStart(2, "0"); }

function findPlaceholders(obj, at = "", out = []) {
  if (typeof obj === "string") { const m = obj.match(/\[[^\]]+\]/g); if (m && !at.startsWith("_")) out.push(`${at}: ${m.join(", ")}`); }
  else if (Array.isArray(obj)) obj.forEach((v, i) => findPlaceholders(v, `${at}[${i}]`, out));
  else if (obj && typeof obj === "object") Object.keys(obj).forEach((k) => findPlaceholders(obj[k], at ? `${at}.${k}` : k, out));
  return out;
}

function render(c) {
  const a = c.agent;
  const wa = String(a.whatsapp).replace(/\D/g, "");
  const waLink = wa ? `https://wa.me/${wa}` : "#contact";
  const tel = String(a.phoneDisplay).replace(/[^\d+]/g, "");
  const year = new Date().getFullYear();
  const badgeText = (c.hero.badge || "").repeat(3);
  const marquee = c.marquee.concat(c.marquee).map((m) => `<span>${esc(m)}</span>`).join("");
  const rows = (items) => items.map((it, i) => `
        <li class="row">
          <span class="n">${pad(i + 1)}</span>
          <h3>${esc(it.title)}</h3>
          <span class="tag">${esc(it.tag)}</span>
          <p>${esc(it.text)}</p>
        </li>`).join("");
  const rowsNoNum = (items) => items.map((it) => `
        <li class="row">
          <span class="n" aria-hidden="true">—</span>
          <h3>${esc(it.title)}</h3>
          <span class="tag">${esc(it.tag)}</span>
          <p>${esc(it.text)}</p>
        </li>`).join("");

  return `<!doctype html>
<html lang="en-SG">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.meta.title)}</title>
<meta name="description" content="${esc(c.meta.description)}">
<meta property="og:title" content="${esc(c.meta.title)}">
<meta property="og:description" content="${esc(c.meta.description)}">
<meta name="theme-color" content="#3B2316">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%233B2316'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&family=Instrument+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <div class="wrap">
    <a class="brand" href="#top">${esc(a.name)}</a>
    <nav aria-label="Main">
      <ul>
        <li><a class="l" href="#approach">${esc(c.approach.label)}</a></li>
        <li><a class="l" href="#work">${esc(c.work.label)}</a></li>
        <li><a class="l" href="#about">${esc(c.about.label)}</a></li>
        <li><a class="l" href="#contact">${esc(c.contact.label)}</a></li>
      </ul>
    </nav>
    <a class="pill" href="${esc(waLink)}" target="_blank" rel="noopener">${esc(c.contact.whatsappLabel)}</a>
  </div>
</header>

<main id="main">
  <section class="hero" id="top">
    <div class="wrap">
      <p class="eyebrow">${esc(c.hero.eyebrow)}</p>
      <h1>${esc(c.hero.line1)}</h1>
      <p class="line2">${esc(c.hero.line2)}</p>
      <div class="cta">
        <a class="pill" href="${esc(waLink)}" target="_blank" rel="noopener">${esc(c.contact.whatsappLabel)}</a>
        <a class="pill ghost" href="#approach"><span>How I work</span></a>
      </div>
    </div>
    <a class="badge" href="#contact" aria-label="Contact me: ${esc(c.hero.badge)}">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs><path id="circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
        <text font-family="Instrument Sans, Arial, sans-serif" font-size="15.5" font-weight="600" letter-spacing="2.2" fill="currentColor"><textPath href="#circle">${esc(badgeText)}</textPath></text>
      </svg>
      <span class="dot" aria-hidden="true">↓</span>
    </a>
  </section>

  <div class="marquee" aria-hidden="true"><div class="track">${marquee}</div></div>

  <section class="block" id="approach">
    <div class="wrap">
      <h2 class="label">${esc(c.approach.label)}<sup>(${c.approach.steps.length} steps)</sup></h2>
      <p class="intro">${esc(c.approach.intro)}</p>
      <ol class="index">${rows(c.approach.steps)}
      </ol>
      <p class="promise">${esc(c.approach.promise)}</p>
    </div>
  </section>

  <section class="block" id="work" style="padding-top:0">
    <div class="wrap">
      <h2 class="label">${esc(c.work.label)}<sup>(${c.work.items.length})</sup></h2>
      <p class="intro">${esc(c.work.intro)}</p>
      <ul class="index">${rowsNoNum(c.work.items)}
      </ul>
      <div class="stat"><b>${esc(c.work.stat.value)}</b><span>${esc(c.work.stat.label)}</span></div>
    </div>
  </section>

  <section class="block" id="about" style="padding-top:0">
    <div class="wrap">
      <h2 class="label">${esc(c.about.label)}</h2>
      <div class="about">
        ${a.photo
          ? `<img class="photo" src="${esc(a.photo)}" alt="Portrait of ${esc(a.name)}">`
          : `<div class="photo mono" aria-hidden="true">${esc(initials(a.name))}</div>`}
        <div>
          <h3>${esc(c.about.heading)}</h3>
          ${c.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n          ")}
          <ul class="points">${c.about.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        </div>
      </div>
    </div>
  </section>

  <section class="block dark contact" id="contact">
    <div class="wrap">
      <h2 class="big">${esc(c.contact.heading)}</h2>
      <p class="intro">${esc(c.contact.text)}</p>
      <div class="ways">
        <a class="pill" href="${esc(waLink)}" target="_blank" rel="noopener">${esc(c.contact.whatsappLabel)}</a>
        <a class="pill ghost" href="tel:${esc(tel)}">${esc(c.contact.callLabel)} ${esc(a.phoneDisplay)}</a>
        ${a.email ? `<a class="pill ghost" href="mailto:${esc(a.email)}">${esc(c.contact.emailLabel)}</a>` : ""}
      </div>
      <div class="details">
        <div><b>phone / whatsapp</b>${esc(a.phoneDisplay)}</div>
        ${a.email ? `<div><b>email</b>${esc(a.email)}</div>` : ""}
        <div><b>area</b>${esc(c.contact.area)}</div>
      </div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <p class="stackword" aria-hidden="true">${esc(c.footer.big1)}<br>${esc(c.footer.big2)}</p>
    <div class="legal">
      <p>${esc(a.name)} · CEA Reg. No. ${esc(a.ceaReg)} · ${esc(a.agency)} · CEA Licence No. ${esc(a.agencyLicence)}</p>
      <p>${esc(c.footer.privacy)} © ${year}</p>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

function build() {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, "content.json"), "utf8"));
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, "index.html"), render(content));
  fs.copyFileSync(path.join(ROOT, "src", "styles.css"), path.join(DIST, "styles.css"));
  const assets = path.join(ROOT, "assets");
  if (fs.existsSync(assets)) fs.cpSync(assets, path.join(DIST, "assets"), { recursive: true });
  const missing = findPlaceholders(content);
  console.log(`Built dist/ (${new Date().toLocaleTimeString()})`);
  if (missing.length) {
    console.log(`\n  ${missing.length} placeholder(s) still to fill in content.json before going live:`);
    missing.forEach((m) => console.log("   - " + m));
    console.log("");
  }
  return missing;
}

module.exports = { build };
if (require.main === module) {
  const missing = build();
  if (process.argv.includes("--strict") && missing.length) {
    console.error("Stopping: fill in the placeholders above before publishing.");
    process.exit(1);
  }
}
