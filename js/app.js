/* ============================================
   厦大信院新生答疑平台 · 交互逻辑
   内容数据在 js/data.js，改内容不用动这里
   ============================================ */
(function () {
  'use strict';

  var D = window.SITE_DATA;

  /* ---------- 内联 SVG 图标（Lucide 风格） ---------- */
  var ICONS = {
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'search-x': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m8.5 8.5 5 5"/><path d="m13.5 8.5-5 5"/>',
    'sparkles': '<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/>',
    'graduation-cap': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'building': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M2 22h20"/><path d="M10 6h1m2 0h1m-4 4h1m2 0h1m-4 4h1m2 0h1m-4 4h1m2 0h1"/>',
    'briefcase': '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'eye': '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.79.66 2.64a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.44-1.23a2 2 0 0 1 2.11-.45c.85.32 1.74.54 2.64.66A2 2 0 0 1 22 16.92z"/>',
    'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'pin': '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7h1a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2h1v3.76z"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    'external': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    'credit-card': '<rect width="22" height="16" x="1" y="4" rx="2"/><path d="M1 10h22"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'bot': '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    'menu': '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };

  function icon(name, cls) {
    var body = ICONS[name] || ICONS['star'];
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function el(id) { return document.getElementById(id); }

  /* 修复原站 bug：data.js 里图标名是 PascalCase（GraduationCap），统一转 kebab-case */
  function iconKey(name) {
    return String(name || '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /* ============================================
     渲染静态内容
     ============================================ */
  document.title = D.siteName + D.platformName;
  el('brand-icon').innerHTML = icon('graduation-cap');
  el('brand-name').textContent = D.siteName;
  el('brand-sub').textContent = D.footerTagline;
  el('hero-badge-text').textContent = D.badge;
  el('hero-title').innerHTML =
    esc(D.siteName) + '<br><span class="accent">' + esc(D.platformName) + '</span>';
  el('hero-subtitle').textContent = D.heroSubtitle;
  el('search-input').placeholder = D.searchPlaceholder;
  el('timeline-title').textContent = '本科新生时间线';
  el('links-title').textContent = '常用系统入口';
  el('footer-name').textContent = D.siteName;
  el('footer-tagline').textContent = D.footerTagline;
  el('copyright').textContent = D.copyright;

  /* 替换 index.html 中的 data-icon 占位 */
  Array.prototype.forEach.call(document.querySelectorAll('[data-icon]'), function (n) {
    n.innerHTML = icon(n.getAttribute('data-icon'));
  });

  /* ---------- 导航 ---------- */
  var nav = el('main-nav');
  D.nav.forEach(function (item, i) {
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    if (i === 0) a.classList.add('active');
    nav.appendChild(a);
  });

  var footerNav = el('footer-nav');
  D.nav.forEach(function (item) {
    var li = document.createElement('li');
    li.innerHTML = '<a href="' + esc(item.href) + '">' + esc(item.label) + '</a>';
    footerNav.appendChild(li);
  });

  /* ---------- 热门搜索 ---------- */
  var hotBox = el('hot-searches');
  hotBox.appendChild(document.createTextNode('热门搜索：'));
  D.hotSearches.forEach(function (term) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = term;
    b.addEventListener('click', function () {
      el('search-input').value = term;
      applySearch(term);
    });
    hotBox.appendChild(b);
  });

  /* ============================================
     分类卡片：点击打开该板块的问答弹窗
     （计数取自真实数据，空板块显示"筹备中"徽章）
     ============================================ */
  var grid = el('category-grid');

  function faqCountOf(catId) {
    return D.faqs.filter(function (f) { return f.category === catId; }).length;
  }

  D.categories.forEach(function (cat) {
    var count = faqCountOf(cat.id);
    var card = document.createElement('div');
    card.className = 'category-card reveal';
    card.dataset.category = cat.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-haspopup', 'dialog');

    card.innerHTML =
      '<div class="category-top">' +
        '<div class="category-icon">' + icon(iconKey(cat.icon)) + '</div>' +
        '<div class="category-info"><h3>' + esc(cat.name) + '</h3><p>' + esc(cat.description) + '</p></div>' +
        (count > 0
          ? '<span class="category-count">' + count + ' 条问答</span>'
          : '<span class="category-count soon">筹备中</span>') +
      '</div>';

    function open() { openModal(cat.id, card); }
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    grid.appendChild(card);
  });

  /* ============================================
     板块问答弹窗：罗列该板块全部问答，支持板块内搜索
     ============================================ */
  var modal = el('faq-modal');
  var modalCat = el('faq-modal-cat');
  var modalSubs = el('faq-modal-subs');
  var modalInput = el('faq-modal-input');
  var listBox = el('faq-list');
  var emptyBox = el('faq-empty');
  var modalCatId = null;
  var modalOpener = null;

  function openModal(catId, openerEl) {
    var cat = null;
    D.categories.forEach(function (c) { if (c.id === catId) cat = c; });
    if (!cat) return;
    modalCatId = catId;
    modalOpener = openerEl || null;

    modalCat.innerHTML = icon(iconKey(cat.icon)) + esc(cat.name);
    modalSubs.textContent = '涵盖：' +
      cat.subCategories.map(function (s) { return s.name; }).join(' · ');
    modalInput.value = '';
    renderModalFaq('');
    lastModalKw = '';

    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalInput.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (modalOpener) modalOpener.focus();
  }

  function renderModalFaq(kw) {
    var all = D.faqs.filter(function (f) { return f.category === modalCatId; });
    /* 置顶条目始终排在最前 */
    all.sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });
    var kwLower = kw.toLowerCase();
    var items = !kw ? all : all.filter(function (f) {
      return (f.question + ' ' + f.answer).toLowerCase().indexOf(kwLower) !== -1;
    });

    listBox.innerHTML = '';
    if (all.length === 0) {
      emptyBox.hidden = false;
      emptyBox.querySelector('p').textContent = '该板块问答正在整理中，敬请期待';
    } else if (items.length === 0) {
      emptyBox.hidden = false;
      emptyBox.querySelector('p').textContent = '没有匹配「' + kw + '」的问题，换个关键词试试';
    } else {
      emptyBox.hidden = true;
    }

    items.forEach(function (f) {
      var item = document.createElement('div');
      item.className = 'faq-item';
      item.innerHTML =
        '<button class="faq-question" aria-expanded="false">' +
          '<div class="faq-q-main">' +
            '<div class="faq-q-title">' + highlight(f.question, kw) +
              (f.pinned ? '<span class="badge-pin">' + icon('pin') + '置顶</span>' : '') +
              (f.isHot ? '<span class="badge-hot">' + icon('flame') + '热门</span>' : '') +
            '</div>' +
            '<div class="faq-q-meta">' +
              '<span>' + icon('eye') + Number(f.views).toLocaleString() + '</span>' +
            '</div>' +
          '</div>' +
          '<span class="faq-chevron">' + icon('chevron-down') + '</span>' +
        '</button>' +
        '<div class="faq-answer"><div class="faq-answer-inner"><p>' +
          highlight(f.answer, kw) +
        '</p>' +
        (function () {
          if (!f.link) return '';
          var ext = /^https?:/.test(f.link.url);
          /* 外链 → 新标签页打开；站内文件 → 直接下载 */
          return '<a class="faq-attach" href="' + esc(f.link.url) + '"' +
            (ext ? ' target="_blank" rel="noopener noreferrer"' : ' download') + '>' +
            icon(ext ? 'external' : 'download') + esc(f.link.label) + '</a>';
        })() +
        '</div></div>';

      var btn = item.querySelector('.faq-question');
      btn.addEventListener('click', function () {
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
      listBox.appendChild(item);
    });
  }

  el('faq-modal-close').addEventListener('click', closeModal);
  el('faq-modal-backdrop').addEventListener('click', closeModal);

  /* input/keyup 双监听 + 关键词去重：
     防止某些环境清空输入框时不触发 input 事件导致列表不恢复，
     也避免方向键等无变化按键引起无谓重渲染 */
  var lastModalKw = '';
  function modalSearch(kw) {
    kw = kw.trim();
    if (kw === lastModalKw) return;
    lastModalKw = kw;
    renderModalFaq(kw);
  }
  modalInput.addEventListener('input', function () { modalSearch(this.value); });
  modalInput.addEventListener('keyup', function () { modalSearch(this.value); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* 搜索关键词高亮：优先整词，整词不中时逐字高亮（配合模糊匹配） */
  function highlight(text, kw) {
    var safe = esc(text);
    if (!kw) return safe;
    var safeKw = esc(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (text.indexOf(kw) !== -1) {
      return safe.replace(new RegExp('(' + safeKw + ')', 'gi'), '<mark>$1</mark>');
    }
    var chars = kw.split('').map(function (c) {
      return esc(c).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    return safe.replace(new RegExp('(' + chars.join('|') + ')', 'g'), '<mark>$1</mark>');
  }

  /* 搜索评分：整词命中权重最高；否则按关键词字符覆盖率计分（中文模糊匹配）。
     时间线、分类指南等内容一并纳入搜索，按相关度排序。 */
  var SEARCH_THRESHOLD = 0.5; // 覆盖率 ≥ 50% 视为相关

  /* 搜索范围：'ug' 本科（默认）｜'grad' 研究生（待接入） */
  var scope = 'ug';

  /* 手册搜索索引：把各本《新生手册》的章节 HTML 拆成文本块，记录就近标题作为跳转锚点。
     与 handbook/ug/js/app.js 的 buildIndex 同思路，仅服务首页搜索框。
     「本」→ 本科手册（HANDBOOK_UG_DATA）；「研」→ 研究生手册（HANDBOOK_GRAD_DATA）。
     坑位说明：研究生手册尚未接入（gradAvailable = false），一旦根站页面用
     <script src="handbook/grad/js/content.js"> 加载了 HANDBOOK_GRAD_DATA，
     索引会自动建立、研模式搜索即生效，无需再改逻辑。 */
  var handbookIndex = [];
  var gradHandbookIndex = [];
  var gradAvailable = !!window.HANDBOOK_GRAD_DATA;

  function buildIndexFor(H, sink) {
    if (!H || !H.chapters || !H.chapters.length) return;
    var container = document.createElement('div');
    H.chapters.forEach(function (c) {
      container.innerHTML = c.html;
      var currentAnchor = null;
      var currentHeading = c.title;
      container.querySelectorAll('h2, h3, h4, .chapter-banner, p, li, td, th').forEach(function (el) {
        if (el.matches('h2, h3, h4, .chapter-banner') && el.id) {
          currentAnchor = el.id;
          currentHeading = el.textContent.trim();
        }
        var text = el.textContent.replace(/\s+/g, ' ').trim();
        if (text.length < 4) return;
        sink.push({
          cid: c.id,
          ctitle: c.title,
          anchor: currentAnchor,
          heading: currentHeading,
          isHeading: el.matches('h2, h3, h4, .chapter-banner'),
          text: text
        });
      });
    });
  }
  buildIndexFor(window.HANDBOOK_UG_DATA, handbookIndex);
  buildIndexFor(window.HANDBOOK_GRAD_DATA, gradHandbookIndex);

  function searchScore(text, kw) {
    if (text.indexOf(kw) !== -1) return 2;
    if (kw.length < 2) return text.indexOf(kw) !== -1 ? 1 : 0;
    var hits = 0;
    kw.split('').forEach(function (c) { if (text.indexOf(c) !== -1) hits++; });
    return hits / kw.length;
  }

  /* 手册结果摘要：围绕命中位置截取原文片段（约一句话），前后加省略号 */
  function snippet(text, kw) {
    var idx = text.indexOf(kw);
    if (idx === -1) idx = 0;
    var from = Math.max(0, idx - 18);
    var to = Math.min(text.length, idx + kw.length + 46);
    return (from > 0 ? '…' : '') + text.slice(from, to) + (to < text.length ? '…' : '');
  }

  /* 全站搜索：返回按相关度排序的统一结果列表 */
  function searchAll(kw) {
    var results = [];

    /* 范围=研：只搜研究生手册（问答/时间线/指南均为本科向内容，不参与） */
    if (scope === 'grad') {
      return gradHits(gradHandbookIndex, 'handbook/grad/index.html#/', kw, 15);
    }

    D.faqs.forEach(function (f) {
      if (f.pinned) return; /* 置顶资料条（下载类）不参与全站搜索 */
      var s = Math.max(searchScore(f.question, kw), searchScore(f.answer, kw));
      if (s >= SEARCH_THRESHOLD) {
        results.push({ type: '问答', title: f.question, body: f.answer, score: s });
      }
    });

    D.timeline.forEach(function (t) {
      var s = searchScore(t.date + ' ' + t.title + ' ' + t.description, kw);
      if (s >= SEARCH_THRESHOLD) {
        results.push({ type: '时间线', title: t.title, meta: t.date, body: t.description, score: s });
      }
    });

    D.categories.forEach(function (c) {
      var subText = c.subCategories.map(function (sub) {
        return sub.name + ' ' + sub.items.join(' ');
      }).join(' ');
      var s = searchScore(c.name + ' ' + c.description + ' ' + subText, kw);
      if (s >= SEARCH_THRESHOLD) {
        results.push({
          type: '指南',
          title: c.name,
          body: c.description + '。包含：' +
                c.subCategories.map(function (sub) { return sub.name; }).join('、'),
          score: s
        });
      }
    });

    /* 《本科新生手册》：命中文本块按相关度排序，同小节只保留一条，最多 6 条 */
    var hbHits = [];
    handbookIndex.forEach(function (h) {
      var s = searchScore(h.text, kw);
      if (s < SEARCH_THRESHOLD) return;
      /* 标题命中、文本开头命中额外加分，避免整段长文稀释相关度 */
      var score = s + (h.isHeading ? 0.5 : 0) + (h.text.indexOf(kw) === 0 ? 0.3 : 0);
      hbHits.push({ h: h, score: score });
    });
    hbHits.sort(function (a, b) { return b.score - a.score; });
    var hbSeen = {};
    var hbCount = 0;
    hbHits.forEach(function (r) {
      if (hbCount >= 6) return;
      var h = r.h;
      var key = h.cid + '|' + (h.anchor || '');
      if (hbSeen[key]) return;
      hbSeen[key] = 1;
      results.push({
        type: '手册',
        title: h.ctitle,
        body: (h.heading && h.heading !== h.ctitle ? h.heading + '：' : '') + snippet(h.text, kw),
        meta: h.cid,
        score: r.score,
        href: 'handbook/ug/index.html#/' + h.cid + '/' + encodeURIComponent(h.anchor)
      });
      hbCount++;
    });

    /* 手册结果整体置后，优先展示问答/时间线/指南；手册之间仍按相关度排序 */
    return results.sort(function (a, b) {
      if (a.type === '手册' && b.type !== '手册') return 1;
      if (a.type !== '手册' && b.type === '手册') return -1;
      return b.score - a.score;
    });
  }

  /* 研究生手册命中：与本科手册同一套评分/去重，返回手册类型结果（上限 max 条）。
     href 拼到 handbook/grad/ 下，将来接入研究生手册后跳转即生效。 */
  function gradHits(index, baseHref, kw, max) {
    var hits = [];
    index.forEach(function (h) {
      var s = searchScore(h.text, kw);
      if (s < SEARCH_THRESHOLD) return;
      var score = s + (h.isHeading ? 0.5 : 0) + (h.text.indexOf(kw) === 0 ? 0.3 : 0);
      hits.push({ h: h, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    var seen = {};
    var count = 0;
    var out = [];
    hits.forEach(function (r) {
      if (count >= max) return;
      var h = r.h;
      var key = h.cid + '|' + (h.anchor || '');
      if (seen[key]) return;
      seen[key] = 1;
      out.push({
        type: '手册',
        title: h.ctitle,
        body: (h.heading && h.heading !== h.ctitle ? h.heading + '：' : '') + snippet(h.text, kw),
        meta: h.cid,
        score: r.score,
        href: baseHref + h.cid + '/' + encodeURIComponent(h.anchor)
      });
      count++;
    });
    return out;
  }

  /* ============================================
     搜索结果面板：在搜索框下方就地展示，可展开看答案
     （不做页面跳转）
     ============================================ */
  var resultsPanel = el('search-results');
  var keyword = '';
  /* 面板挂到 body 顶层：避免被 .hero-content 的 z-index stacking context 困住，
     导致 z-index:200 压不过轮播控件（z-index:2，同在 root 上下文）而被覆盖 */
  if (resultsPanel && resultsPanel.parentElement) {
    document.body.appendChild(resultsPanel);
  }

  /* 把悬浮面板定位到搜索框正下方（fixed 定位，避免被 hero 的 overflow 裁剪） */
  function positionPanel() {
    if (resultsPanel.hidden) return;
    var r = el('hero-search').getBoundingClientRect();
    resultsPanel.style.top = (r.bottom + 10) + 'px';
    resultsPanel.style.left = r.left + 'px';
    resultsPanel.style.width = r.width + 'px';
    /* 列表高度不超出视口 */
    var list = resultsPanel.querySelector('.search-results-list');
    if (list) {
      var headH = resultsPanel.querySelector('.search-results-head').offsetHeight || 41;
      list.style.maxHeight = Math.max(120, Math.min(330, window.innerHeight - r.bottom - 16 - headH)) + 'px';
    }
  }
  window.addEventListener('scroll', positionPanel, { passive: true });
  window.addEventListener('resize', positionPanel);

  function renderSearchResults() {
    var kw = keyword.trim();
    if (!kw) {
      resultsPanel.hidden = true;
      resultsPanel.innerHTML = '';
      return;
    }
    var items = searchAll(kw);

    var html =
      '<div class="search-results-head">' +
        '<span>找到 ' + items.length + ' 个相关结果</span>' +
        '<button type="button" class="search-results-close" aria-label="关闭搜索结果">✕</button>' +
      '</div>';

    if (items.length === 0) {
      if (scope === 'grad' && !gradAvailable) {
        /* 坑位：研究生手册尚未接入，研模式提示即将上线 */
        html += '<div class="sr-empty"><strong>研究生新生手册即将上线</strong>' +
                '<p>本平台的答疑内容面向本科生；研究生手册接入后，切到「研」即可在此搜索研究生相关指南。</p></div>';
      } else {
        html += '<div class="sr-empty">没有找到相关内容，换个关键词试试吧</div>';
      }
    } else {
      var typeCls = { '问答': 'sr-type-faq', '时间线': 'sr-type-timeline', '指南': 'sr-type-category', '手册': 'sr-type-handbook' };
      html += '<div class="search-results-list">' + items.map(function (r) {
        /* 带 href 的结果（如手册）：展开区附加一个跳转箭头按钮，点箭头才打开对应位置 */
        var goto = r.href
          ? '<a class="sr-goto" href="' + esc(r.href) + '" target="_blank" rel="noopener" title="打开手册对应位置">' +
            icon('chevron-right') + '</a>'
          : '';
        return '<div class="sr-item">' +
          '<button type="button" class="sr-q" aria-expanded="false">' +
            '<span><span class="sr-type ' + typeCls[r.type] + '">' + r.type + '</span>' +
            highlight(r.title, kw) +
            (r.meta ? '<span class="sr-meta">' + esc(r.meta) + '</span>' : '') +
            '</span>' +
            '<span class="faq-chevron">' + icon('chevron-down') + '</span>' +
          '</button>' +
          '<div class="sr-a"><p>' + highlight(r.body, kw) + '</p>' + goto + '</div>' +
        '</div>';
      }).join('') + '</div>';
    }

    resultsPanel.innerHTML = html;
    resultsPanel.hidden = false;
    positionPanel();

    resultsPanel.querySelector('.search-results-close').addEventListener('click', function () {
      resultsPanel.hidden = true;
      el('search-input').value = '';
      keyword = '';
    });
    Array.prototype.forEach.call(resultsPanel.querySelectorAll('.sr-q'), function (btn) {
      btn.addEventListener('click', function () {
        /* 所有结果统一：点击展开/收起原文（手册结果另有箭头按钮跳转） */
        var item = btn.closest('.sr-item');
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* 搜索：只更新悬浮结果面板，与下方 FAQ 区块解耦（不跳转、不过滤 FAQ） */
  function applySearch(term) {
    keyword = term || '';
    renderSearchResults();
  }

  el('hero-search').addEventListener('submit', function (e) {
    e.preventDefault();
    applySearch(el('search-input').value);
  });

  /* 搜索范围滑块：「本」=本科手册+答疑内容；「研」=研究生手册（坑位，待接入）。
     切换后若搜索框已有词，立即按新范围重算结果。 */
  var scopeToggle = el('scope-toggle');
  if (scopeToggle) {
    scopeToggle.addEventListener('click', function (e) {
      var btn = e.target.closest('.scope-btn');
      if (!btn || btn.classList.contains('active')) return;
      var next = btn.dataset.scope;
      scope = next;
      scopeToggle.querySelectorAll('.scope-btn').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      scopeToggle.classList.toggle('scope-grad', scope === 'grad');
      if (keyword.trim()) renderSearchResults();
    });
  }
  /* 输入时实时更新结果面板 */
  el('search-input').addEventListener('input', function () {
    keyword = this.value;
    renderSearchResults();
  });

  /* Esc 清空并关闭结果面板 */
  el('search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      this.value = '';
      keyword = '';
      renderSearchResults();
    }
  });

  /* 点击面板外部时关闭（搜索框、面板、热门搜索标签除外） */
  document.addEventListener('click', function (e) {
    if (resultsPanel.hidden) return;
    if (e.target.closest && e.target.closest('.hero-search-wrap, .hot-searches, #search-results')) return;
    resultsPanel.hidden = true;
  });

  /* ============================================
     校园掠影轮播：pic/photos.js 清单驱动
     自动播放（6s）+ 左右按键 + 拖动；
     中间突出、两侧缩小并加浅白遮罩；三份复制无缝循环
     ============================================ */
  (function () {
    var gallery = el('gallery');
    if (!gallery) return;
    var pics = window.PICTURE_LIST;
    if (!pics || !pics.length) { gallery.hidden = true; return; }

    var viewport = el('gallery-viewport');
    var track = el('gallery-track');
    var prevBtn = el('gallery-prev');
    var nextBtn = el('gallery-next');
    var N = pics.length;
    var AUTOPLAY_MS = 6000;

    var html = '';
    for (var k = 0; k < 3; k++) {
      pics.forEach(function (p) {
        html += '<div class="gallery-slide">' +
                  '<img src="pic/' + encodeURIComponent(p.file) + '" alt="' + esc(p.name) + '" draggable="false">' +
                '</div>';
      });
    }
    track.innerHTML = html;

    var index = N; /* 从中间一份开始，两侧均有图 */
    var timer = null;

    function dims() {
      var first = track.children[0];
      return {
        box: first.offsetWidth, /* 可视滑块宽（不含外边距） */
        slot: first.offsetWidth + parseFloat(getComputedStyle(first).marginRight) /* 步进槽宽 */
      };
    }
    function offsetOf(i) {
      /* 居中可视滑块；步进按槽宽（修复：原先把外边距算进居中宽度，整体偏左半个 margin） */
      var d = dims();
      return (viewport.clientWidth - d.box) / 2 - i * d.slot;
    }
    function apply(animate) {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = 'translateX(' + offsetOf(index) + 'px)';
      Array.prototype.forEach.call(track.children, function (n, i) {
        n.classList.toggle('active', i === index);
      });
    }
    function wrapReset() {
      if (index >= 2 * N) { index -= N; apply(false); }
      else if (index < N) { index += N; apply(false); }
    }
    function go(d) {
      index += d;
      apply(true);
      clearTimeout(go._t);
      go._t = setTimeout(wrapReset, 480); /* 过渡结束后静默回卷 */
    }

    function startAuto() {
      stopAuto();
      if (N < 2) return;
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(function () { go(1); }, AUTOPLAY_MS);
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

    if (N < 2) { prevBtn.hidden = true; nextBtn.hidden = true; }
    prevBtn.addEventListener('click', function () { go(-1); startAuto(); });
    nextBtn.addEventListener('click', function () { go(1); startAuto(); });

    gallery.addEventListener('pointerenter', stopAuto);
    gallery.addEventListener('pointerleave', startAuto);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto(); else startAuto();
    });

    /* ---------- 拖动（横向归轮播，纵向滚动不受影响） ---------- */
    var dragging = false, startX = 0, startIndex = 0, baseOffset = 0;
    viewport.addEventListener('pointerdown', function (e) {
      dragging = true;
      startX = e.clientX;
      startIndex = index;
      baseOffset = offsetOf(index);
      track.style.transition = 'none';
      if (viewport.setPointerCapture) viewport.setPointerCapture(e.pointerId);
      stopAuto();
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      track.style.transform = 'translateX(' + (baseOffset + e.clientX - startX) + 'px)';
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      index = startIndex + Math.round((startX - e.clientX) / dims().slot);
      if (index < N) index = N;             /* 钳位，避免拖出空档 */
      if (index > 2 * N - 1) index = 2 * N - 1;
      apply(true);
      startAuto();
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    window.addEventListener('resize', function () { apply(false); });

    apply(false);
    startAuto();
  })();

  /* ============================================
     照片墙：轮播右下"查看更多" → 全部照片网格 → 点击放大
     清单 pic/more_web/photos-more.js（prepare_more.py 生成）
     ============================================ */
  (function () {
    var moreBtn = el('gallery-more');
    if (!moreBtn) return;
    var modal = el('photo-modal');
    var lightbox = el('lightbox');
    var lbImg = el('lightbox-img');
    var lbCap = el('lightbox-caption');
    var pics = window.MORE_PICTURE_LIST || [];

    if (!pics.length) { moreBtn.hidden = true; return; }
    el('photo-count').textContent = '（共 ' + pics.length + ' 张）';

    var grid = el('photo-grid');
    grid.innerHTML = pics.map(function (p, i) {
      return '<button type="button" class="photo-thumb" data-i="' + i + '">' +
        '<span class="ph-img"><img src="pic/more_web/' + encodeURIComponent(p.file) +
          '" alt="' + esc(p.name) + '" loading="lazy"></span>' +
        '<span class="photo-name">' + esc(p.name) + '</span>' +
      '</button>';
    }).join('');

    function openModal() {
      modal.hidden = false;
      document.body.classList.add('modal-open');
    }
    function closeModal() {
      modal.hidden = true;
      if (lightbox.hidden) document.body.classList.remove('modal-open');
    }
    function openLightbox(i) {
      var p = pics[i];
      lbImg.src = 'pic/more_web/' + encodeURIComponent(p.file);
      lbImg.alt = p.name;
      lbCap.textContent = p.name;
      lightbox.hidden = false;
    }
    function closeLightbox() {
      lightbox.hidden = true;
      if (modal.hidden) document.body.classList.remove('modal-open');
    }

    moreBtn.addEventListener('click', openModal);
    el('photo-modal-close').addEventListener('click', closeModal);
    el('photo-modal-backdrop').addEventListener('click', closeModal);
    grid.addEventListener('click', function (e) {
      var t = e.target.closest('.photo-thumb');
      if (t) openLightbox(parseInt(t.dataset.i, 10));
    });
    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!lightbox.hidden) closeLightbox();
      else if (!modal.hidden) closeModal();
    });
  })();

  /* ============================================
     时间线（纯展示）
     ============================================ */
  var tlBox = el('timeline-list');
  D.timeline.forEach(function (t) {
    var item = document.createElement('div');
    item.className = 'timeline-item reveal' + (t.type === 'important' ? ' important' : '');

    item.innerHTML =
      '<span class="timeline-dot">' +
        icon(t.type === 'important' ? 'star' : 'calendar') +
      '</span>' +
      '<div class="timeline-card">' +
        '<span class="timeline-date">' + esc(t.date) + '</span>' +
        '<h3>' + esc(t.title) +
          (t.type === 'important' ? '<span class="badge-important">重要</span>' : '') +
        '</h3>' +
        '<p>' + esc(t.description) + '</p>' +
      '</div>';

    tlBox.appendChild(item);
  });

  /* ============================================
     快速链接
     ============================================ */
  var linksGrid = el('links-grid');
  D.quickLinks.forEach(function (l) {
    var a = document.createElement('a');
    a.className = 'link-card reveal' + (l.important ? ' link-important' : '');
    a.href = l.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML =
      '<span class="link-icon">' + icon(iconKey(l.icon)) + '</span>' +
      '<span class="link-info"><h3>' + esc(l.title) + '</h3><p>' + esc(l.description) + '</p></span>' +
      (l.important ? '<span class="link-badge">重要</span>' : '');
    linksGrid.appendChild(a);
  });

  /* ============================================
     页脚联系信息 & 友情链接
     ============================================ */
  var contact = el('footer-contact');
  var contactItems = [
    { icon: 'map-pin', text: D.contact.address },
    { icon: 'phone', text: D.contact.phone, href: 'tel:' + D.contact.phone },
    { icon: 'mail', text: D.contact.email, href: 'mailto:' + D.contact.email }
  ];
  contactItems.forEach(function (c) {
    var li = document.createElement('li');
    var text = esc(c.text).replace(/\n/g, '<br>');
    li.innerHTML = icon(c.icon) +
      (c.href ? '<a href="' + esc(c.href) + '">' + text + '</a>' : '<span>' + text + '</span>');
    contact.appendChild(li);
  });

  var fl = el('footer-links');
  D.friendlyLinks.forEach(function (l) {
    var li = document.createElement('li');
    li.innerHTML = '<a href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' +
                   esc(l.label) + '</a>';
    fl.appendChild(li);
  });

  /* ============================================
     页头滚动效果 / 移动端菜单 / 滚动侦测
     ============================================ */
  var header = el('site-header');
  var menuBtn = el('menu-toggle');
  menuBtn.innerHTML = icon('menu');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);

    /* 滚动侦测：高亮当前区块对应的导航项 */
    var ids = D.nav.map(function (n) { return n.href.slice(1); });
    var current = ids[0];
    ids.forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec && sec.getBoundingClientRect().top <= 120) current = id;
    });
    Array.prototype.forEach.call(nav.children, function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = icon(open ? 'x' : 'menu');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      menuBtn.innerHTML = icon('menu');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  el('back-to-top').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 滚动入场动画 ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (n) {
      io.observe(n);
    });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (n) {
      n.classList.add('visible');
    });
  }

  /* 兜底：若 IO 因环境限制（后台标签页、老旧 WebView）始终不触发，
     1.5s 后强制显示全部内容，避免页面永远空白 */
  setTimeout(function () {
    if (!document.querySelector('.reveal.visible')) {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (n) {
        n.classList.add('visible');
      });
    }
  }, 1500);
})();
