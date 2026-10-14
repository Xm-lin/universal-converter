import { useRef, useState } from 'react';
import { ArrowRight, Download, FileText, UploadCloud, X } from 'lucide-react';
import { download } from './converter';
import { extractPages, imagesToPdf, mergePdfs, pdfToImages, rotatePages } from './pdfConverter';

type Tool = 'merge' | 'extract' | 'rotate' | 'images' | 'render';
const tools: { id: Tool; label: string; detail: string }[] = [
  { id: 'merge', label: '合併 PDF', detail: '依上傳順序合併' },
  { id: 'extract', label: '擷取頁面', detail: '輸入 1-3,5 等頁碼' },
  { id: 'rotate', label: '旋轉 PDF', detail: '旋轉所有頁面' },
  { id: 'images', label: '圖片轉 PDF', detail: 'JPG、PNG 合成 PDF' },
  { id: 'render', label: 'PDF 轉圖片', detail: '每頁輸出 JPG 或 PNG' },
];

export default function PdfPage() {
  const [tool, setTool] = useState<Tool>('merge');
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState('1');
  const [angle, setAngle] = useState(90);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<{ name: string; blob: Blob }[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const multiple = tool === 'merge' || tool === 'images';
  const accept = tool === 'images' ? 'image/jpeg,image/png' : 'application/pdf,.pdf';
  function selectTool(next: Tool) { setTool(next); setFiles([]); setResults([]); setMessage(''); }
  function addFiles(list: FileList) {
    const selected = Array.from(list).filter(f => tool === 'images' ? ['image/jpeg', 'image/png'].includes(f.type) : f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    setFiles(multiple ? prev => [...prev, ...selected] : selected.slice(0, 1));
    setResults([]);
    setMessage(selected.length !== list.length ? '已略過不支援的檔案。' : '');
  }
  async function run() {
    if (!files.length) return;
    setBusy(true); setResults([]); setMessage('');
    try {
      const base = files[0].name.replace(/\.[^.]+$/, '');
      if (tool === 'render') setResults(await pdfToImages(files[0], format));
      else {
        const blob = tool === 'merge' ? await mergePdfs(files)
          : tool === 'extract' ? await extractPages(files[0], range)
          : tool === 'rotate' ? await rotatePages(files[0], angle)
          : await imagesToPdf(files);
        setResults([{ name: tool === 'merge' ? 'merged.pdf' : tool === 'images' ? 'images.pdf' : `${base}-${tool}.pdf`, blob }]);
      }
      setMessage('轉換完成！');
    } catch (error) { setMessage(error instanceof Error ? error.message : '轉換失敗，請確認檔案是否正常或有密碼保護。'); }
    finally { setBusy(false); }
  }
  return <main>
    <div className="eyebrow"><span className="pulse"/> 免費 · 無需註冊 · 本機處理</div>
    <h1>PDF 工具，<br/><em>簡單又快速。</em></h1>
    <p className="lead">合併、擷取、旋轉與圖片轉換。<br/>檔案只在你的瀏覽器中處理。</p>
    <div className="tool-grid">{tools.map(t => <button key={t.id} className={tool === t.id ? 'tool active' : 'tool'} onClick={() => selectTool(t.id)}><strong>{t.label}</strong><small>{t.detail}</small></button>)}</div>
    <section className="workspace">
      <div className="workspace-head"><span><FileText size={17}/> {tools.find(t => t.id === tool)?.label}</span><span className="status"><span/> PDF TOOLS</span></div>
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}/>
      <div className="dropzone" role="button" tabIndex={0} onClick={() => input.current?.click()} onKeyDown={e => { if (e.key === 'Enter') input.current?.click(); }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
        <div className="upload-icon"><UploadCloud size={30}/></div><h2>拖曳檔案至這裡</h2><p>或點擊選擇檔案</p><span className="browse">選擇檔案 <ArrowRight size={16}/></span><small>{tool === 'images' ? '支援 JPG、PNG' : '支援 PDF'} · {multiple ? '可選取多個檔案' : '選取單一檔案'}</small>
      </div>
      {files.length > 0 && <div className="file-area"><div className="section-heading"><b>已選取的檔案 <span>{files.length}</span></b><button className="text-button" onClick={() => { setFiles([]); setResults([]); }}>全部清除</button></div><div className="file-list">{files.map((f, i) => <div className="file-row" key={i}><FileText size={18}/><div className="file-info"><strong>{f.name}</strong><small>{(f.size / 1024 / 1024).toFixed(2)} MB</small></div><button className="remove" aria-label="移除檔案" onClick={() => { setFiles(files.filter((_, j) => j !== i)); setResults([]); }}><X size={16}/></button></div>)}</div></div>}
      <div className="settings"><div><div className="settings-label">轉換設定</div>{tool === 'extract' ? <input className="field" value={range} onChange={e => setRange(e.target.value)} placeholder="例如 1-3,5"/> : tool === 'rotate' ? <select className="field" value={angle} onChange={e => setAngle(Number(e.target.value))}><option value={90}>順時針 90°</option><option value={180}>旋轉 180°</option><option value={270}>順時針 270°</option></select> : tool === 'render' ? <select className="field" value={format} onChange={e => setFormat(e.target.value as 'png' | 'jpeg')}><option value="png">PNG</option><option value="jpeg">JPG</option></select> : <span className="muted">{tools.find(t => t.id === tool)?.detail}</span>}</div><button className="convert" disabled={!files.length || busy} onClick={run}>{busy ? '處理中…' : '開始轉換'} <ArrowRight size={18}/></button></div>
      {message && <div className="message">{message}</div>}
      {results.length > 0 && <div className="results"><div className="section-heading"><b>轉換結果 <span>{results.length}</span></b></div>{results.map((r, i) => <div className="result-row" key={i}><span>{r.name}</span><button onClick={() => download(r.blob, r.name)}><Download size={16}/> 下載</button></div>)}</div>}
    </section>
  </main>;
}
