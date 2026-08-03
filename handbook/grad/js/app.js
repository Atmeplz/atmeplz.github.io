/* ============================================
   研究生新生手册 2026 · docs 版交互
   hash 路由 + 侧栏 + 页内目录(scrollspy) + 全文搜索
   零依赖，可离线运行
   ============================================ */
(function () {
  "use strict";

  var DATA = window.HANDBOOK_GRAD_DATA;
  var chapters = DATA.chapters;
  var byId = {};
  chapters.forEach(function (c) { byId[c.id] = c; });

  var els = {
    nav: document.getElementById("chapter-nav"),
    eyebrow: document.getElementById("chapter-eyebrow"),
    title: document.getElementById("chapter-title"),
    body: document.getElementById("chapter-body"),
    prevNext: document.getElementById("prev-next"),
    content: document.getElementById("content"),
    sidebar: document.getElementById("sidebar"),
    backdrop: document.getElementById("sidebar-backdrop"),
    sidebarToggle: document.getElementById("sidebar-toggle"),
    searchInput: document.getElementById("search-input"),
    searchResults: document.getElementById("search-results"),
    backToTop: document.getElementById("back-to-top"),
    sectionNav: document.getElementById("section-nav")
  };

  /* ---------------- 左侧章节目录 ---------------- */
  els.nav.innerHTML = chapters.map(function (c) {
    return '<a href="#/' + c.id + '" data-cid="' + c.id + '">' +
      '<span class="ch-num">' + c.id + '</span>' +
      '<span class="ch-title">' + c.title + '</span></a>';
  }).join("");

  els.nav.addEventListener("click", function () { closeSidebar(); });

  /* ---------------- 路由 ---------------- */
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/").filter(Boolean);
    var cid = parts[0] && byId[parts[0]] ? parts[0] : "00";
    return { cid: cid, anchor: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function render() {
    var route = parseHash();
    var c = byId[route.cid];

    // 章节头
    els.eyebrow.textContent = "CHAPTER " + c.id;
    els.title.textContent = c.title;
    document.title = c.title + " · 研究生新生手册";

    // 正文
    els.body.innerHTML = c.html;

    // 目录章：目录表的章节名链接到对应章节
    if (c.id === "00") linkifyToc();

    // 右侧页内小标题导航（目录章不显示，跳转由目录链接承担）
    buildSectionNav(c);

    // 侧栏激活态
    els.nav.querySelectorAll("a").forEach(function (a) {
      a.classList.toggle("active", a.dataset.cid === c.id);
    });
    var activeLink = els.nav.querySelector("a.active");
    if (activeLink && window.innerWidth > 900) {
      activeLink.scrollIntoView({ block: "nearest" });
    }

    // 上一章 / 下一章
    var idx = chapters.indexOf(c);
    var prev = chapters[idx - 1], next = chapters[idx + 1];
    els.prevNext.innerHTML =
      (prev
        ? '<a class="pn-link" href="#/' + prev.id + '"><span class="pn-label">← 上一章</span><span class="pn-title">' + prev.title + "</span></a>"
        : '<span class="pn-empty"></span>') +
      (next
        ? '<a class="pn-link next" href="#/' + next.id + '"><span class="pn-label">下一章 →</span><span class="pn-title">' + next.title + "</span></a>"
        : '<span class="pn-empty"></span>');

    // 滚动定位
    if (route.anchor && document.getElementById(route.anchor)) {
      scrollToEl(document.getElementById(route.anchor), true);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    }
  }

  function scrollToEl(el, flash) {
    var y = el.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: y, behavior: "smooth" });
    if (flash) {
      el.classList.remove("flash");
      void el.offsetWidth;
      el.classList.add("flash");
    }
  }

  /* 目录章（00）：把目录表格的章节名转换为章节跳转链接。
     匹配规则：与章节标题完全一致，或章节标题以目录文字开头
     （兼容"强军战歌（军训）""结尾寄语与封底"这类标题扩写） */
  function linkifyToc() {
    els.body.querySelectorAll("table tbody tr").forEach(function (tr) {
      var td = tr.querySelector("td");
      if (!td || td.querySelector("a")) return;
      var name = td.textContent.replace(/\s+/g, "");
      if (!name) return;
      var hit = null;
      chapters.forEach(function (ch) {
        if (hit || ch.id === "00") return;
        var t = ch.title.replace(/\s+/g, "");
        if (t === name || t.indexOf(name) === 0) hit = ch;
      });
      if (!hit) return;
      td.innerHTML = '<a class="toc-link" href="#/' + hit.id + '">' + td.innerHTML + "</a>";
      tr.classList.add("toc-row");
      tr.addEventListener("click", function (e) {
        if (!e.target.closest("a")) location.hash = "#/" + hit.id;
      });
    });
  }

  window.addEventListener("hashchange", render);

  /* ---------------- 页内小标题导航（右侧锚点圆点） ---------------- */
  var sectionHeads = [];

  function buildSectionNav(c) {
    var nav = els.sectionNav;
    sectionHeads = [];
    nav.innerHTML = "";
    nav.classList.remove("expanded");
    if (c && c.id === "00") { nav.hidden = true; return; }

    els.body.querySelectorAll("h2[id], h3[id]").forEach(function (h) {
      var text = h.textContent.replace(/\s+/g, " ").trim();
      if (text) sectionHeads.push({ id: h.id, text: text });
    });
    if (sectionHeads.length < 2) { nav.hidden = true; return; }

    sectionHeads.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sn-item";
      b.dataset.target = s.id;
      b.innerHTML = '<span class="sn-label">' + escapeHtml(s.text) + '</span><span class="sn-dot"></span>';
      nav.appendChild(b);
    });
    nav.hidden = false;
    syncSectionNav();
  }

  /* 滚动侦测：高亮当前阅读位置对应的小标题 */
  function syncSectionNav() {
    if (els.sectionNav.hidden) return;
    var current = sectionHeads.length ? sectionHeads[0].id : null;
    sectionHeads.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= 96) current = s.id;
    });
    els.sectionNav.querySelectorAll(".sn-item").forEach(function (b) {
      var on = b.dataset.target === current;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  }

  window.addEventListener("scroll", syncSectionNav, { passive: true });

  els.sectionNav.addEventListener("click", function (e) {
    var item = e.target.closest(".sn-item");
    /* 移动端：第一下点按展开标签，第二下点条目才跳转（桌面端悬浮展开、直接点击跳转） */
    if (isMobile() && !els.sectionNav.classList.contains("expanded")) {
      els.sectionNav.classList.add("expanded");
      return;
    }
    if (item) {
      var h = document.getElementById(item.dataset.target);
      if (h) scrollToEl(h, true);
      els.sectionNav.classList.remove("expanded");
    } else if (isMobile()) {
      els.sectionNav.classList.remove("expanded");
    }
  });

  /* 点导航外部收起（移动端） */
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#section-nav")) els.sectionNav.classList.remove("expanded");
  });

  /* ---------------- 全文搜索 ---------------- */
  // 建立索引：把每章 HTML 拆成文本块，记录就近标题作为跳转锚点
  var searchIndex = [];

  function buildIndex() {
    var container = document.createElement("div");
    chapters.forEach(function (c) {
      container.innerHTML = c.html;
      var currentAnchor = null;
      var currentHeading = c.title;
      container.querySelectorAll("h2, h3, h4, .chapter-banner, p, li, td, th, .fig-desc").forEach(function (el) {
        var id = el.id;
        if (el.matches("h2, h3, h4, .chapter-banner")) {
          if (id) {
            currentAnchor = id;
            currentHeading = el.textContent.trim();
          }
        }
        var text = el.textContent.replace(/\s+/g, " ").trim();
        if (text.length < 4) return;
        searchIndex.push({
          cid: c.id,
          ctitle: c.title,
          anchor: currentAnchor,
          heading: currentHeading,
          isHeading: el.matches("h2, h3, h4, .chapter-banner"),
          text: text
        });
      });
    });
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function search(q) {
    q = q.trim();
    if (!q) return [];
    var ql = q.toLowerCase();
    var scored = [];
    searchIndex.forEach(function (item) {
      var idx = item.text.toLowerCase().indexOf(ql);
      if (idx === -1) return;
      var score = idx === 0 ? 3 : 1;
      if (item.isHeading) score += 3;
      if (item.text.length < q.length * 3) score += 1;
      scored.push({ item: item, idx: idx, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });

    // 同一锚点只保留最高分的一条
    var seen = {};
    var out = [];
    for (var i = 0; i < scored.length && out.length < 15; i++) {
      var r = scored[i];
      var key = r.item.cid + "|" + (r.item.anchor || "");
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(r);
    }
    return out;
  }

  function snippet(text, q, idx) {
    var from = Math.max(0, idx - 26);
    var to = Math.min(text.length, idx + q.length + 40);
    var s = (from > 0 ? "…" : "") + text.slice(from, to) + (to < text.length ? "…" : "");
    return escapeHtml(s).replace(new RegExp(escapeRegExp(escapeHtml(q)), "gi"), function (m) {
      return "<mark>" + m + "</mark>";
    });
  }

  var searchTimer = null;
  var activeResult = -1;

  function renderResults() {
    var q = els.searchInput.value;
    if (!q.trim()) { hideResults(); return; }
    var results = search(q);
    activeResult = -1;
    if (!results.length) {
      els.searchResults.innerHTML = '<div class="sr-empty">没有找到与「' + escapeHtml(q) + "」相关的内容</div>";
      els.searchResults.hidden = false;
      return;
    }
    var html = '<div class="search-results-head">找到 ' + results.length + ' 处相关内容</div><div class="search-results-list">';
    results.forEach(function (r, i) {
      html += '<button class="sr-item" data-i="' + i + '">' +
        '<span class="sr-chapter">' + r.item.ctitle + "</span>" +
        '<span class="sr-heading">' + escapeHtml(r.item.heading) + "</span>" +
        '<div class="sr-snippet">' + snippet(r.item.text, q, r.idx) + "</div>" +
        "</button>";
    });
    html += "</div>";
    els.searchResults.innerHTML = html;
    els.searchResults.hidden = false;

    els.searchResults.querySelectorAll(".sr-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        goToResult(results[parseInt(btn.dataset.i, 10)]);
      });
    });
    els.searchResults._results = results;
  }

  function goToResult(r) {
    setSearchOpen(false);
    var target = "#/" + r.item.cid + (r.item.anchor ? "/" + encodeURIComponent(r.item.anchor) : "");
    if (location.hash === target) {
      render();
    } else {
      location.hash = target;
    }
  }

  function hideResults() {
    els.searchResults.hidden = true;
  }

  els.searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderResults, 160);
  });
  els.searchInput.addEventListener("focus", function () {
    if (els.searchInput.value.trim()) renderResults();
  });
  els.searchInput.addEventListener("keydown", function (e) {
    var items = els.searchResults.querySelectorAll(".sr-item");
    if (e.key === "Escape") {
      setSearchOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!items.length) return;
      e.preventDefault();
      activeResult += e.key === "ArrowDown" ? 1 : -1;
      activeResult = (activeResult + items.length) % items.length;
      items.forEach(function (el, i) { el.classList.toggle("active", i === activeResult); });
      items[activeResult].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      if (activeResult >= 0 && items[activeResult]) {
        items[activeResult].click();
      } else if (items.length) {
        items[0].click();
      }
    }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".header-search")) hideResults();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      els.searchInput.focus();
    }
  });

  /* ---------------- 移动端搜索：图标按钮 ⇄ 浮层搜索框 ---------------- */
  var searchToggle = document.getElementById("search-toggle");

  function setSearchOpen(open) {
    /* 桌面端无 .search-open 样式规则，调用无副作用 */
    document.body.classList.toggle("search-open", open);
    searchToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      els.searchInput.focus();
    } else {
      hideResults();
      els.searchInput.blur();
    }
  }

  searchToggle.addEventListener("click", function () {
    setSearchOpen(!document.body.classList.contains("search-open"));
  });

  /* ---------------- 侧栏：桌面折叠 / 移动端抽屉（默认收起） ---------------- */
  function isMobile() { return window.innerWidth <= 900; }

  function openSidebar() {
    els.sidebar.classList.add("open");
    els.backdrop.hidden = false;
    syncToggleAria();
  }
  function closeSidebar() {
    els.sidebar.classList.remove("open");
    els.backdrop.hidden = true;
    syncToggleAria();
  }
  function syncToggleAria() {
    var expanded = isMobile()
      ? els.sidebar.classList.contains("open")
      : !document.body.classList.contains("sidebar-collapsed");
    els.sidebarToggle.setAttribute("aria-expanded", String(expanded));
  }

  els.sidebarToggle.addEventListener("click", function () {
    if (isMobile()) {
      els.sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    } else {
      document.body.classList.toggle("sidebar-collapsed");
      syncToggleAria();
    }
  });
  els.backdrop.addEventListener("click", closeSidebar);
  window.addEventListener("resize", function () {
    if (isMobile()) {
      document.body.classList.remove("sidebar-collapsed"); // 移动端不用桌面折叠态
    } else {
      closeSidebar(); // 桌面端清理抽屉状态
    }
    syncToggleAria();
  });
  syncToggleAria();

  /* ---------------- 返回顶部 ---------------- */
  window.addEventListener("scroll", function () {
    els.backToTop.hidden = window.scrollY < 480;
  }, { passive: true });
  els.backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------------- 启动 ---------------- */
  buildIndex();
  render();
})();
