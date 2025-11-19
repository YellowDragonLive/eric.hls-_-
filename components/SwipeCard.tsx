import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { Sparkles, Info, Loader2 } from 'lucide-react';
import { SwipeCardProps } from '../types';
import { GeminiService, blobToBase64 } from '../services/gemini';

export const SwipeCard: React.FC<SwipeCardProps> = ({ image, active, onSwipe, apiKey }) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Rotates based on X position
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Opacity overlays for visual feedback
  // Left Swipe = Save (Jade/Green) -> Negative X
  const saveOpacity = useTransform(x, [-150, -20], [1, 0]);
  // Right Swipe = Delete (Cinnabar/Red) -> Positive X
  const deleteOpacity = useTransform(x, [20, 150], [0, 1]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x < -threshold) {
      // Swiped Left -> Save
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } });
      onSwipe('left');
    } else if (info.offset.x > threshold) {
      // Swiped Right -> Delete
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } });
      onSwipe('right');
    } else {
      // Return to center
      controls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!active) return;
    if (e.key === 'ArrowLeft') {
        controls.start({ x: -500, opacity: 0 }).then(() => onSwipe('left'));
    } else if (e.key === 'ArrowRight') {
        controls.start({ x: 500, opacity: 0 }).then(() => onSwipe('right'));
    }
  };

  useEffect(() => {
    if (active) {
        window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  const analyzeImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!apiKey) {
      alert("请先在设置中配置 API Key 以使用 AI 功能。");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const gemini = new GeminiService(apiKey);
      const base64 = await blobToBase64(image.file);
      const text = await gemini.analyzeImage(base64, image.file.type);
      setAnalysis(text);
    } catch (err) {
      setAnalysis("分析失败");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ x, rotate, touchAction: 'none' }}
      className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing bg-white border-[6px] border-white overflow-hidden select-none"
      whileTap={{ scale: 1.01 }}
    >
      {/* Image */}
      <img 
        src={image.previewUrl} 
        alt="Swipe candidate" 
        className="w-full h-full object-cover pointer-events-none bg-stone-200"
        draggable={false}
      />
      
      {/* Subtle texture overlay to mimic paper grain over image - optional aesthetic touch */}
      <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

      {/* Gradient Overlay at bottom for text readability - dark ink style */}
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-stone-900/95 via-stone-900/60 to-transparent pointer-events-none" />

      {/* Overlays for Swipe Feedback - Stamp Style */}
      <motion.div 
        style={{ opacity: saveOpacity }}
        className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center pointer-events-none z-20"
      >
        <div className="border-4 border-emerald-800 bg-emerald-100/80 backdrop-blur-sm rounded-lg px-8 py-4 transform -rotate-12 shadow-lg">
            <span className="text-5xl font-bold text-emerald-900 tracking-widest" style={{ fontFamily: 'serif' }}>留</span>
        </div>
      </motion.div>
      
      <motion.div 
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 bg-red-900/10 flex items-center justify-center pointer-events-none z-20"
      >
         <div className="border-4 border-red-900 bg-red-100/80 backdrop-blur-sm rounded-lg px-8 py-4 transform rotate-12 shadow-lg">
            <span className="text-5xl font-bold text-red-900 tracking-widest" style={{ fontFamily: 'serif' }}>舍</span>
        </div>
      </motion.div>

      {/* Card Content / Actions */}
      <div className="absolute bottom-0 w-full p-6 flex flex-col gap-2 z-30">
        <div className="flex justify-between items-end">
            <div className="text-stone-100">
                <h3 className="font-serif text-lg font-bold truncate max-w-[200px] drop-shadow-sm tracking-wide">{image.file.name}</h3>
                <p className="text-stone-400 text-xs">{(image.file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            
            {active && (
              <button 
                onPointerDownCapture={(e) => e.stopPropagation()} // Prevent drag start
                onClick={analyzeImage}
                className="bg-stone-800/80 hover:bg-stone-700 backdrop-blur-md text-stone-200 p-2.5 rounded-full transition-all shadow-lg active:scale-95 border border-stone-600"
                title="AI 赏析"
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
            )}
        </div>

        {/* Analysis Result */}
        {analysis && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900/80 backdrop-blur-md rounded-lg p-4 mt-2 border-l-2 border-emerald-500"
            >
                <p className="text-stone-200 text-sm leading-relaxed flex gap-3 italic" style={{ fontFamily: 'serif' }}>
                    <Info className="w-4 h-4 min-w-[16px] mt-1 text-emerald-500" />
                    {analysis}
                </p>
            </motion.div>
        )}
      </div>

    </motion.div>
  );
};