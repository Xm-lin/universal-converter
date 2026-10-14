export type Format = 'jpeg' | 'png' | 'webp';
export const formats: { id: Format; label: string; mime: string; extension: string }[] = [
  { id: 'jpeg', label: 'JPG', mime: 'image/jpeg', extension: 'jpg' },
  { id: 'png', label: 'PNG', mime: 'image/png', extension: 'png' },
  { id: 'webp', label: 'WEBP', mime: 'image/webp', extension: 'webp' },
];
export const supported = ['image/jpeg', 'image/png', 'image/webp'];
export async function convertImage(file: File, target: Format): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('瀏覽器無法建立圖片畫布');
    if (target === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(bitmap, 0, 0);
    const mime = formats.find(f => f.id === target)!.mime;
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('轉換失敗')), mime, 0.92));
    if (blob.type !== mime) throw new Error('此瀏覽器不支援輸出該格式');
    return blob;
  } finally { bitmap.close(); }
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
