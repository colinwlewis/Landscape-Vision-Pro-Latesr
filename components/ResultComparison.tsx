
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
  const [viewMode, setViewMode] = useState<'slider' | 'split'>('split');
  const [isCropping, setIsCropping] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isHoveringGen, setIsHoveringGen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  // Force update for slider image width on resize/expand
  const [, setTick] = useState(0);

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
    
    // Handle resize to update slider inner image width
    const handleResize = () => setTick(t => t + 1);

    // Handle Escape to exit fullscreen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => { 
      window.removeEventListener('mousemove', handleMove); 
      window.removeEventListener('mouseup', handleUp); 
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSliderMove, isExpanded]);

  // Trigger resize update when expansion toggles to ensure widths are correct
  useEffect(() => {
    // Small delay to allow transition/layout to settle
    const timeout = setTimeout(() => setTick(t => t + 1), 50);
    return () => clearTimeout(timeout);
  }, [isExpanded]);

  const handleQuickRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    onRefine(quickPrompt);
    setQuickPrompt('');
  };

  const handleGenMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: x * 15, y: y * 15 });
  };

  const isAtBaseline = generatedImage === originalImage;

  return (
    <div className="w-full space-y-6">
      {isCropping && (
        <ImageCropper imageUrl={generatedImage} onCrop={(img) => {onCrop(img); setIsCropping(false)}} onCancel={() => setIsCropping(false)} />
      )}

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Main Display Area - Toggle Fixed/Relative based on isExpanded */}
        <div className={`${
          isExpanded 
            ? 'fixed inset-0 z-[5000] bg-gray-50 p-4 sm:p-8 overflow-hidden flex flex-col gap-6 w-screen h-screen' 
            : 'flex-grow w-full space-y-6 relative'
        }`}>
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 gap-4 flex-shrink-0">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Project View</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Interactive Comparison</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
               <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner border border-gray-200">
                <button 
                  onClick={() => setViewMode('slider')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${viewMode === 'slider' ? 'bg-white text-leaf-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-wider">Magic Slider</span>
                </button>
                <button 
                  onClick={() => setViewMode('split')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${viewMode === 'split' ? 'bg-white text-leaf-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-wider">Side-by-Side</span>
                </button>
               </div>
              
              <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

              {/* Expand / Fullscreen Toggle */}
              <Button 
                variant="outline" 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="!p-2"
                title={isExpanded ? "Collapse View" : "Expand View"}
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                )}
              </Button>

              <Button variant="outline" onClick={onReset} className="font-bold">New</Button>
              <Button variant="secondary" onClick={onSave} disabled={isSaving} className="font-bold">Save</Button>
              <Button onClick={onDownload} className="font-black tracking-widest uppercase text-xs shadow-lg" disabled={isAtBaseline}>Download HD</Button>
            </div>
          </div>

          {/* Image Container - Grows to fill space if expanded */}
          <div className={`w-full ${isExpanded ? 'flex-grow min-h-0' : ''}`}>
            {viewMode === 'slider' ? (
              <div ref={sliderContainerRef} className={`relative overflow-hidden rounded-[2rem] shadow-2xl bg-gray-900 cursor-ew-resize select-none ring-1 ring-black/5 ${isExpanded ? 'h-full w-full' : 'aspect-video w-full'}`}
                   onMouseDown={() => isDraggingSlider.current = true}
                   onTouchStart={() => isDraggingSlider.current = true}
              >
                <img src={originalImage} className="absolute inset-0 w-full h-full object-cover" alt="Original" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                   {/* We use offsetWidth to keep the inner image size consistent with the container, ensuring alignment */}
                   <img 
                      src={generatedImage} 
                      className="absolute inset-0 h-full object-cover max-w-none" 
                      style={{ 
                        width: sliderContainerRef.current?.offsetWidth || '100%' 
                      }} 
                      alt="Generated" 
                   />
                </div>
                <div className="absolute inset-y-0 w-1 bg-white shadow-2xl flex items-center justify-center pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                   <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center text-leaf-600 border-4 border-leaf-50">
                     <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M8 15l4 3 4-3m-8-6l4-3 4 3" /></svg>
                   </div>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 ${isExpanded ? 'grid-cols-2 h-full' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className={`relative group overflow-hidden rounded-[2rem] border border-gray-100 shadow-xl ${isExpanded ? 'h-full' : ''}`}>
                  <img src={originalImage} className={`object-cover w-full transition-transform duration-700 group-hover:scale-105 ${isExpanded ? 'h-full' : 'aspect-video'}`} alt="Before" />
                  <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/20">Original Site</div>
                </div>
                <div 
                  className={`relative group overflow-hidden rounded-[2rem] border-4 border-leaf-500 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-leaf-200/40 ${isExpanded ? 'h-full' : ''}`}
                  onMouseMove={handleGenMouseMove}
                  onMouseEnter={() => setIsHoveringGen(true)}
                  onMouseLeave={() => { setIsHoveringGen(false); setParallax({ x: 0, y: 0 }); }}
                >
                  <img 
                    src={generatedImage} 
                    className={`object-cover w-full transition-transform duration-300 ease-out ${isExpanded ? 'h-full' : 'aspect-video'}`}
                    style={{ 
                      transform: `scale(${isHoveringGen ? 1.1 : 1}) translate(${parallax.x}px, ${parallax.y}px)`,
                      filter: isHoveringGen ? 'brightness(1.03) contrast(1.02)' : 'none'
                    }} 
                    alt="After" 
                  />
                  <div className="absolute bottom-6 right-6 bg-leaf-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl pointer-events-none">Vision Render</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Refinement Panel - Remains visible underneath/behind when expanded, or hidden if covered */}
        <div className="w-full xl:w-80 space-y-6 flex-shrink-0">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-3">
             <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Active Instructions</h3>
             <p className="text-sm text-gray-600 font-medium italic leading-relaxed">
               {isAtBaseline ? "Add instructions to start." : `"${currentPrompt}"`}
             </p>
          </div>

          <div className="bg-leaf-600 p-6 rounded-[2rem] shadow-xl text-white space-y-4 ring-1 ring-white/20">
             <div className="space-y-1">
               <h3 className="text-sm font-black uppercase tracking-widest text-white">Iterate Design</h3>
               <p className="text-sm font-medium text-leaf-50 leading-relaxed">
                 Describe specific changes you want to see (e.g. "Add a firepit", "Remove the tree").
               </p>
             </div>
             <form onSubmit={handleQuickRefine} className="space-y-4 pt-2">
                <textarea 
                  value={quickPrompt}
                  onChange={e => setQuickPrompt(e.target.value)}
                  placeholder="e.g. 'Add more lavender...'"
                  className="w-full bg-black/20 border-2 border-white/10 rounded-2xl p-4 text-base text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/40 focus:bg-black/30 resize-none font-medium transition-all"
                  rows={3}
                />
                <button 
                  type="submit" 
                  disabled={!quickPrompt.trim()} 
                  style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  className="w-full !bg-black !text-white hover:!bg-gray-900 font-black uppercase tracking-[0.15em] text-lg py-5 rounded-xl shadow-xl border-2 border-white/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  APPLY CHANGES
                </button>
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
