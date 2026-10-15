# Universal Converter

免費的多功能檔案轉換網站，無需註冊，深色介面。

## 功能

- **圖片**：JPG、PNG、WEBP 互轉，支援批次轉換，在瀏覽器本機處理。
- **PDF**：合併、擷取頁面、旋轉、圖片轉 PDF、PDF 轉 JPG/PNG，在瀏覽器本機處理。
- **音訊**：MP3、WAV、M4A、FLAC、OGG 互轉，支援多檔依序轉換、逐檔下載。由 FastAPI + FFmpeg 處理，單檔上限 25 MB，轉換逾時 90 秒。

**隱私**：圖片和 PDF 不上傳伺服器；音訊會上傳後端處理，成功傳送結果後清除暫存檔。異常中斷時不保證立即清除。

## 技術

React、TypeScript、Vite、pdf-lib、pdfjs-dist、FastAPI、FFmpeg、Docker。

## 本機啟動

先安裝 Docker Desktop，在專案根目錄執行：

```bash
docker compose up --build
```

開啟 http://localhost:8000 ，停止執行 `docker compose down`。

## Render 部署

建立 Docker Web Service，Dockerfile 路徑 `./Dockerfile`，健康檢查 `/api/health`。不需要 Supabase。免費服務可能休眠，音訊轉換受到 CPU、記憶體與請求時間限制。

## 主要檔案

- `frontend/src/main.tsx`：首頁、圖片工具與導覽
- `frontend/src/PdfPage.tsx`、`pdfConverter.ts`：PDF 工具
- `frontend/src/AudioPage.tsx`：音訊工具
- `backend/audio.py`：音訊轉換 API
- `backend/main.py`：FastAPI 與前端檔案服務
- `Dockerfile`、`docker-compose.yaml`：部署設定

## 注意

- 透明圖片轉 JPG 時使用白色背景；動畫 WEBP 只保留靜態畫面。
- 音訊重新編碼可能降低品質，無法還原有損壓縮已流失的音質。
- 音訊目前逐檔下載，不提供 ZIP 打包。
