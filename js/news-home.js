// js/news-home.js — landing page "Latest News" section (3 newest published posts)

import { db, collection, where, query, onSnapshot } from "./firebase-config.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
function monthYearLabel(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
// Card preview only: first paragraph, cut at a word boundary. The full text stays in Firestore.
function shortExcerpt(text, max = 160) {
  const first = String(text ?? "").trim().split(/\n+/)[0];
  if (first.length <= max) return first;
  return first.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

const grid = document.getElementById("newsGrid");

function renderCard(n) {
  const ts = n.publishedAt || n.createdAt;
  const dateLabel = ts?.toDate ? monthYearLabel(ts.toDate()) : "";
  const detailUrl = `news-details.html?id=${encodeURIComponent(n.id)}`;
  const media = n.imageUrl
    ? `<img src="${escapeHtml(n.imageUrl)}" alt="${escapeHtml(n.title || "")}" loading="lazy" />`
    : escapeHtml(n.emoji || "📰");
  return `
    <article class="glass news-card">
      <div class="news-img">${media}</div>
      <div class="news-body">
        <span class="news-tag">${escapeHtml(n.tag || "")}</span>
        <h3 class="news-title"><a href="${detailUrl}">${escapeHtml(n.title || "")}</a></h3>
        <p class="news-excerpt">${escapeHtml(shortExcerpt(n.excerpt))}</p>
        <div class="news-meta">
          <time>${dateLabel}</time>
          <a href="${detailUrl}">Read more</a>
        </div>
      </div>
    </article>
  `;
}

if (grid) {
  // Single where() and client-side sort: no composite index needed.
  const q = query(collection(db, "news"), where("status", "==", "published"));

  onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        grid.innerHTML = `<div class="news-empty">No news yet. Check back soon.</div>`;
        return;
      }
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const aTime = (a.publishedAt || a.createdAt)?.toMillis?.() || 0;
        const bTime = (b.publishedAt || b.createdAt)?.toMillis?.() || 0;
        return bTime - aTime;
      });
      grid.innerHTML = docs.slice(0, 3).map(renderCard).join("");
    },
    (err) => {
      console.error("news-home.js: onSnapshot error:", err);
      grid.innerHTML = `<div class="news-empty">Could not load news. Please try again later.</div>`;
    }
  );
}