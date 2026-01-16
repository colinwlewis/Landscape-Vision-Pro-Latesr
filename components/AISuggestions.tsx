
import React from 'react';
import { LandscapingSuggestion } from '../types';

interface AISuggestionsProps {
  suggestions: LandscapingSuggestion[];
  onSelectSuggestion: (item: string) => void;
  isLoading: boolean;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ suggestions, onSelectSuggestion, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-leaf-100 p-1.5 rounded-lg">
          <svg className="w-5 h-5 text-leaf-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Expert Recommendations</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((s, i) => (
          <div 
            key={i} 
            className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-leaf-200 transition-all cursor-pointer group flex flex-col h-full"
            onClick={() => onSelectSuggestion(s.item)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                s.category === 'Plants' ? 'bg-green-100 text-green-700' :
                s.category === 'Hardscape' ? 'bg-amber-100 text-amber-700' :
                s.category === 'Lighting' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {s.category}
              </span>
              <button className="text-leaf-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">{s.item}</h4>
            <p className="text-xs text-gray-500 flex-grow">{s.description}</p>
            <div className="mt-3 text-[10px] font-medium text-leaf-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Apply to design
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
