import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Image as ImageIcon, Copy, Check, Loader2, X, RefreshCw, Wifi, AlertCircle, ChevronRight, Keyboard, Shield, Globe } from 'lucide-react';
import { ApiConfig, recognizeLatex, verifyConnection } from './lib/api';
import 'katex/dist/katex.min.css';
import { LatexRenderer } from './components/LatexRenderer';
import { cn } from './lib/utils';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SYMBOL_CATEGORIES } from './lib/symbols';

// Default Configuration
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
  useProxy: false,
  accessSecret: '',
};

function App() {
  const [config, setConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('latex-ai-config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [latex, setLatex] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Layout State
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const topContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('latex-ai-config', JSON.stringify(config));
    setVerifyStatus('idle');
  }, [config]);

  // Dragging Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !topContainerRef.current) return;
      const rect = topContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSplitPos(Math.max(20, Math.min(80, percentage))); // Clamp between 20% and 80%
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging]);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyStatus('idle');
    try {
      await verifyConnection(config);
      setVerifyStatus('success');
    } catch (err) {
      setVerifyStatus('error');
    } finally {
      setVerifying(false);
    }
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
              handleImageInput(event.target.result);
            }
          };
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  }, [config]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste as any);
    return () => document.removeEventListener('paste', handlePaste as any);
  }, [handlePaste]);

  const handleImageInput = async (imageData: string) => {
    setImage(imageData);
    setLatex('');
    setError(null);
    setLoading(true);

    try {
      const result = await recognizeLatex(imageData, config);
      setLatex(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === 'string') {
            handleImageInput(event.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertSymbol = (code: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = latex;
    
    const newText = text.substring(0, start) + code + text.substring(end);
    setLatex(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + code.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div 
      className="h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={handleDrop}
    >
      {/* Header */}
      <header className="flex-none flex justify-between items-center p-4 pt-10 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 drag-region z-20">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <img src="/logo.svg" className="w-8 h-8 rounded-md" alt="DTexer Logo" />
          DTexer
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors no-drag"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Settings Overlay */}
        {showSettings && (
          <div className="absolute top-0 right-0 m-4 w-96 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-xl animate-in fade-in slide-in-from-top-4 z-50">
             <div className="flex justify-between mb-4">
                <h2 className="font-semibold">API Configuration</h2>
                <button onClick={() => setShowSettings(false)}><X size={16}/></button>
             </div>
             
             <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex p-1 bg-neutral-100 dark:bg-neutral-900 rounded-md">
                   <button 
                      onClick={() => setConfig({...config, useProxy: false})}
                      className={cn(
                         "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-sm transition-all",
                         !config.useProxy ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      )}
                   >
                      <Globe size={14} /> Custom API
                   </button>
                   <button 
                      onClick={() => setConfig({...config, useProxy: true})}
                      className={cn(
                         "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-sm transition-all",
                         config.useProxy ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      )}
                   >
                      <Shield size={14} /> Hosted
                   </button>
                </div>

                {config.useProxy ? (
                   <div>
                      <label className="block text-sm text-neutral-500 mb-1">Access Key</label>
                      <input 
                         type="password"
                         className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
                         value={config.accessSecret || ''}
                         onChange={(e) => setConfig({...config, accessSecret: e.target.value})}
                         placeholder="Enter provided access key..."
                      />
                      <p className="text-xs text-neutral-400 mt-1">Use the built-in AI service with your access key.</p>
                   </div>
                ) : (
                   <div className="space-y-3">
                      <div>
                         <label className="block text-sm text-neutral-500 mb-1">Base URL</label>
                         <input 
                            className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
                            value={config.baseUrl}
                            onChange={(e) => setConfig({...config, baseUrl: e.target.value})}
                         />
                      </div>
                      <div>
                         <label className="block text-sm text-neutral-500 mb-1">API Key</label>
                         <input 
                            type="password"
                            className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
                            value={config.apiKey}
                            onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                            placeholder="sk-..."
                         />
                      </div>
                      <div>
                         <label className="block text-sm text-neutral-500 mb-1">Model Name</label>
                         <input 
                            className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
                            value={config.model}
                            onChange={(e) => setConfig({...config, model: e.target.value})}
                         />
                      </div>
                   </div>
                )}
                
                <div className="pt-2 flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800">
                   <button 
                      onClick={handleVerify}
                      disabled={verifying}
                      className="flex items-center gap-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                   >
                      {verifying ? <Loader2 className="animate-spin" size={14} /> : <Wifi size={14} />}
                      Verify Connection
                   </button>
                   {verifyStatus === 'success' && (
                      <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                         <Check size={14} /> Connected
                      </span>
                   )}
                   {verifyStatus === 'error' && (
                      <span className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                         <AlertCircle size={14} /> Failed
                      </span>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Left Sidebar: Symbols */}
        <aside className="w-64 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 font-medium text-sm text-neutral-500 flex items-center gap-2">
            <Keyboard size={16} /> Symbols
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {SYMBOL_CATEGORIES.map((category) => (
              <div key={category.name}>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{category.name}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {category.symbols.map((sym) => (
                    <button
                      key={sym.label}
                      onClick={() => insertSymbol(sym.code)}
                      className="aspect-square flex items-center justify-center text-sm bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-800 transition-colors"
                      title={sym.code}
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-neutral-100/50 dark:bg-black/20">
          
          {/* Top Half: Input & Preview (Resizable) */}
          <div 
             ref={topContainerRef}
             className="h-[55%] flex border-b border-neutral-200 dark:border-neutral-800 min-h-0 relative group"
          >
            
            {/* Image Input */}
            <div 
              style={{ width: `${splitPos}%` }}
              className="bg-white dark:bg-neutral-950 relative min-w-0 flex flex-col"
            >
               {image ? (
                 <div className="w-full h-full p-4 flex items-center justify-center bg-neutral-50/50 dark:bg-neutral-900/50">
                   <img src={image} alt="Source" className="max-w-full max-h-full object-contain shadow-sm rounded" />
                   <div className="absolute top-2 right-2 flex gap-2">
                      <button 
                        onClick={() => handleImageInput(image)}
                        disabled={loading}
                        className="p-1.5 bg-white/90 dark:bg-black/50 text-neutral-700 dark:text-neutral-300 rounded hover:bg-white dark:hover:bg-black border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all"
                        title="Re-recognize"
                      >
                         <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                      </button>
                      <button 
                        onClick={() => { setImage(null); setLatex(''); setError(null); }}
                        className="p-1.5 bg-white/90 dark:bg-black/50 text-neutral-700 dark:text-neutral-300 rounded hover:bg-white dark:hover:bg-black border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all"
                      >
                        <X size={14} />
                      </button>
                   </div>
                 </div>
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-4 p-8">
                    <div className="p-4 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                       <ImageIcon size={32} className="opacity-50" />
                    </div>
                    <p className="text-center text-sm">
                       Paste image (Cmd+V)<br/>or Drag & Drop
                    </p>
                 </div>
               )}
               
               {loading && (
                 <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <span className="text-sm font-medium">Processing...</span>
                 </div>
               )}
            </div>

            {/* Resizer Handle */}
            <div 
               className={cn(
                  "w-1 bg-neutral-200 dark:bg-neutral-800 cursor-col-resize hover:bg-blue-500 active:bg-blue-500 transition-colors z-20 flex-none",
                  isDragging && "bg-blue-500"
               )}
               onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
            />

            {/* Preview */}
            <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 flex flex-col min-w-0">
               <div className="flex-none p-2 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-950">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-2">Preview</span>
               </div>
               <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
                  {latex ? (
                     <div className="text-2xl w-full flex justify-center">
                        <ErrorBoundary>
                          <LatexRenderer block>{latex}</LatexRenderer>
                        </ErrorBoundary>
                     </div>
                  ) : (
                     <span className="text-neutral-400 text-sm">Preview area</span>
                  )}
               </div>
            </div>
          </div>

          {/* Bottom Half: Editor */}
          <div className="flex-1 flex flex-col bg-white dark:bg-neutral-950 min-h-0 border-t border-neutral-200 dark:border-neutral-800">
             <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex-none">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">LaTeX Source</span>
                <div className="flex gap-2">
                   {latex && (
                     <button 
                       onClick={copyToClipboard}
                       className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                     >
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        {copied ? "Copied" : "Copy Code"}
                     </button>
                   )}
                </div>
             </div>
             
             <div className="flex-1 relative">
                <textarea 
                  ref={textareaRef}
                  className="w-full h-full p-4 resize-none focus:outline-none bg-transparent text-neutral-700 dark:text-neutral-300 font-mono text-sm leading-relaxed"
                  value={latex}
                  onChange={(e) => setLatex(e.target.value)}
                  placeholder="LaTeX code..."
                  spellCheck={false}
                />
                
                {error && (
                   <div className="absolute inset-x-0 bottom-0 bg-red-50 dark:bg-red-900/20 p-2 text-red-600 dark:text-red-400 text-xs border-t border-red-100 dark:border-red-900/50">
                      Error: {error}
                   </div>
                )}
             </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;