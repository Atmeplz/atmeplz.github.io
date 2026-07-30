# -*- coding: utf-8 -*-
"""
扫描 pic/ 目录下的图片，生成网页用的 photos.js 清单。
照片增删后，双击同目录的"更新照片清单.bat"运行一次即可。

可选：在 NAMES 里给文件配展示名（用于无障碍 alt 文本）。
"""
import os
import json

NAMES = {
    "01.jpg": "信院",
    "02.jpg": "小巨蛋",
    "03.jpg": "德旺图书馆",
    "04.jpg": "晚霞",
    "05.jpg": "楼群",
    "06.jpg": "社团",
    "07.jpg": "黑天鹅",
}

EXTS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')

here = os.path.dirname(os.path.abspath(__file__))
files = sorted(f for f in os.listdir(here) if f.lower().endswith(EXTS))

if not files:
    print('警告：pic/ 目录下没有找到图片')

items = [{"file": f, "name": NAMES.get(f, os.path.splitext(f)[0])} for f in files]
out = "window.PICTURE_LIST = " + json.dumps(items, ensure_ascii=False, indent=2) + ";\n"

with open(os.path.join(here, 'photos.js'), 'w', encoding='utf-8', newline='\n') as fp:
    fp.write(out)

print('已生成 photos.js，共 %d 张：%s' % (len(files), ', '.join(files)))
