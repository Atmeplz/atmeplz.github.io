# 本科生新生手册 2025 · docs 版

《厦门大学信息学院 2025 本科生新生手册》的在线文档版，与主站（新生答疑平台）同一视觉语言。
纯静态 HTML/CSS/JS，**零依赖、可离线运行**，双击 `index.html` 即可打开。

> 本站是 `handbook/` 下的多手册子站之一（本科 = `ug`），顶层结构与
> 如何加入第二本手册见 [`handbook/README.md`](../README.md)。

## 目录结构

```
handbook/ug/
├── index.html            页面骨架（页头/侧栏/正文/右栏页内导航）
├── css/
│   └── style.css         全部样式（docs 三栏布局、响应式、动效）
├── js/
│   ├── content.js        ★ 手册全部内容（由脚本生成，勿手改；window.HANDBOOK_UG_DATA）
│   └── app.js            路由 / 侧栏 / 页内目录 / 全文搜索逻辑
├── img/                  插图 + img-meta.json（含 "category": "ug" 标记）
└── build/
    └── build_content.py  内容生成脚本（md → content.js）
```

## 功能

- **Hash 路由**：`index.html#/05` 直达某章，`#/02/c02-h2` 直达某节，可分享、可前进后退
- **全文搜索**：页头搜索框，支持标题/正文/表格/图注，按 `/` 快速聚焦，↑↓ 选择、回车跳转，命中段落闪烁高亮
- **左侧章节目录**：17 章；页头 ☰ 按钮可收起/展开（桌面端折叠为单栏宽屏，移动端为抽屉式、默认收起）
- **页内小标题导航**：桌面端右侧锚点圆点，悬浮展开标签、点击跳转、滚动高亮（移动端不显示）
- **上一章 / 下一章**、返回顶部、主站互链（页头"答疑首页"）

## 如何修改内容

1. 编辑 `手册内容/本科/*.md`（源头文本）
2. 重新生成：
   ```bash
   cd handbook/ug/build
   python build_content.py
   ```
   （或 `python handbook/ug/build/build_content.py`，脚本用自身路径定位，在哪跑都行）
3. 刷新页面即可（若浏览器仍显示旧内容，把 `handbook/ug/index.html` 里
   `content.js?v=N` 的 N +1）

## 插图补入指南

正文中的虚线框是插图占位符，每个都有稳定 id，格式为 `fig-p{页码}-{序号}`，例如：

```html
<figure class="fig-placeholder" data-kind="图片" id="fig-p14-1">
```

补图时把对应 `<figure>` 整体替换为：

```html
<figure class="fig-photo">
  <img src="img/p14-1.jpg" alt="（图片描述）">
</figure>
```

建议图片放在 `handbook/ug/img/` 下，从原书扫描页裁切（`C:\Users\Atmeplz\Downloads\新生手册\`）。
占位的 `data-kind` 标明了类型：图片 / 二维码 / 地图 / 截图。
日常补图请走自动流水线：把图丢进 `手册内容/本科/手册插入图片/`，再跑构建脚本
（详见 `.agents/skills/handbook-image-pipeline/SKILL.md`）。

## 本地预览

直接双击 `index.html`，或：

```bash
python -m http.server 8765
# 打开 http://127.0.0.1:8765/handbook/ug/
```
