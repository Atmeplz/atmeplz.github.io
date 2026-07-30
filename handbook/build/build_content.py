# -*- coding: utf-8 -*-
"""
手册内容 md -> handbook/js/content.js 转换脚本
用法：python build_content.py
输入：../手册内容/*.md（按文件名排序）
输出：../js/content.js（window.HANDBOOK_DATA）
"""
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "..", "..", "手册内容")
OUT = os.path.join(BASE, "..", "js", "content.js")

# 章节元数据（顺序即侧边栏顺序）
CHAPTERS = [
    ("00_封面与目录.md",               "00", "封面与目录",           "0.1–0.3"),
    ("01_学院介绍_p1-2.md",            "01", "学院介绍",             "1–2"),
    ("02_强军战歌_p3-4.md",            "02", "强军战歌（军训）",      "3–4"),
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
        if s.startswith("<!--"):
            i += 1
            continue

        # 图片/二维码/地图/截图占位
        m = re.fullmatch(r"【(图片|二维码|地图|截图)：(.+)】", s)
        if m:
            kind, desc = m.group(1), m.group(2)
            fig_count += 1
            pid = cur_page.replace(".", "-")
            html.append(
                f'<figure class="fig-placeholder" data-kind="{kind}" id="fig-p{pid}-{fig_count}">'
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
            "bookTitle": "新生手册 2025",
            "org": "厦门大学信息学院（特色化示范性软件学院）",
            "producedBy": "厦门大学信息学院团委 · 学生会 · 本科生团总支 出品",
            "source": "原书扫描页 0.1–46 + 封底，经文字识别与人工校对",
        },
        "chapters": chapters,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("// 由 build/build_content.py 自动生成，请勿手改；改内容请编辑 md 后重新生成\n")
        f.write("window.HANDBOOK_DATA = ")
        f.write(json.dumps(data, ensure_ascii=False, indent=1))
        f.write(";\n")
    print(f"\n生成 {os.path.relpath(OUT, BASE)}，共 {len(chapters)} 章")

if __name__ == "__main__":
    main()
