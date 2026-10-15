from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .audio import router as audio_router

app = FastAPI(title="Universal Converter")
app.include_router(audio_router)
dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

@app.get('/api/health')
def health():
    return {'status': 'ok'}

if dist.exists():
    app.mount('/assets', StaticFiles(directory=dist / 'assets'), name='assets')

    @app.get('/{path:path}')
    def frontend(path: str):
        requested = (dist / path).resolve()
        if requested.is_relative_to(dist.resolve()) and requested.is_file():
            return FileResponse(requested)
        return FileResponse(dist / 'index.html')
