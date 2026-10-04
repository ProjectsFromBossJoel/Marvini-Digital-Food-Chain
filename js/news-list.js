// js/news-list.js — news.html
// Live list of published news from Firestore, 9 per page, newest first.

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

const PAGE_SIZE = 9;
let currentPage = 1;
let allDocs = [];

const grid = document.getElementById("newsListGrid");
const pagination = document.getElementById("newsPagination");
const prevBtn = document.getElementById("newsPrevBtn");
const nextBtn = document.getElementById("newsNextBtn");
const pageLabel = document.getElementById("newsPageLabel");

const emptyHtml = `<div class="news-empty">No news yet. Check back soon.</div>`;

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
          <time${ts?.toDate ? ` datetime="${ts.toDate().toISOString().slice(0, 10)}"` : ""}>${dateLabel}</time>
          <a href="${detailUrl}">Read more</a>
        </div>
      </div>
    </article>
  `;
}

function renderPage(page, scroll = true) {
  const totalPages = Math.max(1, Math.ceil(allDocs.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(1, page), totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageDocs = allDocs.slice(start, start + PAGE_SIZE);

  if (!pageDocs.length) {
    grid.innerHTML = emptyHtml;
    pagination.hidden = true;
    return;
  }

  grid.innerHTML = pageDocs.map(renderCard).join("");
  pagination.hidden = totalPages <= 1;
  pageLabel.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  if (scroll) window.scrollTo({ top: grid.offsetTop - 120, behavior: "smooth" });
}

if (grid) {
  // Single where() and client-side sort: no composite index needed, and docs
  // without a publishedAt field are not dropped.
  const q = query(collection(db, "news"), where("status", "==", "published"));

  onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        grid.innerHTML = emptyHtml;
        pagination.hidden = true;
        return;
      }
      allDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      allDocs.sort((a, b) => {
        const aTime = (a.publishedAt || a.createdAt)?.toMillis?.() || 0;
        const bTime = (b.publishedAt || b.createdAt)?.toMillis?.() || 0;
        return bTime - aTime;
      });
      // Keep the reader on the same page when a live update arrives.
      renderPage(currentPage, false);
    },
    (err) => {
      console.error("news-list.js: onSnapshot error:", err);
      grid.innerHTML = `<div class="news-empty">Could not load news. Please try again later.</div>`;
    }
  );
}

prevBtn?.addEventListener("click", () => renderPage(currentPage - 1));
nextBtn?.addEventListener("click", () => renderPage(currentPage + 1));