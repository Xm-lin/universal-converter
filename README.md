# Universal Converter

圖片格式轉換網站。第一版支援 JPG、PNG、WEBP 互轉、批次轉換與下載，所有圖片都在瀏覽器本機處理，不會傳到後端。

## 結構
- `frontend/src/main.tsx`：網站介面與互動
- `frontend/src/converter.ts`：格式清單、圖片轉換及下載
- `frontend/src/style.css`：網站樣式
- `backend/main.py`：FastAPI 健康檢查與靜態網站服務
- `Dockerfile`：Render 單一 Web Service 部署

## 本機啟動
```bash
cd frontend
npm install
npm run dev
```

## Render 部署
建立 **Web Service**，連接 GitHub Repository，Runtime 選 **Docker**，Dockerfile 路徑設為 `./Dockerfile`。不需要 Supabase。健康檢查路徑可設為 `/api/health`。

## 注意
- 透明圖片轉 JPG 時使用白色背景。
- 動畫 WEBP 轉換只保留靜態畫面。
- 大圖及大量批次檔案會占用使用者裝置記憶體。
- 轉換後輸出格式若與原始格式相同，仍會重新編碼。


## 介面
深色極簡排版、橘紅色重點色，首頁 `/`、圖片 `/img`、PDF `/pdf`。
