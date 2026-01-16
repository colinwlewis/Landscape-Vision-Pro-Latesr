
import React from 'react';
import { LandscapePreset } from '../types';

const UK_PRESETS: LandscapePreset[] = [
  {
    id: 'cottage',
    title: 'English Cottage',
    description: 'Traditional borders',
    image: '',
    prompt: 'Transform into a classic English cottage garden. Add winding Yorkstone paths, overflowing perennial borders with lavender, foxgloves, and delphiniums, and a rustic wooden arbor with climbing roses.'
  },
  {
    id: 'modern',
    title: 'London Courtyard',
    description: 'Sleek urban minimalism',
    image: '',
    prompt: 'Modern urban courtyard style. Add grey porcelain paving, sleek raised rendered planters, architectural grasses like Miscanthus, and a minimalist black steel water feature with warm LED uplighting.'
  },
  {
    id: 'wildlife',
    title: 'Wildlife Haven',
    description: 'Rewilding & meadows',
    image: '',
    prompt: 'Ecological wildlife garden. Replace lawn with a native wildflower meadow patch, add a small wildlife pond with pebble edges, native hedging like Hawthorn, and multi-stem Silver Birch trees.'
  },
  {
    id: 'formal',
    title: 'Victorian Formal',
    description: 'Structured boxwood',
    image: '',
    prompt: 'Victorian inspired formal garden. Add geometric black and white tile paths, manicured boxwood parterres, a central stone birdbath, and structured rose pillars for a timeless architectural look.'
  },
  {
    id: 'med',
    title: 'Dry Gravel Garden',
    description: 'Mediterranean drought',
    image: '',
    prompt: 'Mediterranean gravel garden. Replace soil/lawn with decorative light gravel, add structural plants like Agave, Rosemary, and Olive trees, with weathered terracotta accents.'
  },
  {
    id: 'zen',
    title: 'Japanese Fusion',
    description: 'Zen simplicity & Acers',
    image: '',
    prompt: 'Japanese-inspired Zen garden. Add a small stone pagoda, cloud-pruned Acer Palmatum trees, a bamboo privacy screen, and a slate-chip path with large basalt stepping stones.'
  },
  {
    id: 'social',
    title: 'Social Deck & Pergola',
    description: 'Luxury entertainment',
    image: '',
    prompt: 'Luxury entertainment deck. Add a large cedar timber deck with a modern black aluminum pergola, an integrated outdoor kitchen with a stone worktop, and contemporary festoon lighting.'
  },
  {
    id: 'edible',
    title: 'Kitchen Garden',
    description: 'Formal edible Potager',
    image: '',
    prompt: 'Formal kitchen garden (Potager). Add raised timber vegetable beds in a symmetrical layout, a traditional glasshouse with a brick base, and espalier fruit trees trained along the fence line.'
  },
  {
    id: 'coastal',
    title: 'Coastal Escape',
    description: 'Hardy grasses & shingle',
    image: '',
    prompt: 'Coastal themed garden. Add weathered timber sleeper retaining walls, sea-holly, ornamental grasses like Calamagrostis, and a pebble shingle ground cover with driftwood accents.'
  },
  {
    id: 'woodland',
    title: 'Woodland Shade',
    description: 'Lush ferns & forest',
    image: '',
    prompt: 'Lush woodland-style shade garden. Add a stumpery feature with mossy logs, various ferns, hostas, and bark-chip paths winding through a canopy of multi-stem Silver Birch and Rowan trees.'
  }
];

interface PresetGalleryProps {
  onSelect: (preset: LandscapePreset) => void;
  activePresetId?: string;
}

export const PresetGallery: React.FC<PresetGalleryProps> = ({ onSelect, activePresetId }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Presets</h3>
        <div className="h-px flex-grow bg-gray-100"></div>
      </div>
      <div className="flex overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar gap-3 -mx-1">
        {UK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`flex-shrink-0 w-44 group px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-left flex flex-col gap-0.5 ${
              activePresetId === preset.id 
                ? 'border-leaf-600 bg-leaf-50 ring-2 ring-leaf-100' 
                : 'border-gray-100 bg-white hover:border-leaf-200 hover:shadow-md'
            }`}
          >
            <span className={`text-[11px] font-black uppercase tracking-tight transition-colors truncate w-full ${
              activePresetId === preset.id ? 'text-leaf-700' : 'text-gray-900 group-hover:text-leaf-600'
            }`}>
              {preset.title}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors truncate w-full ${
              activePresetId === preset.id ? 'text-leaf-600/70' : 'text-gray-400'
            }`}>
              {preset.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
