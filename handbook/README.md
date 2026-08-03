# 新生手册 · 多手册子站目录

本站下每本手册是**一套完全独立的子站**（各自的内容源、构建脚本、插图、页面），互不干扰。

| 目录 | 手册 | 内容源 | 构建输出 | 全局数据 |
|---|---|---|---|---|
| `ug/` | 本科生新生手册 2025 | `../手册内容/本科/` | `ug/js/content.js` | `HANDBOOK_UG_DATA` |
| `grad/`（待加） | 研究生新生手册 | `../手册内容/研究生/` | `grad/js/content.js` | `HANDBOOK_GRAD_DATA` |

## 结构说明（以 ug/ 为例）

```
handbook/
├── README.md            本说明
└── ug/                  本科手册子站
    ├── index.html       页面骨架（改书名/链接时动这里）
    ├── css/style.css    样式
    ├── js/
    │   ├── content.js   ★ 手册内容（由构建脚本生成，勿手改）
    │   └── app.js       路由 / 侧栏 / 页内目录 / 全文搜索
    ├── img/             插图 + img-meta.json（含 "category": "ug" 标记）
    └── build/
        └── build_content.py   构建脚本
```

## 各子站内部

```
handbook/ug/README.md    ug 子站使用说明（构建 / 预览 / 插图）
```

## 修改内容

1. 编辑对应子站的内容源 md（如 `手册内容/本科/*.md`）
2. 重新生成：
   ```bash
   python handbook/ug/build/build_content.py
   ```
3. 刷新页面即可（若浏览器仍显示旧内容，把对应 `index.html` 里 `content.js?v=N` 的 N +1）

## 根站（答疑首页）如何接入

- `index.html`：用 `<script src="handbook/ug/js/content.js?v=N">` 加载各册数据；
  「开始阅读」卡片指向 `handbook/ug/index.html`
- `js/app.js`：`buildHandbookIndex()` 读 `window.HANDBOOK_UG_DATA` 建搜索索引；
  手册搜索结果的跳转链接指向 `handbook/ug/index.html#/章节`

## 如何加一本新手册（以研究生手册 grad 为例）

1. 建内容源目录 `手册内容/研究生/`，放各章 md（命名、占位符格式与本科一致）
2. 复制 `ug/` 整站为 `grad/`：
   ```bash
   cp -r handbook/ug handbook/grad
   ```
3. 改 `grad/build/build_content.py` 顶部的 `BOOK_ID = "grad"`，并把
   `SRC` 里的「本科」改成「研究生」
4. 删掉 `grad/img/` 里的旧图，重新放新图；重建 content.js
5. 改 `grad/index.html` 的书名文案，并在根站 `index.html` 里
   追加 `<script src="handbook/grad/js/content.js">`；搜索逻辑里并列读
   `window.HANDBOOK_GRAD_DATA` 即可

> 每本手册数据用独立全局变量（`HANDBOOK_UG_DATA` / `HANDBOOK_GRAD_DATA`…），
> 多册可同时被根站加载而不互相覆盖。
