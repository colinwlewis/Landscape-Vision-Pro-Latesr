
import React, { useState, useMemo } from 'react';
import { SavedDesign, DesignIteration } from '../types';
import { Button } from './Button';

interface SavedDesignsGalleryProps {
  designs: SavedDesign[];
  onLoad: (design: SavedDesign) => void;
  onEdit: (design: SavedDesign) => void;
  onRefine: (design: SavedDesign) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<{
  design: SavedDesign;
  onLoad: (design: SavedDesign) => void;
  onRefine: (design: SavedDesign) => void;
  onDelete: (id: string) => void;
  formatDate: (ts: number) => string;
}> = ({ design, onLoad, onRefine, onDelete, formatDate }) => {
  const [activeImage, setActiveImage] = useState(design.generatedImage);
  const [activePrompt, setActivePrompt] = useState(design.prompt);

  const iterations = useMemo(() => {
    const list: (DesignIteration | { id: string, image: string, prompt: string, isBaseline: boolean })[] = [
      { id: 'baseline', image: design.originalImage, prompt: 'Original Photo', isBaseline: true },
      ...(design.iterations || [])
    ];
    return list;
  }, [design]);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col group/card">
      <div className="relative h-60 bg-gray-100 cursor-pointer overflow-hidden" onClick={() => onLoad(design)}>
        <img 
          src={activeImage} 
          alt="Project View" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <div className="bg-leaf-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-leaf-400">
            {iterations.length - 1} Transformations
          </div>
          {activeImage === design.originalImage && (
            <div className="bg-gray-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
              Baseline View
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-6">
           <p className="text-white text-xs font-medium italic mb-3 line-clamp-2">"{activePrompt}"</p>
           <span className="bg-white text-leaf-700 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl self-start">
             Open Full Editor
           </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow space-y-4">
        {/* Interactive History Track */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Evolution Track</p>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar scrollbar-hide">
            {iterations.map((iter, idx) => (
              <button
                key={iter.id}
                onClick={() => {
                  setActiveImage(iter.image);
                  setActivePrompt(iter.prompt);
                }}
                className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === iter.image 
                    ? 'border-leaf-500 ring-2 ring-leaf-100 scale-110 z-10' 
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-200'
                }`}
                title={iter.prompt}
              >
                <img src={iter.image} className="w-full h-full object-cover" alt={`Stage ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 items-start pt-2 border-t border-gray-50">
            <div className="flex flex-col flex-grow min-w-0">
                 <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{formatDate(design.timestamp)}</p>
                 </div>
                 <p className="text-sm text-gray-700 font-bold line-clamp-1 leading-snug">
                   {design.prompt}
                 </p>
            </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto">
          <button 
            onClick={() => onLoad(design)}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all border border-gray-100"
          >
            Details
          </button>
          <button 
            onClick={() => onRefine(design)}
            className="flex-1 bg-leaf-50 hover:bg-leaf-600 hover:text-white text-leaf-700 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all border border-leaf-100 flex items-center justify-center gap-2 group/btn shadow-sm"
          >
            <svg className="w-3 h-3 transition-transform group-hover/btn:scale-125" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Refine
          </button>
          <button 
            onClick={() => onDelete(design.id)}
            className="px-4 py-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-50"
            title="Delete project"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const SavedDesignsGallery: React.FC<SavedDesignsGalleryProps> = ({ designs, onLoad, onEdit, onRefine, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDesigns = useMemo(() => {
    return designs.filter(design => {
      const matchesSearch = design.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (dateFilter) {
        const designDate = new Date(design.timestamp);
        const designDateStr = designDate.getFullYear() + '-' + 
                             String(designDate.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(designDate.getDate()).padStart(2, '0');
        matchesDate = designDateStr === dateFilter;
      }
      
      return matchesSearch && matchesDate;
    });
  }, [designs, searchTerm, dateFilter]);

  return (
    <div id="saved-designs-gallery" className="mt-16 border-t border-gray-200 pt-10 mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Project Portfolio</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            {filteredDesigns.length} {filteredDesigns.length === 1 ? 'transformation' : 'transformations'} archived
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search concepts..."
              className="pl-10 block w-full sm:w-64 rounded-xl border-gray-200 shadow-sm focus:ring-leaf-500 focus:border-leaf-500 sm:text-sm border p-2.5 outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <input
            type="date"
            className="block w-full sm:w-auto rounded-xl border-gray-200 shadow-sm focus:ring-leaf-500 focus:border-leaf-500 sm:text-sm border p-2.5 text-gray-500 outline-none font-medium"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          
          {(searchTerm || dateFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setDateFilter(''); }}
              className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 px-2 py-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      
      {filteredDesigns.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
           <div className="mx-auto h-16 w-16 text-gray-200 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
             </svg>
           </div>
           <h3 className="text-lg font-black text-gray-900 uppercase">No Visions Found</h3>
           <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto font-medium">
             {designs.length === 0 
               ? "Your portfolio is empty. Generate your first AI landscape vision to start your collection."
               : "No projects match your current filters. Try a different search term."}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDesigns.map((design) => (
            <ProjectCard 
              key={design.id} 
              design={design} 
              onLoad={onLoad} 
              onRefine={onRefine} 
              onDelete={onDelete} 
              formatDate={formatDate} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
