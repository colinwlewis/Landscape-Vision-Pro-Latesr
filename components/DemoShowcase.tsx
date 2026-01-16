
import React from 'react';

const projects = [
  {
    title: "Urban Garden Transformation",
    desc: "From a concrete backyard to a multi-level social space.",
    before: "https://images.unsplash.com/photo-1590019158224-399d08d350af?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1558904541-efa8c1915c6f?auto=format&fit=crop&q=80&w=800",
    tags: ["Modern", "Patio", "Lighting"]
  },
  {
    title: "Rustic Estate Renewal",
    desc: "Revitalizing a historic property with native perennial borders.",
    before: "https://images.unsplash.com/photo-1597047084897-51e81819a4a7?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    tags: ["Native", "Stone", "Perennials"]
  },
  {
    title: "Minimalist Front Yard",
    desc: "Replacing high-maintenance turf with architectural grasses.",
    before: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
    tags: ["Zero-scape", "Modern", "Clean"]
  }
];

export const DemoShowcase: React.FC = () => {
  return (
    <div className="py-24">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">The Vision Portfolio</h2>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">
          See how leading landscape architects use our AI to close more deals.
        </p>
        <div className="h-1 w-20 bg-leaf-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {projects.map((project, idx) => (
          <div key={idx} className="flex flex-col space-y-6 group">
            {/* The Before/After Stack */}
            <div className="relative space-y-2">
              {/* After (The Hero) */}
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-gray-900/5">
                <img src={project.after} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="After Transformation" />
                <div className="absolute top-4 right-4 bg-leaf-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  Vision Render
                </div>
              </div>
              
              {/* Before (The Inset) */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-900/5 transition-transform group-hover:-translate-y-2">
                <img src={project.before} className="w-full h-full object-cover" alt="Before Transformation" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">Original</span>
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div className="pt-8 pl-4 space-y-3">
              <div className="flex gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-black uppercase text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded-md border border-leaf-100">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">{project.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{project.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Social Proof */}
      <div className="mt-24 bg-gray-900 rounded-[3rem] p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-3xl">
        <div className="space-y-4 text-center lg:text-left">
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Ready to win your next bid?</h3>
          <p className="text-gray-400 font-medium max-w-md">Join 500+ professionals transforming their client presentations with Landscape Vision Pro.</p>
        </div>
        <div className="flex flex-col items-center gap-4">
           <div className="flex -space-x-4">
              {[12, 45, 67, 88, 92].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} className="w-14 h-14 rounded-full border-4 border-gray-900 shadow-xl" alt="User" />
              ))}
           </div>
           <p className="text-leaf-400 text-[10px] font-black uppercase tracking-widest">Active Landscape Architects</p>
        </div>
      </div>
    </div>
  );
};
