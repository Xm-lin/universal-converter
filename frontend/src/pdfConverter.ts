import { PDFDocument, degrees } from 'pdf-lib';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;
const bytes = async (file: File) => new Uint8Array(await file.arrayBuffer());
const pdfFile = async (doc: PDFDocument) => new Blob([new Uint8Array(await doc.save())], { type: 'application/pdf' });

export async function mergePdfs(files: File[]) {
  const output = await PDFDocument.create();
  for (const file of files) {
    const source = await PDFDocument.load(await bytes(file));
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach(page => output.addPage(page));
  }
  return pdfFile(output);
}

export async function extractPages(file: File, range: string) {
  const source = await PDFDocument.load(await bytes(file));
  const indexes = parsePages(range, source.getPageCount());
  const output = await PDFDocument.create();
  (await output.copyPages(source, indexes)).forEach(page => output.addPage(page));
  return pdfFile(output);
}

export async function rotatePages(file: File, angle: number) {
  const doc = await PDFDocument.load(await bytes(file));
  doc.getPages().forEach(page => page.setRotation(degrees((page.getRotation().angle + angle) % 360)));
  return pdfFile(doc);
}

export async function imagesToPdf(files: File[]) {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const image = file.type === 'image/png' ? await doc.embedPng(await bytes(file)) : await doc.embedJpg(await bytes(file));
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return pdfFile(doc);
}

export async function pdfToImages(file: File, format: 'png' | 'jpeg') {
  const pdf = await getDocument({ data: await bytes(file) }).promise;
  const results: { name: string; blob: Blob }[] = [];
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('無法建立圖片畫布');
      if (format === 'jpeg') {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      await page.render({ canvasContext: context, viewport }).promise;
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('圖片輸出失敗')), `image/${format}`, 0.92));
      results.push({ name: `${file.name.replace(/\.pdf$/i, '')}-page-${i}.${format === 'jpeg' ? 'jpg' : 'png'}`, blob });
      page.cleanup();
    }
  } finally { await pdf.destroy(); }
  return results;
}

function parsePages(value: string, total: number) {
  const pages: number[] = [];
  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('頁碼格式錯誤，例如 1-3,5');
    const start = Number(match[1]), end = Number(match[2] ?? match[1]);
    if (start < 1 || end > total || start > end) throw new Error(`頁碼必須介於 1 至 ${total}`);
    for (let page = start; page <= end; page++) pages.push(page - 1);
  }
  return pages;
}
