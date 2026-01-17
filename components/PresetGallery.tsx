
import React from 'react';
import { LandscapePreset } from '../types';

const UK_PRESETS: LandscapePreset[] = [
  {
    id: 'modern_minimalist',
    title: 'Modern Minimalist',
    description: 'Clean lines & geometry',
    image: '',
    prompt: 'Transform into a contemporary modern minimalist garden. Use clean lines, geometric shapes, and a limited plant palette. Feature gravel areas, sleek large-format porcelain paving, and architectural plants like bamboo and ornamental grasses.'
  },
  {
    id: 'cottage',
    title: 'English Cottage',
    description: 'Traditional & floral',
    image: '',
    prompt: 'Create a quintessential English cottage garden. Use informal planting with abundant flowers like roses, lavender, foxgloves, and hollyhocks. Include winding paths, rustic brick or stone, and a romantic, overgrown feel.'
  },
  {
    id: 'wildlife',
    title: 'Wildlife Haven',
    description: 'Nature friendly',
    image: '',
    prompt: 'Design a wildlife and nature-friendly garden. Include wildflower meadows, native species, a small pond for wildlife, log piles, and areas specifically designed for pollinators and birds.'
  },
  {
    id: 'mediterranean',
    title: 'Mediterranean',
    description: 'Drought tolerant',
    image: '',
    prompt: 'Transform into a Mediterranean drought-tolerant garden. Use gravel mulch, warm terracotta paving, lavender, herbs like rosemary and thyme, olive trees, and succulents.'
  },
  {
    id: 'japanese',
    title: 'Japanese Zen',
    description: 'Peaceful & precise',
    image: '',
    prompt: 'Create a Japanese-inspired Zen garden. Feature minimalist planting, cloud-pruned Acer Palmatum (maple) trees, bamboo, moss, carefully placed rocks, and perhaps a stone lantern or water feature.'
  },
  {
    id: 'tropical',
    title: 'Urban Jungle',
    description: 'Lush exotic foliage',
    image: '',
    prompt: 'Design a tropical urban jungle garden. Use lush, dramatic foliage-focused planting with hardy palms, banana plants, tree ferns (Dicksonia antarctica), and large-leafed hostas for a dense, exotic look.'
  },
  {
    id: 'formal',
    title: 'Formal Estate',
    description: 'Symmetry & topiary',
    image: '',
    prompt: 'Create a formal, structured garden. Use manicured box hedging, topiary cones or balls, symmetrical layouts, a pristine lawn, and classical elements like statuary or a central stone fountain.'
  },
  {
    id: 'low_maintenance',
    title: 'Low Maintenance',
    description: 'Easy care living',
    image: '',
    prompt: 'Design a low maintenance garden. Feature easy-care evergreen shrubs, extensive hard landscaping like composite decking or paving, and perhaps artificial lawn or slate chippings to minimize upkeep.'
  },
  {
    id: 'kitchen_garden',
    title: 'Kitchen Garden',
    description: 'Edible potager',
    image: '',
    prompt: 'Transform into a productive edible kitchen garden (Potager). Include raised timber vegetable beds, a greenhouse, fruit trees, and herbs mixed with ornamental flowers for a functional yet beautiful space.'
  },
  {
    id: 'coastal',
    title: 'Coastal Retreat',
    description: 'Salt-tolerant & airy',
    image: '',
    prompt: 'Create a seaside coastal garden. Use salt-tolerant plants like sea thrift and sea holly, weathered timber decking, driftwood features, and pebble or shingle ground cover to evoke a beach vibe.'
  },
  {
    id: 'urban_courtyard',
    title: 'City Courtyard',
    description: 'Small space design',
    image: '',
    prompt: 'Maximize this small urban courtyard. Use vertical planting on walls (living walls), built-in bench seating with raised beds, container gardens, and clever screening for privacy. Smart, space-saving design.'
  },
  {
    id: 'rewilding',
    title: 'Wild Meadow',
    description: 'Natural rewilding',
    image: '',
    prompt: 'Adopt a rewilding approach. Let nature take over with long grasses, native wildflowers, and minimal intervention. A natural, soft, and ecological aesthetic that encourages biodiversity.'
  },
  {
    id: 'scandi',
    title: 'Scandi Nordic',
    description: 'Wood & calm tones',
    image: '',
    prompt: 'Design a Scandi/Nordic style garden. Use simple functional design, natural light wood decking, multi-stem silver birch trees, ferns, and a calm, muted color palette with white and green.'
  },
  {
    id: 'country_estate',
    title: 'Country Estate',
    description: 'Grand & classic',
    image: '',
    prompt: 'Transform into a grand English country estate style. Feature sweeping lawns, deep herbaceous borders full of color, rose gardens, and classical focal points like a pergola or stone urns.'
  },
  {
    id: 'dry_gravel',
    title: 'Dry Gravel',
    description: 'Beth Chatto style',
    image: '',
    prompt: 'Create a dry gravel garden in the style of Beth Chatto. Use drought-resistant perennials planted directly into gravel, emphasizing texture and form over lush green lawns.'
  },
  {
    id: 'moonlight',
    title: 'Moonlight Garden',
    description: 'White evening flowers',
    image: '',
    prompt: 'Design a moonlight evening garden. Focus on white and pale flowers that glow at dusk, fragrant plants like jasmine or night-scented stock, and subtle atmospheric lighting.'
  },
  {
    id: 'sensory',
    title: 'Sensory Space',
    description: 'Texture & scent',
    image: '',
    prompt: 'Create a sensory garden for relaxation. Use highly textured plants like Lamb\'s Ear, fragrant herbs, ornamental grasses that rustle in the wind, and a gentle water feature for sound.'
  },
  {
    id: 'prairie',
    title: 'Prairie Style',
    description: 'New Perennial / Oudolf',
    image: '',
    prompt: 'Design a New Perennial / Prairie style garden inspired by Piet Oudolf. Use naturalistic drifts of ornamental grasses and tall perennials like Echinacea and Rudbeckia in muted, earthy tones.'
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
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Design Styles</h3>
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
