# -*- coding: utf-8 -*-
"""
本科新生手册内容 md -> handbook/ug/js/content.js 转换脚本
用法：python build_content.py
输入：../../手册内容/本科/*.md（按文件名排序）
输出：../js/content.js（window.HANDBOOK_UG_DATA）
"""
import json
import os
import re
import shutil
import sys

# 手册标识（英文目录名 / 全局数据变量名），将来每本手册一份独立子站：
#   本科 -> ug（本脚本），研究生 -> grad，变量名对应 HANDBOOK_UG_DATA / HANDBOOK_GRAD_DATA
BOOK_ID = "ug"

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "..", "..", "..", "手册内容", "本科")
OUT = os.path.join(BASE, "..", "js", "content.js")

# 插图目录与命名规则：
#   handbook/ug/img/ 是该子站唯一插图目录（构建时读取并生成 img/{文件名} 引用）。
#   - 自动同步的图：{章号}-p{页码}-img{该章第N张图}.png（由 sync_source_images 生成）
#   - 手动命名：{章号}{描述}.png（中文描述，精确匹配）或 {章号}-p{页码}-{英文}.png（按页码匹配）
IMG_DIR = os.path.join(BASE, "..", "img")

# 源图片目录：用户只需把自然语言命名的图片放进来，构建时自动匹配并同步到 IMG_DIR
SRC_IMG_DIR = os.path.join(SRC, "手册插入图片")

# 图片描述元数据：自动同步时记录「img 文件名 -> 占位符描述」，
# 供 find_image 按自然语言描述精确配对（而不是只按页码顺序猜）
META_FILE = os.path.join(IMG_DIR, "img-meta.json")


def load_img_meta():
    if os.path.isfile(META_FILE):
        with open(META_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_img_meta(meta):
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)


IMG_META = {}
IMG_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".webp")


def scan_images():
    """扫描插图目录，返回文件名列表（按名称排序）。"""
    if not os.path.isdir(IMG_DIR):
        return []
    return sorted(f for f in os.listdir(IMG_DIR) if f.lower().endswith(IMG_EXTS))


IMG_FILES = scan_images()


def find_image(num, desc, pid):
    """按命名规则在插图目录中查找与占位符对应的文件，返回文件名或 None。
    规则（按优先级）：
    1) {章号}{描述}.png 精确匹配（中文描述命名）；
    2) 自动同步图片（img-meta.json 记录了描述）在同页内按描述精确匹配；
    3) 无描述记录的手动命名 {章号}-p{页码}-*.png 按页面顺序匹配。
    每个文件只被消费一次，且描述不符时不会错配到同页其它占位符。"""
    # 1) 精确：{章号}{描述}.png
    exact = f"{num}{desc}.png"
    if exact in IMG_FILES and exact not in USED_IMAGES:
        USED_IMAGES.add(exact)
        return exact
    # 2) 同页候选
    if re.fullmatch(r"[\d-]+", pid):
        prefix = f"{num}-p{pid}-"
        cands = [f for f in IMG_FILES if f.startswith(prefix) and f not in USED_IMAGES]
        if cands:
            norm = normalize_desc(desc)
            # 优先：描述精确一致（自然语言命名的图）
            by_desc = [f for f in cands if normalize_desc(IMG_META.get(f, "")) == norm]
            if by_desc:
                f = sorted(by_desc)[0]
                USED_IMAGES.add(f)
                return f
            # 其次：无描述记录的手动命名文件
            manual = [f for f in cands if f not in IMG_META]
            if manual:
                f = sorted(manual)[0]
                USED_IMAGES.add(f)
                return f
    return None


USED_IMAGES = set()

# 手动档位覆盖：占位符描述 -> 额外 class。
# 用于自动关键词分类无法区分的特殊图（如"卡通插画/立体插画"装饰小图
# 与"正文叙事插画"都叫"插画"，无法靠关键词区分时在此显式指定）。
MANUAL_CLASS_OVERRIDES = {
    "公交站台与公交车的卡通插画": "fig-deco",
    "道路与安检闸机的立体插画": "fig-deco",
    "健身房内人们运动的立体插画": "fig-deco",
    "音响与派对人物的装饰插画，配大字“运动”": "fig-deco",
    "地球与网络信号图标插画": "fig-deco",
    "黄色文件夹与报纸插画": "fig-deco",
    "无旁边标注文字（二维码中央有卡通形象）": "fig-deco",
    "页面背景为信息学院院徽水印，外圈英文\"SCHOOL OF INFORMATICS XIAMEN UNIVERSITY\"": "fig-wide",
    "页面底部为厦门大学建筑群（群贤楼群风格）线描图": "fig-wide",
}


def normalize_desc(desc):
    """归一化描述文字：去掉空白、中文标点与括号，并把连接词/符号归一为空。
    覆盖常见差异：空格、括号、引号、顿号、"与/和/及"、"+"、"&"、"×"等。"""
    text = re.sub(r"[与和及]", "", desc)
    return re.sub(r"[\s，。、：:；;（）()【】\[\]\"'“”‘’——\-—_·+&/×*]+", "", text)


def collect_placeholders():
    """扫描所有章节 md，收集 (章号, 页码id, 描述) 占位符列表（解析逻辑与 convert 一致）。"""
    ph = []
    for fname, num, _t, _p in CHAPTERS:
        path = os.path.join(SRC, fname)
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            lines = f.read().splitlines()
        cur_page = "0"
        for raw in lines:
            s = raw.strip()
            if not s:
                continue
            m = re.fullmatch(r"<!--\s*p\.([\d.]+)\s*(.*?)\s*-->", s)
            if m:
                cur_page = m.group(1)
                continue
            if s == "<!-- 封底 -->":
                cur_page = "封底"
                continue
            m = re.fullmatch(r"【(图片|二维码|地图|截图)：(.+)】", s)
            if m:
                ph.append((num, cur_page.replace(".", "-"), m.group(2)))
    return ph


def sync_source_images():
    """把 手册内容/本科/手册插入图片/ 里的自然语言命名图片匹配到占位符，剪切到 handbook/ug/img/。

    匹配规则（按优先级）：
    1) 文件名与某占位符描述完全相同；
    2) 文件名以章号开头，且描述互为子串（如“04厦门大学嘉庚风格建筑群照片”）。
    统一改写为 {章号}-p{页码}-img{序号}.png，随后 find_image 按页码规则自动配对。
    """
    if not os.path.isdir(SRC_IMG_DIR):
        return
    src_files = sorted(f for f in os.listdir(SRC_IMG_DIR) if f.lower().endswith(IMG_EXTS))
    if not src_files:
        print("  源图片目录为空，无需同步")
        return
    ph = [(num, pid, desc, normalize_desc(desc)) for num, pid, desc in collect_placeholders()]
    os.makedirs(IMG_DIR, exist_ok=True)
    meta = load_img_meta()
    changed = False
    for fname in src_files:
        stem, ext = os.path.splitext(fname)
        norm = normalize_desc(stem)
        best = None  # (score, num, pid, desc)
        for num, pid, desc, nd in ph:
            if nd == norm:
                score = 3
            elif norm.startswith(num):
                body = norm[len(num):]  # 去掉章号前缀后再比较，兼容截断的文件名
                if nd in norm or body in nd or nd in body:
                    score = 2
                else:
                    score = 0
            else:
                score = 0
            if score > (best[0] if best else 0):
                best = (score, num, pid, desc)
        if best is None:
            print(f"   !! 无法匹配任何占位符：{fname}（已跳过，可手动处理）")
            continue
        score, num, pid, desc = best
        seq = 1 + len([f for f in os.listdir(IMG_DIR) if f.startswith(f"{num}-p{pid}-img")])
        target = f"{num}-p{pid}-img{seq}{ext.lower()}"
        target_path = os.path.join(IMG_DIR, target)
        if os.path.exists(target_path):
            print(f"   !! 目标已存在，跳过：{fname} -> {target}")
            continue
        shutil.move(os.path.join(SRC_IMG_DIR, fname), target_path)
        meta[target] = desc  # 记录描述，供 find_image 精确配对
        changed = True
        print(f"   [同步] {fname} -> {target}（{num}章 第{pid}页：{desc}）")
    if changed:
        save_img_meta(meta)

# 章节元数据（顺序即侧边栏顺序）
CHAPTERS = [
    ("00_最新更新.md",               "00", "最新更新",             "更新日志"),
    ("01_学院介绍_p1-2.md",            "01", "学院介绍",             "1–2"),
    ("02_强军战歌_p3-4.md",            "02", "军训",                 "3–4"),
    ("03_安全守则_p5-6.md",            "03", "安全守则",             "5–6"),
    ("04_学习攻略_p7-10.md",           "04", "学习攻略",             "7–10"),
    ("05_第二课堂_p11-14.md",          "05", "第二课堂",             "11–14"),
    ("06_校内美食攻略_p14-16.md",      "06", "校内美食攻略",          "14–16"),
    ("07_出行指南_p17-20.md",          "07", "出行指南",             "17–20"),
    ("08_运动_p20.md",                 "08", "运动",                 "20"),
    ("09_校园设施_p21-22.md",          "09", "校园设施",             "21–22"),
    ("10_证件办理充值及使用_p23-26.md","10", "证件办理、充值及使用",  "23–26"),
    ("11_就医指南_p27-28.md",          "11", "就医指南",             "27–28"),
    ("12_常用网址公众号电话及APP_p29-34.md", "12", "常用网址、公众号、电话及APP", "29–34"),
    ("13_校园网VPN连接_p35-36.md",     "13", "校园网、VPN连接",       "35–36"),
    ("14_学生会本科生团总支_p37-39.md","14", "学生会、本科生团总支",  "37–39"),
    ("15_社团及组织_p40-44.md",        "15", "社团及组织",           "40–44"),
    ("16_结尾寄语与封底_p45-46.md",    "16", "结尾寄语与封底",        "45–46 + 封底"),
]

FIG_KINDS = ["图片", "二维码", "地图", "截图"]

def inline(text):
    """行内格式：转义 + 还原 <u> + 粗体"""
    text = text.replace("<u>", "\x00U\x00").replace("</u>", "\x00/U\x00")
    text = (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    text = text.replace("\x00U\x00", "<u>").replace("\x00/U\x00", "</u>")
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    return text

def convert(num, lines):
    html = []
    i = 0
    h_count = 0
    fig_count = 0
    cur_page = "0"
    first_h1_seen = False

    def hid():
        nonlocal h_count
        h_count += 1
        return f"c{num}-h{h_count}"

    while i < len(lines):
        line = lines[i].rstrip()
        s = line.strip()

        if not s:
            i += 1
            continue

        # 跳过：来源引用、注释（非页码锚点）、页脚
        if s.startswith("> 来源文件"):
            i += 1
            continue
        if re.fullmatch(r"(页脚：)?page \d+", s):
            i += 1
            continue

        # 页码锚点（不再输出"原书第 N 页"标记，仅记录页码供图片 id 使用）
        m = re.fullmatch(r"<!--\s*p\.([\d.]+)\s*(.*?)\s*-->", s)
        if m:
            cur_page = m.group(1)
            i += 1
            continue
        if s == "<!-- 封底 -->":
            cur_page = "封底"
            i += 1
            continue
        # 原始 HTML 透传：`<!-- RAW-HTML -->` 与 `<!-- /RAW-HTML -->` 之间的行原样输出，
        # 不做转义/解析，用于普通 md 语法表达不了的提示框等（如 00 章的"研究生手册"红框）
        if s == "<!-- RAW-HTML -->":
            raw = []
            i += 1
            while i < len(lines):
                if lines[i].strip() == "<!-- /RAW-HTML -->":
                    i += 1
                    break
                raw.append(lines[i])
                i += 1
            if raw:
                html.append("\n".join(raw))
            continue
        if s.startswith("<!--"):
            i += 1
            continue

        # 图片/二维码/地图/截图占位
        m = re.fullmatch(r"【(图片|二维码|地图|截图)：(.+)】", s)
        if m:
            kind, desc = m.group(1), m.group(2)
            fig_count += 1
            pid = cur_page.replace(".", "-")
            figid = f"fig-p{pid}-{fig_count}"
            img_file = find_image(num, desc, pid)
            if img_file:
                # 手动档位覆盖优先；其次按描述自动分类尺寸：
                # App图标 → fig-icon；装饰性小插图（"插图"或位置词）→ fig-deco；其余 → 正常
                if desc in MANUAL_CLASS_OVERRIDES:
                    cls = "fig-photo " + MANUAL_CLASS_OVERRIDES[desc]
                elif "图标" in desc:
                    cls = "fig-photo fig-icon"
                elif "插图" in desc or any(w in desc for w in ("标题旁", "右上方", "页面中部", "右下角")):
                    cls = "fig-photo fig-deco"
                else:
                    cls = "fig-photo"
                print(f"   [图] 章{num} 第{pid}页 已匹配 {img_file}（{cls}）")
                html.append(
                    f'<figure class="{cls}" id="{figid}">'
                    f'<img src="img/{img_file}" alt="{inline(desc)}">'
                    f'</figure>'
                )
            else:
                html.append(
                    f'<figure class="fig-placeholder" data-kind="{kind}" id="{figid}">'
                    f'<div class="fig-box"><span class="fig-tag">{kind}</span>'
                    f'<span class="fig-desc">{inline(desc)}</span>'
                    f'<span class="fig-hint">插图待补</span></div>'
                    f'</figure>'
                )
            i += 1
            continue

        # 表格
        if s.startswith("|"):
            tbl = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                tbl.append(lines[i].strip())
                i += 1
            rows = []
            for r in tbl:
                cells = [c.strip() for c in r.strip("|").split("|")]
                if all(re.fullmatch(r":?-{2,}:?", c or "---") for c in cells):
                    continue  # 分隔行
                rows.append(cells)
            if rows:
                out = ['<div class="table-wrap"><table>']
                head, body = rows[0], rows[1:]
                if any(head):
                    out.append("<thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead>")
                out.append("<tbody>")
                for r in body:
                    out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
                out.append("</tbody></table></div>")
                html.append("".join(out))
            continue

        # 标题
        m = re.fullmatch(r"(#{1,4})\s+(.+)", s)
        if m:
            level = len(m.group(1))
            title = m.group(2).strip()
            if level == 1:
                if not first_h1_seen:
                    first_h1_seen = True  # 章节名，侧边栏已有，正文不再重复
                else:
                    html.append(f'<div class="chapter-banner" id="{hid()}"><span>{inline(title)}</span></div>')
            else:
                tag = f"h{level}"
                html.append(f'<{tag} id="{hid()}">{inline(title)}</{tag}>')
            i += 1
            continue

        # 无序列表（支持两级缩进）
        if re.match(r"^- ", s) or re.match(r"^\s{2,}- ", line):
            items = []
            while i < len(lines):
                raw = lines[i].rstrip()
                st = raw.strip()
                if re.match(r"^- ", st) or re.match(r"^\s{2,}- ", raw):
                    indent = len(raw) - len(raw.lstrip())
                    text = re.sub(r"^- ", "", st)
                    items.append((1 if indent >= 2 else 0, text))
                    i += 1
                else:
                    break
            out = ['<ul class="doc-list">']
            sub_open = False
            for lvl, text in items:
                if lvl == 1 and not sub_open:
                    out.append('<ul class="doc-sub">'); sub_open = True
                if lvl == 0 and sub_open:
                    out.append("</ul>"); sub_open = False
                out.append(f"<li>{inline(text)}</li>")
            if sub_open:
                out.append("</ul>")
            out.append("</ul>")
            html.append("".join(out))
            continue

        # 有序列表（1. 或 1、 开头，点后可无空格）
        m = re.match(r"^(\d+)[.、]\s*(.+)", s)
        if m:
            items = []
            while i < len(lines):
                st = lines[i].strip()
                mm = re.match(r"^(\d+)[.、]\s*(.+)", st)
                if mm and not st.startswith("|"):
                    items.append(mm.group(2))
                    i += 1
                else:
                    break
            html.append('<ol class="doc-list">' + "".join(f"<li>{inline(t)}</li>" for t in items) + "</ol>")
            continue

        # 普通段落
        html.append(f"<p>{inline(s)}</p>")
        i += 1

    return "\n".join(html)

def main():
    sync_source_images()
    global IMG_FILES
    IMG_FILES = scan_images()
    global IMG_META
    IMG_META.update(load_img_meta())
    # 无论本轮是否同步了新图，都确保 img-meta.json 带手册标识（多手册并存时用于区分）
    if IMG_META.get("category") != BOOK_ID:
        IMG_META["category"] = BOOK_ID
        save_img_meta(IMG_META)
    print(f"插图目录扫描：{len(IMG_FILES)} 个文件 -> {IMG_FILES or '(空)'}")
    chapters = []
    for fname, num, title, pages in CHAPTERS:
        path = os.path.join(SRC, fname)
        if not os.path.exists(path):
            print(f"!! 缺文件：{fname}", file=sys.stderr)
            sys.exit(1)
        with open(path, encoding="utf-8") as f:
            lines = f.read().splitlines()
        html = convert(num, lines)
        chapters.append({"id": num, "title": title, "pages": pages, "html": html})
        print(f"OK {num} {title}  html={len(html)}字符")

    data = {
        "meta": {
            "category": BOOK_ID,
            "bookTitle": "本科新生手册 2025",
            "org": "厦门大学信息学院（特色化示范性软件学院）",
            "producedBy": "厦门大学信息学院团委 · 学生会 · 本科生团总支 出品",
            "source": "原书扫描页 0.1–46 + 封底，经文字识别与人工校对",
        },
        "chapters": chapters,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("// 由 build/build_content.py 自动生成，请勿手改；改内容请编辑 md 后重新生成\n")
        f.write(f"window.HANDBOOK_{BOOK_ID.upper()}_DATA = ")
        f.write(json.dumps(data, ensure_ascii=False, indent=1))
        f.write(";\n")
    print(f"\n生成 {os.path.relpath(OUT, BASE)}，共 {len(chapters)} 章")

if __name__ == "__main__":
    main()
