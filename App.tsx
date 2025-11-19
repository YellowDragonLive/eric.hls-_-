import React, { useState, useRef, useEffect } from 'react';
import { Upload, FolderOpen, Image as ImageIcon, RotateCcw, Check, Trash2, Settings } from 'lucide-react';
import { ImageFile, AppState, SwipeAction } from './types';
import { SwipeCard } from './components/SwipeCard';
import { ResultsGallery } from './components/ResultsGallery';

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [queue, setQueue] = useState<ImageFile[]>([]);
  const [kept, setKept] = useState<ImageFile[]>([]);
  const [discarded, setDiscarded] = useState<ImageFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Input ref for folder selection
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const imageFiles: ImageFile[] = [];
    // Explicitly cast Array.from result to File[] to resolve type inference issues (unknown type)
    (Array.from(files) as File[]).forEach((file) => {
      if (file.type.startsWith('image/')) {
        imageFiles.push({
          file,
          id: Math.random().toString(36).substring(7),
          previewUrl: URL.createObjectURL(file),
        });
      }
    });

    if (imageFiles.length > 0) {
      setQueue(imageFiles);
      setCurrentIndex(0);
      setKept([]);
      setDiscarded([]);
      setAppState('sorting');
    } else {
      alert('在此文件夹中未发现图片。');
    }
  };

  const handleSwipe = (action: SwipeAction) => {
    const currentImage = queue[currentIndex];
    
    if (action === 'left') {
      // User Request: Left Slide Save
      setKept((prev) => [...prev, currentImage]);
    } else {
      // User Request: Right Slide Delete
      setDiscarded((prev) => [...prev, currentImage]);
    }

    // Move to next
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setAppState('results');
    }
  };

  const resetApp = () => {
    // Cleanup object URLs to avoid memory leaks
    queue.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setQueue([]);
    setKept([]);
    setDiscarded([]);
    setCurrentIndex(0);
    setAppState('upload');
  };

  // Handle "webkitdirectory" attribute for directory upload
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, [appState]);

  const progress = queue.length > 0 ? Math.round(((currentIndex) / queue.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-2xl mx-auto bg-stone-100 text-stone-900 font-serif">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-6 py-4 border-b border-stone-300/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center shadow-md shadow-stone-500/30">
            <span className="text-stone-50 text-2xl font-bold" style={{ fontFamily: 'serif' }}>墨</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-widest">
            墨韵图集
          </h1>
        </div>
        <div className="flex gap-3">
          {!process.env.API_KEY && (
             <button 
             onClick={() => setShowApiKeyModal(!showApiKeyModal)}
             className="p-2 text-stone-500 hover:text-stone-900 transition-colors"
             title="设置 API Key"
           >
             <Settings size={20} />
           </button>
          )}
          {appState !== 'upload' && (
            <button 
              onClick={resetApp}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-sm font-medium transition-all"
            >
              <RotateCcw size={16} />
              重置
            </button>
          )}
        </div>
      </header>

      {/* API Key Modal (if env key not present) */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-50 border border-stone-300 p-6 rounded-xl max-w-md w-full shadow-2xl shadow-stone-900/20">
            <h3 className="text-lg font-bold mb-4 text-stone-900">设置 Gemini API Key</h3>
            <p className="text-stone-600 text-sm mb-4">
               为了开启 AI 智能赏析功能，请输入您的 API Key。
               <br/>如果不输入，仅能使用基本的整理功能。
            </p>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full bg-white border border-stone-300 rounded-lg px-4 py-3 text-stone-900 mb-4 focus:ring-2 focus:ring-stone-500 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowApiKeyModal(false)} className="px-4 py-2 text-stone-500 hover:text-stone-800">关闭</button>
              <button onClick={() => setShowApiKeyModal(false)} className="px-4 py-2 bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-lg shadow-md">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full flex-1 flex flex-col relative">
        
        {appState === 'upload' && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-3xl bg-white/60 p-12 text-center hover:border-stone-500 hover:bg-white/80 transition-all duration-500 group shadow-inner">
            <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 shadow-xl shadow-stone-500/10">
              <FolderOpen className="w-10 h-10 text-stone-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-stone-800">选择图集</h2>
            <p className="text-stone-500 mb-8 max-w-xs">
              上传文件夹，体验水墨般流畅的整理过程。
            </p>
            
            <label className="relative cursor-pointer">
              <div className="flex items-center gap-3 px-10 py-4 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg font-semibold shadow-lg shadow-stone-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                <Upload className="w-5 h-5" />
                <span>上传文件夹</span>
              </div>
              <input
                ref={folderInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFolderSelect}
                accept="image/*"
              />
            </label>
          </div>
        )}

        {appState === 'sorting' && queue.length > 0 && (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-stone-200 rounded-full mb-8 overflow-hidden border border-stone-300/50">
              <div 
                className="h-full bg-stone-800 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-sm text-stone-500 font-medium mb-4 tracking-widest">
              第 {currentIndex + 1} 张 / 共 {queue.length} 张
            </div>

            {/* Card Stack */}
            <div className="relative w-full aspect-[3/4] max-h-[60vh] md:max-h-[500px]">
               {/* Render next card in background for performance/visual continuity */}
               {currentIndex < queue.length - 1 && (
                 <div className="absolute inset-0 transform scale-95 translate-y-4 opacity-50 pointer-events-none z-0">
                    <SwipeCard 
                      image={queue[currentIndex + 1]} 
                      active={false}
                      onSwipe={() => {}}
                    />
                 </div>
               )}
               
               {/* Active Card */}
               <div className="absolute inset-0 z-10">
                 <SwipeCard 
                    key={queue[currentIndex].id}
                    image={queue[currentIndex]}
                    active={true}
                    onSwipe={handleSwipe}
                    apiKey={apiKey || process.env.API_KEY}
                 />
               </div>
            </div>

            {/* Controls Legend */}
            <div className="flex items-center justify-between w-full mt-10 px-4 max-w-md mx-auto">
               <div className="flex items-center gap-3 text-emerald-800">
                  <div className="w-10 h-10 rounded-full border border-emerald-700/20 bg-emerald-50 flex items-center justify-center shadow-sm">
                    <Check size={18} className="text-emerald-700" />
                  </div>
                  <span className="text-sm font-bold tracking-wider hidden sm:inline">左滑 · 珍藏</span>
               </div>
               
               <div className="flex items-center gap-3 text-red-900">
                  <span className="text-sm font-bold tracking-wider hidden sm:inline">右滑 · 舍弃</span>
                  <div className="w-10 h-10 rounded-full border border-red-800/20 bg-red-50 flex items-center justify-center shadow-sm">
                    <Trash2 size={18} className="text-red-800" />
                  </div>
               </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <p className="text-xs text-stone-400 mt-8 opacity-60">
               亦可使用左右方向键操作
            </p>
          </div>
        )}

        {appState === 'results' && (
          <ResultsGallery 
            kept={kept} 
            discarded={discarded} 
            onRestart={resetApp}
          />
        )}

      </main>
    </div>
  );
}