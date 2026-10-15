"""Run in the root of the existing universal-converter repository."""
from pathlib import Path
import shutil

root = Path.cwd()
package = Path(__file__).resolve().parent
if not (root / 'frontend/src/main.tsx').exists() or not (root / 'backend/main.py').exists():
    raise SystemExit('請先切換到 universal-converter 專案根目錄再執行。')


def change(path, before, after):
    p = root / path
    content = p.read_text(encoding='utf-8')
    if before not in content:
        raise SystemExit(f'{path} 找不到預期的原始內容，請先確認專案版本。')
    p.write_text(content.replace(before, after, 1), encoding='utf-8')


# Validate anchors before modifying files.
anchors = {
    'frontend/src/main.tsx': ["import PdfPage from './PdfPage';", "path === '/pdf' ? <PdfPage/> : path === '/' ?", '01 — 02', 'NO UPLOADS. NO ACCOUNT. JUST CONVERT.'],
    'backend/main.py': ['from fastapi.staticfiles import StaticFiles', 'app = FastAPI(title="Universal Converter")'],
}
for path, parts in anchors.items():
    data = (root / path).read_text(encoding='utf-8')
    for part in parts:
        if part not in data:
            raise SystemExit(f'{path} 版本不同，缺少：{part}')

for path in ['backend/audio.py', 'frontend/src/AudioPage.tsx', 'Dockerfile', 'docker-compose.yaml', 'README.md']:
    dest = root / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    src = package / path

    if src.resolve() != dest.resolve():
        shutil.copyfile(src, dest)

change('backend/main.py', 'from fastapi.staticfiles import StaticFiles', 'from fastapi.staticfiles import StaticFiles\nfrom .audio import router as audio_router')
change('backend/main.py', 'app = FastAPI(title="Universal Converter")', 'app = FastAPI(title="Universal Converter")\napp.include_router(audio_router)')
req = root / 'backend/requirements.txt'
text = req.read_text(encoding='utf-8')
if 'python-multipart' not in text:
    req.write_text(text.rstrip() + '\npython-multipart>=0.0.9\n', encoding='utf-8')

change('frontend/src/main.tsx', "import PdfPage from './PdfPage';", "import PdfPage from './PdfPage';\nimport AudioPage from './AudioPage';")
change('frontend/src/main.tsx', 'path === "/img" ? "theme-image" : ""', 'path === "/img" ? "theme-image" : path === "/audio" ? "theme-audio" : ""')
change('frontend/src/main.tsx', '<a className={path === \'/pdf\' ? \'current\' : \'\'} href="/pdf">PDF 工具</a>', '<a className={path === \'/pdf\' ? \'current\' : \'\'} href="/pdf">PDF 工具</a><a className={path === \'/audio\' ? \'current\' : \'\'} href="/audio">音訊轉換</a>')
change('frontend/src/main.tsx', "{path === '/pdf' ? <PdfPage/> : path === '/' ?", "{path === '/pdf' ? <PdfPage/> : path === '/audio' ? <AudioPage/> : path === '/' ?")
change('frontend/src/main.tsx', '圖片轉換、PDF 處理，一個地方就夠。', '圖片轉換、PDF 處理、音訊轉換，一個地方就夠。')
change('frontend/src/main.tsx', '無需註冊，檔案直接在瀏覽器完成處理。', '無需註冊，圖片與 PDF 在瀏覽器處理，音訊由伺服器轉換。')
change('frontend/src/main.tsx', '01 — 02', '01 — 03')
change('frontend/src/main.tsx', '<small>合併 / 擷取 / 旋轉 / 圖片互轉</small></a></div></div>', '<small>合併 / 擷取 / 旋轉 / 圖片互轉</small></a><a className="tool tool-audio" href="/audio"><span className="tool-number">03 / AUDIO</span><strong>音訊轉換 <ArrowRight size={24}/></strong><small>MP3 / WAV / M4A / FLAC / OGG</small></a></div></div>')
change('frontend/src/main.tsx', 'NO UPLOADS. NO ACCOUNT. JUST CONVERT.', 'NO ACCOUNT. JUST CONVERT.')

css = root / 'frontend/src/style.css'
css.write_text(css.read_text(encoding='utf-8') + '''
/* Audio page: dark surfaces with violet accents. */
.site.theme-audio h1 em,
.site.theme-audio .eyebrow,
.site.theme-audio .mini-icon,
.site.theme-audio .section-heading b span { color:#a78bfa; }
.site.theme-audio .pulse,
.site.theme-audio .status span { background:#7c3aed; }
.site.theme-audio .browse,
.site.theme-audio .convert,
.site.theme-audio .result-row button,
.site.theme-audio .formats button.active { background:#7c3aed; border-color:#7c3aed; color:#fff; }
.site.theme-audio .browse:hover,
.site.theme-audio .convert:hover:not(:disabled) { background:#8b5cf6; }
.site.theme-audio .dropzone:hover { border-color:#7c3aed; }
.site.theme-audio .upload-icon { color:#a78bfa; border-color:#5b3b93; }
.site.theme-audio .message { color:#c4b5fd; }
.home-tools .tool-audio { --tool-accent:#a78bfa; }
''', encoding='utf-8')
print('更新完成！執行 docker compose up --build')
