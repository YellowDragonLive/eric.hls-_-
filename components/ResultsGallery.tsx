import React, { useState } from 'react';
import { ImageFile } from '../types';
import { Download, Trash2, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface ResultsGalleryProps {
  kept: ImageFile[];
  discarded: ImageFile[];
  onRestart: () => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ kept, discarded, onRestart }) => {
  const [activeTab, setActiveTab] = useState<'kept' | 'discarded'>('kept');

  const handleDownloadList = () => {
    const list = activeTab === 'kept' ? kept : discarded;
    const text = list.map(f => f.file.name).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab === 'kept' ? '珍藏清单' : '舍弃清单'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentList = activeTab === 'kept' ? kept : discarded;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xl shadow-stone-300/50">
      {/* Tabs */}
      <div className="flex border-b border-stone-100">
        <button
          onClick={() => setActiveTab('kept')}
          className={`flex-1 py-5 text-sm font-serif font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'kept' 
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-800' 
              : 'bg-stone-50 text-stone-400 hover:text-stone-600'
          }`}
        >
          <CheckCircle size={18} className={activeTab === 'kept' ? 'text-emerald-700' : 'text-stone-400'} />
          珍藏 ({kept.length})
        </button>
        <button
          onClick={() => setActiveTab('discarded')}
          className={`flex-1 py-5 text-sm font-serif font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'discarded' 
              ? 'bg-white text-red-900 border-b-2 border-red-900' 
              : 'bg-stone-50 text-stone-400 hover:text-stone-600'
          }`}
        >
          <Trash2 size={18} className={activeTab === 'discarded' ? 'text-red-800' : 'text-stone-400'} />
          舍弃 ({discarded.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-stone-50">
        {currentList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400">
                <ImageIcon size={48} className="mb-4 opacity-30" />
                <p className="font-serif tracking-wider">暂无图片</p>
            </div>
        ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {currentList.map((img) => (
                <div key={img.id} className="aspect-square rounded-md overflow-hidden bg-stone-200 relative group shadow-sm border border-stone-200 hover:border-stone-400 transition-all">
                    <img 
                        src={img.previewUrl} 
                        alt={img.file.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter sepia-[.15] group-hover:sepia-0"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors" />
                </div>
            ))}
            </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-5 bg-white border-t border-stone-100 flex justify-between items-center">
        <div className="text-xs text-stone-500 font-serif">
            {activeTab === 'kept' 
                ? "提示：左滑保留的图片" 
                : "提示：右滑舍弃的图片"}
        </div>
        <button 
            onClick={handleDownloadList}
            disabled={currentList.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-stone-50 rounded-lg text-sm font-bold tracking-wide transition-colors shadow-lg shadow-stone-900/20"
        >
            <Download size={16} />
            下载清单
        </button>
      </div>
    </div>
  );
};