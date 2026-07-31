# -*- coding: utf-8 -*-
"""
一键处理 pic/more/ 里的原图：
1. 压缩到 pic/more_web/m01.jpg …（最长边 1920px，JPEG 80%，体积约为原图 1/20）
2. 生成 photos-more.js：编号 → 中文展示名（取自原文件名）的清单
3. 同步提升 index.html 中 photos-more.js 的版本号，避免浏览器缓存旧清单

原图保留在 pic/more/ 不动（已被 .gitignore 排除，不会上传）。
照片增删后，双击"更新照片清单.bat"重跑即可（会重新编号）。
"""
import os
import json
import re

EXTS = ('.jpg', '.jpeg', '.png', '.webp')
MAX_SIDE = 1920
QUALITY = 80

here = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(here, 'more')
out_dir = os.path.join(here, 'more_web')

files = sorted(f for f in os.listdir(src_dir) if f.lower().endswith(EXTS))
if not files:
    print('pic/more/ 下没有找到图片')
    raise SystemExit

os.makedirs(out_dir, exist_ok=True)

from PIL import Image

items = []
for i, f in enumerate(files, 1):
    dst_name = 'm%02d.jpg' % i
    dst = os.path.join(out_dir, dst_name)
    im = Image.open(os.path.join(src_dir, f))
    if im.mode != 'RGB':
        im = im.convert('RGB')
    w, h = im.size
    if max(w, h) > MAX_SIDE:
        r = MAX_SIDE / max(w, h)
        im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)
    im.save(dst, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
    items.append({'file': dst_name, 'name': os.path.splitext(f)[0]})

out = 'window.MORE_PICTURE_LIST = ' + json.dumps(items, ensure_ascii=False, indent=2) + ';\n'
with open(os.path.join(out_dir, 'photos-more.js'), 'w', encoding='utf-8', newline='\n') as fp:
    fp.write(out)

total = sum(os.path.getsize(os.path.join(out_dir, it['file'])) for it in items)
print('已处理 %d 张 → %s（共 %.1f MB）' % (len(items), out_dir, total / 1048576))

# 同步提升 index.html 中 photos-more.js 的版本号
index_path = os.path.join(here, '..', 'index.html')
with open(index_path, encoding='utf-8') as fp:
    html = fp.read()
m = re.search(r'photos-more\.js\?v=(\d+)', html)
if m:
    html = re.sub(r'photos-more\.js\?v=\d+',
                  'photos-more.js?v=%d' % (int(m.group(1)) + 1), html)
else:
    html = html.replace('photos-more.js', 'photos-more.js?v=1', 1)
with open(index_path, 'w', encoding='utf-8', newline='') as fp:
    fp.write(html)
print('index.html 引用版本已同步')
