
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { ImageCropper } from './ImageCropper';
import { DesignIteration } from '../types';

interface ResultComparisonProps {
  originalImage: string;
  generatedImage: string;
  currentPrompt: string;
  pastIterations?: DesignIteration[];
  onReset: () => void;
  onSave: () => void;
  onRefine: (customPrompt?: string) => void;
  onCrop: (newImage: string) => void;
  onDownload: () => void;
  onSelectIteration?: (iteration: DesignIteration) => void;
  onViewBaseline?: () => void;
  isSaving?: boolean;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({ 
  originalImage, 
  generatedImage, 
  currentPrompt,
  pastIterations = [],
  onReset,
  onSave,
  onRefine,
  onCrop,
  onDownload,
  onSelectIteration,
  onViewBaseline,
  isSaving = false
}) => {
  const [viewMode, setViewMode] = useState<'slider' | 'split'>('split'); // Default to split for higher reliability
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [quickPrompt, setQuickPrompt] = useState('');
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  const handleSliderMove = useCallback((clientX: number) => {
    if (sliderContainerRef.current) {
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    }
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => isDraggingSlider.current && handleSliderMove(e.clientX);
    const handleUp = () => isDraggingSlider.current = false;
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [handleSliderMove]);

  const handleQuickRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    onRefine(quickPrompt);
    setQuickPrompt('');
  };

  const isAtBaseline = generatedImage === originalImage;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {isCropping && (
        <ImageCropper imageUrl={generatedImage} onCrop={(img) => {onCrop(img); setIsCropping(false)}} onCancel={() => setIsCropping(false)} />
      )}

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Main Display Area */}
        <div className="flex-grow w-full space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Project View</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Interactive Comparison</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
               <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner border border-gray-200">
                <button 
                  onClick={() => setViewMode('slider')} 
                  className={`p-2 rounded-lg transition-all ${viewMode === 'slider' ? 'bg-white text-leaf-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Slider View"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5" /></svg>
                </button>
                <button 
                  onClick={() => setViewMode('split')} 
                  className={`p-2 rounded-lg transition-all ${viewMode === 'split' ? 'bg-white text-leaf-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Side by Side"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
               </div>
              
              <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

              <Button variant="outline" onClick={() => setRotation(r => (r + 90) % 360)} className="!p-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></Button>
              <Button variant="outline" onClick={onReset} className="font-bold">New</Button>
              <Button variant="secondary" onClick={onSave} disabled={isSaving} className="font-bold">Save</Button>
              <Button onClick={onDownload} className="font-black tracking-widest uppercase text-xs shadow-lg" disabled={isAtBaseline}>Download HD</Button>
            </div>
          </div>

          {viewMode === 'slider' ? (
            <div ref={sliderContainerRef} className="relative aspect-video w-full overflow-hidden rounded-[2rem] shadow-2xl bg-gray-900 cursor-ew-resize select-none ring-1 ring-black/5"
                 onMouseDown={() => isDraggingSlider.current = true}
                 onTouchStart={() => isDraggingSlider.current = true}
            >
              <img src={originalImage} className="absolute inset-0 w-full h-full object-cover" alt="Original" />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                 <img src={generatedImage} className="absolute inset-0 w-full h-full object-cover max-w-none" style={{ width: sliderContainerRef.current?.offsetWidth || '100%', transform: `rotate(${rotation}deg)` }} alt="Generated" />
              </div>
              <div className="absolute inset-y-0 w-1 bg-white shadow-2xl flex items-center justify-center pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                 <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center text-leaf-600 border-4 border-leaf-50">
                   <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M8 15l4 3 4-3m-8-6l4-3 4 3" /></svg>
                 </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group overflow-hidden rounded-[2rem] border border-gray-100 shadow-xl">
                <img src={originalImage} className="aspect-video object-cover w-full transition-transform duration-700 group-hover:scale-105" alt="Before" />
                <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/20">Original Site</div>
              </div>
              <div className="relative group overflow-hidden rounded-[2rem] border-4 border-leaf-500 shadow-xl">
                <img src={generatedImage} className="aspect-video object-cover w-full transition-transform duration-700 group-hover:scale-105" style={{ transform: `rotate(${rotation}deg)` }} alt="After" />
                <div className="absolute bottom-6 right-6 bg-leaf-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl">Vision Render</div>
              </div>
            </div>
          )}
        </div>

        {/* Refinement Panel */}
        <div className="w-full xl:w-80 space-y-6 flex-shrink-0">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-3">
             <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Active Instructions</h3>
             <p className="text-sm text-gray-600 font-medium italic leading-relaxed">
               {isAtBaseline ? "Add instructions to start." : `"${currentPrompt}"`}
             </p>
          </div>

          <div className="bg-leaf-600 p-6 rounded-[2rem] shadow-xl text-white space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest">Iterate Design</h3>
             <form onSubmit={handleQuickRefine} className="space-y-3">
                <textarea 
                  value={quickPrompt}
                  onChange={e => setQuickPrompt(e.target.value)}
                  placeholder="e.g. 'Add more lavender...'"
                  className="w-full bg-leaf-700/50 border border-leaf-400/30 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-leaf-300 resize-none font-medium"
                  rows={3}
                />
                <Button type="submit" disabled={!quickPrompt.trim()} className="w-full bg-white !text-leaf-700 hover:bg-leaf-50 font-black uppercase tracking-widest text-[10px] py-3">Apply</Button>
             </form>
          </div>

          {pastIterations.length > 0 && (
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Evolution</h3>
               <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {pastIterations.map((iter, idx) => (
                    <div 
                      key={iter.id}
                      onClick={() => onSelectIteration?.(iter)}
                      className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${iter.image === generatedImage ? 'bg-leaf-50 border-leaf-200' : 'border-transparent hover:bg-gray-50'}`}
                    >
                      <img src={iter.image} className="w-10 h-10 rounded-lg object-cover" alt="Thumb" />
                      <span className="text-[10px] font-black uppercase text-gray-500">Stage {idx + 1}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
