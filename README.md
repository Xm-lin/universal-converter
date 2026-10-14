# Universal Converter

一個免費、簡潔的線上檔案轉換工具，支援圖片格式轉換及 PDF 處理。

使用 **React + TypeScript + FastAPI** 開發，優先在瀏覽器中完成轉換，不需上傳檔案至伺服器。

## 功能介紹

### 圖片轉換 `/img`

支援 JPG、JPEG、PNG、WEBP 格式轉換。

- JPG → PNG、WEBP
- PNG → JPG、WEBP
- WEBP → JPG、PNG
- 支援多檔案批次轉換
- 自動辨識圖片格式
- 轉換完成後直接下載

### PDF 工具 `/pdf`

提供常見 PDF 處理功能：

| 功能 | 說明 |
|---|---|
| PDF 合併 | 將多份 PDF 合併成一份 |
| PDF 分割 | 依指定頁面分割或擷取 PDF |
| PDF 旋轉 | 旋轉 PDF 頁面 |
| 圖片轉 PDF | 將 JPG、PNG 轉換成 PDF |
| PDF 轉圖片 | 將 PDF 頁面轉換成 JPG、PNG |

## 技術架構

| 類別 | 技術 |
|---|---|
| 前端 | React、TypeScript、Vite |
| 後端 | Python、FastAPI |
| 圖片轉換 | Canvas API |
| PDF 處理 | pdf-lib、PDF.js |
| 部署 | Docker、Render |

圖片與 PDF 轉換主要在使用者瀏覽器中完成，減少伺服器負擔。

## 專案結構

```text
Universal-Converter/
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── PdfPage.tsx
│   │   ├── converter.ts
│   │   ├── pdfConverter.ts
│   │   ├── style.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── Dockerfile
├── .gitignore
└── README.md
```

## 本機執行

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 後端

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

## Render 部署

1. 將專案上傳至 GitHub。
2. 在 Render 建立 Web Service。
3. 連接 GitHub Repository。
4. Runtime 選擇 `Docker`。
5. Dockerfile Path 設為 `./Dockerfile`。
6. 部署完成後即可使用。

前端由 Vite 建置，FastAPI 負責提供網站服務。

## 未來規劃

- PDF 與 Word 文件互轉
- 更多圖片格式（HEIC、AVIF、SVG、TIFF）
- 音訊格式轉換
- 影片格式轉換
- 壓縮檔處理
- 更多文件格式支援

## 隱私與安全

目前的圖片與 PDF 轉換功能在瀏覽器本地執行，檔案不會因轉換操作而上傳至伺服器。

## License

尚未指定授權條款。
