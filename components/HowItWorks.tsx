
import React from 'react';

const Step = ({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="w-14 h-14 bg-leaf-50 text-leaf-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
      {icon}
    </div>
    <div className="text-[10px] font-black text-leaf-600 uppercase tracking-widest mb-2">Step {number}</div>
    <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">{title}</h3>
    <p className="text-sm text-gray-500 font-medium leading-relaxed">{description}</p>
  </div>
);

export const HowItWorks: React.FC = () => {
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">The Pro Workflow</h2>
        <div className="h-1.5 w-12 bg-leaf-600 mx-auto rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Step 
          number="01" 
          title="Capture Site" 
          description="Upload a high-resolution photo of the existing property. Front yards, backyards, or bare lots." 
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <Step 
          number="02" 
          title="Define Vision" 
          description="Describe your changes. Mention specific materials like slate, oak, native plants, or lighting." 
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
        />
        <Step 
          number="03" 
          title="Transform AI" 
          description="Watch our AI architect render your design instantly with photorealistic depth and accuracy." 
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>
    </div>
  );
};
