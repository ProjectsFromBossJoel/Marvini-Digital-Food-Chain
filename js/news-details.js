// js/news-details.js — news-details.html?id=<docId>
// Renders one published news doc (full text, links clickable) and an "Explore More" sidebar.

import { db, doc, collection, where, query, onSnapshot } from "./firebase-config.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// Escape first, then turn URLs into links, so AI or article text can never inject HTML.
// Trailing punctuation stays outside the link.
function linkify(text) {
  return escapeHtml(text).replace(/https?:\/\/[^\s<>"']+/g, (url) => {
    const m = url.match(/[.,:!?)\]]+$/);
    const trail = m ? m[0] : "";
    const clean = trail ? url.slice(0, -trail.length) : url;
    return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${trail}`;
  });
}

function longDateLabel(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}
function shortDateLabel(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const currentId = new URLSearchParams(window.location.search).get("id");

const loadingEl = document.getElementById("newsDetailLoading");
const errorEl = document.getElementById("newsDetailError");
const gridEl = document.getElementById("newsDetailGrid");
const exploreListEl = document.getElementById("exploreMoreList");

function showError() {
  loadingEl.style.display = "none";
  gridEl.style.display = "none";
  errorEl.style.display = "block";
}

function renderMainNews() {
  if (!currentId) return showError();

  onSnapshot(
    doc(db, "news", currentId),
    (snap) => {
      if (!snap.exists() || snap.data().status !== "published") return showError();

      const data = snap.data();
      const ts = data.publishedAt || data.createdAt;

      document.title = `${data.title || "News"} | M-Digital Food Chain`;

      const coverImg = document.getElementById("newsDetailCoverImg");
      const emojiEl = document.getElementById("newsDetailEmoji");
      if (data.imageUrl) {
        coverImg.src = data.imageUrl;
        coverImg.alt = data.title || "";
        coverImg.style.display = "block";
        emojiEl.style.display = "none";
      } else {
        coverImg.style.display = "none";
        emojiEl.style.display = "block";
        emojiEl.textContent = data.emoji || "📰";
      }

      document.getElementById("newsDetailTag").textContent = data.tag || "Update";
      document.getElementById("newsDetailTitle").textContent = data.title || "Untitled";
      document.getElementById("newsDetailMeta").textContent = ts?.toDate ? longDateLabel(ts.toDate()) : "";
      document.getElementById("newsDetailBody").innerHTML = linkify(data.excerpt || "");

      loadingEl.style.display = "none";
      errorEl.style.display = "none";
      gridEl.style.display = "grid";
    },
    (err) => {
      console.error("Could not load news post:", err);
      showError();
    }
  );
}

function renderExploreMore() {
  if (!exploreListEl) return;

  const q = query(collection(db, "news"), where("status", "==", "published"));

  onSnapshot(
    q,
    (snap) => {
      let docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((d) => d.id !== currentId);

      docs.sort((a, b) => {
        const aTime = (a.publishedAt || a.createdAt)?.toMillis?.() || 0;
        const bTime = (b.publishedAt || b.createdAt)?.toMillis?.() || 0;
        return bTime - aTime;
      });
      docs = docs.slice(0, 5);

      if (!docs.length) {
        exploreListEl.innerHTML = `<p class="explore-empty">No other news yet.</p>`;
        return;
      }

      exploreListEl.innerHTML = docs.map((n) => {
        const ts = n.publishedAt || n.createdAt;
        const dateLabel = ts?.toDate ? shortDateLabel(ts.toDate()) : "";
        const thumb = n.imageUrl
          ? `<img src="${escapeHtml(n.imageUrl)}" alt="${escapeHtml(n.title || "")}" loading="lazy" />`
          : escapeHtml(n.emoji || "📰");
        return `
          <a href="news-details.html?id=${encodeURIComponent(n.id)}" class="explore-item">
            <div class="explore-thumb">${thumb}</div>
            <span class="explore-tag">${escapeHtml(n.tag || "")}</span>
            <h4 class="explore-item-title">${escapeHtml(n.title || "")}</h4>
            <span class="explore-date">${dateLabel}</span>
          </a>
        `;
      }).join("");
    },
    (err) => {
      console.error("Could not load Explore More news:", err);
      exploreListEl.innerHTML = `<p class="explore-empty">Could not load related news.</p>`;
    }
  );
}

renderMainNews();
renderExploreMore();