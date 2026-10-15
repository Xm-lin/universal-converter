import { useRef, useState } from 'react';
import { ArrowRight, Download, FileAudio, Music2, X } from 'lucide-react';
import { download } from './converter';

const formats = ['mp3', 'wav', 'm4a', 'flac', 'ogg'] as const;
type Format = typeof formats[number];
type Result = { name: string; blob: Blob };

export default function AudioPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [target, setTarget] = useState<Format>('mp3');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const input = useRef<HTMLInputElement>(null);

  function addFiles(items: FileList) {
    const valid = Array.from(items).filter(f => formats.includes(f.name.split('.').pop()?.toLowerCase() as Format));
    setFiles(prev => [...prev, ...valid]);
    setResults([]);
    setMessage(valid.length !== items.length ? '已略過不支援的檔案。' : '');
  }

  async function run() {
    setBusy(true);
    setResults([]);
    setMessage('');
    const completed: Result[] = [];
    let failed = 0;
    for (const file of files) {
      try {
        const data = new FormData();
        data.append('file', file);
        const response = await fetch(`/api/audio/convert?target=${target}`, { method: 'POST', body: data });
        if (!response.ok) throw new Error('轉換失敗');
        completed.push({ name: `${file.name.replace(/\.[^.]+$/, '')}.${target}`, blob: await response.blob() });
      } catch { failed++; }
    }
    setResults(completed);
    setMessage(failed ? `${completed.length} 個成功，${failed} 個失敗。請確認格式、25 MB 限制或稍後再試。` : '轉換完成！');
    setBusy(false);
  }

  return <main>
    <div className="eyebrow"><span className="pulse"/> 免費 · 無需註冊 · 伺服器轉換</div>
    <h1>音訊格式轉換，<br/><em>快速又簡單。</em></h1>
    <p className="lead">MP3、WAV、M4A、FLAC、OGG 自由轉換。<br/>音訊會暫時上傳伺服器處理，完成後刪除暫存檔。</p>
    <section className="workspace">
      <div className="workspace-head"><span><Music2 size={17}/> AUDIO CONVERTER</span><span className="status"><span/> READY TO CONVERT</span></div>
      <input ref={input} type="file" accept=".mp3,.wav,.m4a,.flac,.ogg" multiple hidden onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}/>
      <div className="dropzone" role="button" tabIndex={0} onClick={() => input.current?.click()} onKeyDown={e => { if (e.key === 'Enter') input.current?.click(); }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
        <div className="upload-icon"><FileAudio size={30}/></div><h2>將音訊拖曳至這裡</h2><p>或點擊選擇檔案</p><span className="browse">選擇音訊 <ArrowRight size={16}/></span><small>支援 MP3、WAV、M4A、FLAC、OGG · 單檔上限 25 MB</small>
      </div>
      {files.length > 0 && <div className="file-area"><div className="section-heading"><b>已選取的檔案 <span>{files.length}</span></b><button className="text-button" onClick={() => { setFiles([]); setResults([]); setMessage(''); }}>全部清除</button></div><div className="file-list">{files.map((f, i) => <div className="file-row" key={i}><div className="mini-icon"><FileAudio size={18}/></div><div className="file-info"><strong>{f.name}</strong><small>{(f.size / 1024 / 1024).toFixed(2)} MB</small></div><button className="remove" aria-label="移除檔案" onClick={() => { setFiles(files.filter((_, j) => j !== i)); setResults([]); }}><X size={16}/></button></div>)}</div></div>}
      <div className="settings"><div><div className="settings-label">轉換為 <span>OUTPUT FORMAT</span></div><div className="formats">{formats.map(f => <button key={f} className={target === f ? 'active' : ''} onClick={() => { setTarget(f); setResults([]); }}>{f.toUpperCase()}</button>)}</div></div><button className="convert" disabled={!files.length || busy} onClick={run}>{busy ? '轉換中…' : '開始轉換'}<ArrowRight size={18}/></button></div>
      {message && <div className="message">{message}</div>}
      {results.length > 0 && <div className="results"><div className="section-heading"><b>轉換結果 <span>{results.length}</span></b></div>{results.map((r, i) => <div className="result-row" key={i}><span>{r.name}</span><button onClick={() => download(r.blob, r.name)}><Download size={16}/> 下載</button></div>)}</div>}
    </section>
  </main>;
}
