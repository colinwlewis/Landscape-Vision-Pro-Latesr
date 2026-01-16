
import React from 'react';

// Using extremely stable, high-resolution Unsplash images that match your provided themes exactly.
const BEFORE_IMG = "https://images.unsplash.com/photo-1597047084897-51e81819a4a7?auto=format&fit=crop&w=1200&q=80";
const AFTER_IMG = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

export const FeaturedTransformation: React.FC = () => {
  return (
    <div className="w-full py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Before Side */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
            <img 
              src={BEFORE_IMG} 
              alt="Before" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-gray-900/80 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
              Existing Yard
            </div>
          </div>
          <div className="px-2">
            <h4 className="text-sm font-bold text-gray-900 uppercase">Stage 1: Site Analysis</h4>
            <p className="text-xs text-gray-500 italic">"The existing property before any landscaping work begins."</p>
          </div>
        </div>

        {/* After Side */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-leaf-500 shadow-2xl">
            <img 
              src={AFTER_IMG} 
              alt="After" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-leaf-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
              Vision Render
            </div>
          </div>
          <div className="px-2">
            <h4 className="text-sm font-bold text-leaf-700 uppercase">Stage 2: Architectural Vision</h4>
            <p className="text-xs text-gray-600 italic">"A mature, luxury garden designed to maximize property value."</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-block px-4 py-2 bg-leaf-50 rounded-full border border-leaf-100 mb-4">
          <span className="text-[10px] font-black text-leaf-700 uppercase tracking-widest">Photorealistic AI Transformation Demo</span>
        </div>
        <p className="text-sm text-gray-400 max-w-lg mx-auto italic">
          "Show your clients the future of their home. Our AI translates dirt and construction into beautiful, mature gardens instantly."
        </p>
      </div>
    </div>
  );
};
