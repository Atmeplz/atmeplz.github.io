/* ============================================
   手册插图灯箱：点击图片全屏预览
   - 滚轮 / 双指捏合：以指针为中心缩放（1x–5x）
   - 鼠标拖动 / 单指滑动：平移图片
   - 右上角 × 或 Esc 关闭
   零依赖，Pointer Events 统一处理鼠标与触屏
   ============================================ */
(function () {
  "use strict";

  var MIN_SCALE = 1;
  var MAX_SCALE = 5;

  var lightbox = document.getElementById("img-lightbox");
  var stage = document.getElementById("img-lightbox-stage");
  var lightboxImg = document.getElementById("img-lightbox-img");
  var closeBtn = document.getElementById("img-lightbox-close");
  if (!lightbox || !stage || !lightboxImg) return;

  /* ---------- 状态 ---------- */
  var scale = 1, tx = 0, ty = 0;
  var pointers = {};        /* pointerId -> {x, y} */
  var gesture = null;       /* 双指模式缓存 {dist, midX, midY} */
  var dragStart = null;     /* 单指拖动起点 {x, y, tx, ty} */

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function apply() {
    stage.style.transform =
      "translate(" + tx + "px, " + ty + "px) scale(" + scale + ")";
  }

  /* 以视口内坐标 (cx, cy) 为中心缩放 factor 倍 */
  function zoomAt(cx, cy, factor) {
    var rect = lightbox.getBoundingClientRect();
    var px = cx - rect.left - rect.width / 2;
    var py = cy - rect.top - rect.height / 2;
    var next = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
    factor = next / scale; /* 触及边界后按实际倍率回算 */
    tx = px - (px - tx) * factor;
    ty = py - (py - ty) * factor;
    scale = next;
    apply();
  }

  /* ---------- 打开 / 关闭 ---------- */
  function open(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    scale = 1; tx = 0; ty = 0;
    apply();
    lightbox.hidden = false;
    document.body.classList.add("img-lightbox-open"); /* 锁定页面滚动 */
    /* 下一帧再播淡入动画 */
    requestAnimationFrame(function () { lightbox.classList.add("show"); });
  }

  function close() {
    lightbox.classList.remove("show");
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.classList.remove("img-lightbox-open");
  }

  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) close();
  });

  /* ---------- 触发：点击正文插图 ---------- */
  document.addEventListener("click", function (e) {
    var img = e.target.closest(".fig-photo img");
    if (!img || lightbox.hidden === false) return;
    var full = img.src;
    /* 若 src 带版本号或编码，取原始路径即可直接用于 img.src */
    open(full, img.alt);
  });

  /* ---------- 缩放：滚轮（以光标为中心） ---------- */
  stage.addEventListener("wheel", function (e) {
    if (lightbox.hidden) return;
    e.preventDefault();
    var factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(e.clientX, e.clientY, factor);
  }, { passive: false });

  /* ---------- 平移 + 捏合：Pointer Events ---------- */
  stage.addEventListener("pointerdown", function (e) {
    if (lightbox.hidden) return;
    stage.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (Object.keys(pointers).length === 1) {
      dragStart = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      gesture = null;
    } else if (Object.keys(pointers).length === 2) {
      dragStart = null; /* 进入双指模式，交给捏合 */
      gesture = pinchState();
    }
  });

  function pinchState() {
    var ids = Object.keys(pointers);
    var p1 = pointers[ids[0]];
    var p2 = pointers[ids[1]];
    return {
      dist: Math.hypot(p1.x - p2.x, p1.y - p2.y),
      midX: (p1.x + p2.x) / 2,
      midY: (p1.y + p2.y) / 2
    };
  }

  stage.addEventListener("pointermove", function (e) {
    var p = pointers[e.pointerId];
    if (!p) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);

    if (ids.length === 1 && dragStart) {
      /* 单指 / 鼠标：平移 */
      tx = dragStart.tx + (e.clientX - dragStart.x);
      ty = dragStart.ty + (e.clientY - dragStart.y);
      apply();
    } else if (ids.length === 2 && gesture) {
      /* 双指：捏合缩放（以双指中点为中心）+ 中点位移平移 */
      var next = pinchState();
      if (gesture.dist > 0) {
        zoomAt(next.midX, next.midY, next.dist / gesture.dist);
      }
      tx += next.midX - gesture.midX;
      ty += next.midY - gesture.midY;
      apply();
      gesture = next;
    }
  });

  function endPointer(e) {
    delete pointers[e.pointerId];
    var ids = Object.keys(pointers);
    if (ids.length === 1) {
      /* 双指抬起一根后回到单指，重置拖动起点防止跳变 */
      var p = pointers[ids[0]];
      dragStart = { x: p.x, y: p.y, tx: tx, ty: ty };
      gesture = null;
    } else if (ids.length === 0) {
      dragStart = null;
      gesture = null;
    } else if (ids.length === 2) {
      gesture = pinchState();
    }
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
})();
