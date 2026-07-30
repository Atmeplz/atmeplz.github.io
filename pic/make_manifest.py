# -*- coding: utf-8 -*-
"""
扫描 pic/ 目录下的图片，生成网页用的 photos.js 清单。
照片增删后，双击同目录的"更新照片清单.bat"运行一次即可。

可选：在 NAMES 里给文件配展示名（用于无障碍 alt 文本）。
"""
import os
import json
import re

NAMES = {
    "01.jpg": "信院",
    "02.jpg": "小巨蛋",
    "03.jpg": "德旺图书馆",
    "06.jpg": "社团",
    "07.jpg": "校园",
    "08.jpg": "军训拉练",
    "09.jpg": "篮球赛",
    "10.jpg": "十佳歌手",
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

# 同步提升 index.html 中 photos.js 的版本号，避免浏览器缓存旧清单
index_path = os.path.join(here, '..', 'index.html')
with open(index_path, encoding='utf-8') as fp:
    html = fp.read()
m = re.search(r'pic/photos\.js\?v=(\d+)', html)
if m:
    html = re.sub(r'pic/photos\.js\?v=\d+',
                  'pic/photos.js?v=%d' % (int(m.group(1)) + 1), html)
else:
    html = html.replace('pic/photos.js', 'pic/photos.js?v=1', 1)
with open(index_path, 'w', encoding='utf-8', newline='') as fp:
    fp.write(html)
print('index.html 引用版本已同步（缓存自动失效）')
