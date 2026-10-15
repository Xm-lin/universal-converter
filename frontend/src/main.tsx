import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, CheckCircle2, Download, FileImage, ImagePlus, ShieldCheck, X } from 'lucide-react';
import { convertImage, download, formats, supported, type Format } from './converter';
import PdfPage from './PdfPage';
import AudioPage from './AudioPage';
import './style.css';

function ImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [target, setTarget] = useState<Format>('png');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<{name: string; blob: Blob}[]>([]);
  const input = useRef<HTMLInputElement>(null);
  function addFiles(items: FileList | File[]) {
    const valid = Array.from(items).filter(f => supported.includes(f.type));
    setFiles(prev => [...prev, ...valid]); setResults([]);
    setMessage(valid.length !== items.length ? '部分檔案格式不支援，僅加入 JPG、PNG、WEBP。' : '');
  }
  async function run() {
    setBusy(true); setResults([]); setMessage('');
    const completed: {name: string; blob: Blob}[] = [];
    let failures = 0;
    for (const file of files) {
      try {
        const blob = await convertImage(file, target);
        const base = file.name.replace(/\.[^.]+$/, '');
        completed.push({ name: `${base}.${formats.find(f => f.id === target)!.extension}`, blob });
      } catch { failures++; }
    }
    setResults(completed); setBusy(false);
    setMessage(failures ? `${failures} 個檔案轉換失敗，請確認圖片沒有損壞。` : '轉換完成！');
  }
  return <main>
      <div className="eyebrow"><span className="pulse"/> 免費 · 無需註冊 · 本機處理</div>
      <h1>圖片格式轉換，<br/><em>就這麼簡單。</em></h1>
      <p className="lead">JPG、PNG、WEBP 自由轉換。無需上傳伺服器，<br className="desktop"/>你的圖片只會留在自己的裝置上。</p>
      <section className="workspace">
        <div className="workspace-head"><span><FileImage size={17}/> IMAGE CONVERTER</span><span className="status"><span/> READY TO CONVERT</span></div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e => {if(e.target.files) addFiles(e.target.files); e.target.value='';}}/>
        <div className="dropzone" onClick={() => input.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault();addFiles(e.dataTransfer.files);}} role="button" tabIndex={0} onKeyDown={e => {if(e.key==='Enter')input.current?.click();}}>
          <div className="upload-icon"><ImagePlus size={30} strokeWidth={1.6}/></div>
          <h2>將圖片拖曳至這裡</h2><p>或點擊選擇你要轉換的檔案</p><span className="browse">選擇圖片 <ArrowRight size={16}/></span><small>支援 JPG、PNG、WEBP · 可一次選取多張</small>
        </div>
        {files.length > 0 && <div className="file-area"><div className="section-heading"><b>已選取的檔案 <span>{files.length}</span></b><button className="text-button" onClick={() => {setFiles([]);setResults([]);setMessage('');}}>全部清除</button></div><div className="file-list">{files.map((f,i)=><div className="file-row" key={i}><div className="mini-icon"><FileImage size={18}/></div><div className="file-info"><strong>{f.name}</strong><small>{(f.size/1024/1024).toFixed(2)} MB</small></div><button aria-label="移除檔案" className="remove" onClick={()=>{setFiles(files.filter((_,j)=>j!==i));setResults([]);}}><X size={16}/></button></div>)}</div></div>}
        <div className="settings"><div><div className="settings-label">轉換為 <span>OUTPUT FORMAT</span></div><div className="formats">{formats.map(f=><button key={f.id} className={target===f.id?'active':''} onClick={()=>{setTarget(f.id);setResults([]);}}>{f.label}{target===f.id&&<CheckCircle2 size={15}/>}</button>)}</div></div><button className="convert" disabled={!files.length||busy} onClick={run}>{busy?'轉換中…':'開始轉換'}<ArrowRight size={18}/></button></div>
        {message && <div className="message">{message}</div>}
        {results.length>0 && <div className="results"><div className="section-heading"><b>轉換結果 <span>{results.length}</span></b></div>{results.map((r,i)=><div className="result-row" key={i}><span><CheckCircle2 size={17}/>{r.name}</span><button onClick={()=>download(r.blob,r.name)}><Download size={16}/> 下載</button></div>)}</div>}
      </section>
      <div className="benefits"><div><ShieldCheck size={20}/><span><strong>隱私優先</strong><small>檔案不會離開你的裝置</small></span></div><div><ArrowRight size={20}/><span><strong>快速轉換</strong><small>直接在瀏覽器完成</small></span></div><div><FileImage size={20}/><span><strong>批次處理</strong><small>一次轉換多張圖片</small></span></div></div>
    </main>;
}
function App() {
  const path = window.location.pathname;
  return <div className={`site ${path === "/img" ? "theme-image" : path === "/audio" ? "theme-audio" : ""}`}>
    <header className="site-header">
      <a className="brand" href="/">UNIVERSAL<span>CONVERTER</span></a>
      <nav aria-label="主要導覽"><a className={path === '/' ? 'current' : ''} href="/">首頁</a><a className={path === '/img' ? 'current' : ''} href="/img">圖片轉換</a><a className={path === '/pdf' ? 'current' : ''} href="/pdf">PDF 工具</a><a className={path === '/audio' ? 'current' : ''} href="/audio">音訊轉換</a></nav>
    </header>
    {path === '/pdf' ? <PdfPage/> : path === '/audio' ? <AudioPage/> : path === '/' ? <main className="landing">
      <div className="hero-label">UNIVERSAL CONVERTER — ONLINE FILE TOOLS</div>
      <h1>轉換檔案。<br/>不必<span className="accent">複雜。</span></h1>
      <p className="lead">圖片轉換、PDF 處理、音訊轉換，一個地方就夠。<br/>無需註冊，圖片與 PDF 在瀏覽器處理，音訊由伺服器轉換。</p>
      <div className="home-tools"><div className="home-tools-title">SELECT A TOOL <span>01 — 03</span></div><div className="tool-grid"><a className="tool tool-image" href="/img"><span className="tool-number">01 / IMAGE</span><strong>圖片轉換 <ArrowRight size={24}/></strong><small>JPG / PNG / WEBP</small></a><a className="tool tool-pdf" href="/pdf"><span className="tool-number">02 / DOCUMENT</span><strong>PDF 工具 <ArrowRight size={24}/></strong><small>合併 / 擷取 / 旋轉 / 圖片互轉</small></a><a className="tool tool-audio" href="/audio"><span className="tool-number">03 / AUDIO</span><strong>音訊轉換 <ArrowRight size={24}/></strong><small>MP3 / WAV / M4A / FLAC / OGG</small></a></div></div>
    </main> : path === '/img' ? <ImagePage/> : <main><h1>找不到頁面。</h1><p className="lead"><a href="/">返回首頁 →</a></p></main>}
    <footer><span>© 2026 UNIVERSAL CONVERTER</span><span>NO ACCOUNT. JUST CONVERT.</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
