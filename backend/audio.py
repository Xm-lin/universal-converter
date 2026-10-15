import asyncio
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

router = APIRouter()
FORMATS = {
    'mp3': ['-c:a', 'libmp3lame', '-b:a', '192k'],
    'wav': ['-c:a', 'pcm_s16le'],
    'm4a': ['-c:a', 'aac', '-b:a', '192k'],
    'flac': ['-c:a', 'flac'],
    'ogg': ['-c:a', 'libvorbis', '-q:a', '5'],
}
MAX_BYTES = 25 * 1024 * 1024


@router.post('/api/audio/convert')
async def convert_audio(file: UploadFile = File(...), target: str = 'mp3'):
    target = target.lower()
    extension = Path(file.filename or '').suffix.lower().lstrip('.')
    if extension not in FORMATS or target not in FORMATS:
        raise HTTPException(400, '僅支援 MP3、WAV、M4A、FLAC、OGG')

    folder = tempfile.TemporaryDirectory()
    source = Path(folder.name) / f'input.{extension}'
    output = Path(folder.name) / f'output.{target}'
    try:
        size = 0
        with source.open('wb') as stream:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_BYTES:
                    raise HTTPException(413, '音訊檔案不可超過 25 MB')
                stream.write(chunk)

        process = await asyncio.create_subprocess_exec(
            'ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error',
            '-y', '-i', str(source), '-vn', *FORMATS[target], str(output),
            stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.PIPE,
        )
        try:
            await asyncio.wait_for(process.communicate(), timeout=90)
        except asyncio.TimeoutError:
            process.kill()
            await process.communicate()
            raise HTTPException(408, '轉換逾時，請嘗試較短的音訊')
        if process.returncode != 0 or not output.exists():
            raise HTTPException(422, '音訊轉換失敗，請確認檔案格式與內容')
        media_types = {'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'm4a': 'audio/mp4',
                       'flac': 'audio/flac', 'ogg': 'audio/ogg'}
        return FileResponse(
            output, media_type=media_types[target],
            filename=f"{Path(file.filename or 'audio').stem}.{target}",
            background=BackgroundTask(folder.cleanup),
        )
    except Exception:
        folder.cleanup()
        raise
    finally:
        await file.close()
