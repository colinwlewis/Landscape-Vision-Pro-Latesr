
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateLandscapeVisualization } from './services/geminiService';
import { getSavedDesigns, saveDesign, deleteDesign, saveDraft, getDraft, clearDraft } from './services/storageService';
import { saveLeadToFirebase, updateLeadDesign } from './services/firebaseService';
import { Button } from './components/Button';
import { ResultComparison } from './components/ResultComparison';
import { SavedDesignsGallery } from './components/SavedDesignsGallery';
import { LoadingState } from './components/LoadingState';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { HowItWorks } from './components/HowItWorks';
import { PresetGallery } from './components/PresetGallery';
import { AppState, SavedDesign, DesignIteration, AutoSaveState, UserLead, LandscapePreset } from './types';
import { useUndoRedo } from './hooks/useUndoRedo';

const MAX_PROMPT_LENGTH = 1000;

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImageRef, setOriginalImageRef] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [pastIterations, setPastIterations] = useState<DesignIteration[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<number | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | undefined>();

  // User State (Optional lead capture)
  const [user, setUser] = useState<UserLead | null>(() => {
    const saved = localStorage.getItem('landscape_vision_user');
    return saved ? JSON.parse(saved) : null;
  });

  const { 
    value: prompt, 
    updateValue: setPrompt, 
    commit, 
    setAndSave: setPromptAndSave, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useUndoRedo('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const designs = await getSavedDesigns();
      setSavedDesigns(designs);

      const draft = await getDraft();
      if (draft && draft.timestamp) {
        if (!selectedFile && !imagePreview && !prompt) {
           setPromptAndSave(draft.prompt);
           setImagePreview(draft.imagePreview);
           setGeneratedImage(draft.generatedImage);
           setPastIterations(draft.pastIterations);
           setOriginalImageRef(draft.originalImageRef);
           setAppState(draft.appState);
           setLastAutoSave(draft.timestamp);
           if (draft.user) setUser(draft.user);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (imagePreview || prompt) {
        const currentState: AutoSaveState = {
          timestamp: Date.now(),
          prompt,
          imagePreview,
          generatedImage,
          pastIterations,
          originalImageRef,
          appState,
          user
        };
        await saveDraft(currentState);
        setLastAutoSave(Date.now());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [prompt, imagePreview, generatedImage, pastIterations, originalImageRef, appState, user]);

  const processFile = (file: File) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload a valid image file (JPG, PNG).');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      setGeneratedImage(null);
      setCurrentDesignId(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setOriginalImageRef(result);
        setPastIterations([]);
      };
      reader.readAsDataURL(file);
  };

  const handleGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if ((!selectedFile && !imagePreview) || !activePrompt.trim()) return;
    
    setAppState(AppState.LOADING);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const inputSource = generatedImage || selectedFile || imagePreview!;
      const resultImage = await generateLandscapeVisualization(inputSource, activePrompt);
      
      const newIteration: DesignIteration = {
        id: crypto.randomUUID(),
        prompt: activePrompt,
        image: resultImage,
        timestamp: Date.now()
      };
      
      setGeneratedImage(resultImage);
      setPastIterations(prev => [...prev, newIteration]);
      setPromptAndSave(activePrompt);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during generation.');
      setAppState(AppState.ERROR);
    }
  };

  const handlePresetSelect = (preset: LandscapePreset) => {
    setPromptAndSave(preset.prompt);
    setActivePresetId(preset.id);
    if (window.innerWidth < 768) {
      document.getElementById('vision-prompt')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };

  const handleDownloadClick = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `landscape-vision-pro-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmSaveDesign = async () => {
    if (!generatedImage || !imagePreview) return;
    setIsSaving(true);
    
    const newDesign: SavedDesign = {
      id: currentDesignId || crypto.randomUUID(),
      timestamp: Date.now(),
      originalImage: originalImageRef || imagePreview, 
      generatedImage: generatedImage,
      prompt: prompt,
      iterations: pastIterations,
      userId: user?.email 
    };

    const success = await saveDesign(newDesign);
    if (success) {
      const updatedDesigns = await getSavedDesigns();
      setSavedDesigns(updatedDesigns);
      setCurrentDesignId(newDesign.id);
      if (user) await updateLeadDesign(user.email, newDesign); 
      await clearDraft();
      setShowSaveDialog(false);
      setIsSaving(false);
    } else {
      setIsSaving(false);
      setShowSaveDialog(false);
      setErrorMsg("Failed to save project.");
    }
  };

  const handleReset = async () => {
    setAppState(AppState.IDLE);
    setSelectedFile(null);
    setImagePreview(null);
    setOriginalImageRef(null);
    setGeneratedImage(null);
    setPastIterations([]);
    setPromptAndSave('');
    setCurrentDesignId(null);
    setErrorMsg(null);
    setActivePresetId(undefined);
    await clearDraft();
  };

  const handleClearPrompt = () => {
    setPromptAndSave('');
    setActivePresetId(undefined);
  };

  const handleRefineSaved = (design: SavedDesign) => {
    setImagePreview(design.originalImage);
    setOriginalImageRef(design.originalImage);
    setPastIterations(design.iterations || []);
    setGeneratedImage(design.generatedImage);
    setCurrentDesignId(design.id);
    setSelectedFile(null);
    setPromptAndSave(design.prompt);
    setAppState(AppState.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSaved = (design: SavedDesign) => {
    setCurrentDesignId(design.id);
    setOriginalImageRef(design.originalImage);
    setImagePreview(design.originalImage);
    setGeneratedImage(design.generatedImage);
    setPromptAndSave(design.prompt);
    setPastIterations(design.iterations || []);
    setAppState(AppState.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIteration = (iteration: DesignIteration) => {
    setGeneratedImage(iteration.image);
    setPromptAndSave(iteration.prompt);
  };

  const handleViewBaseline = () => {
    setGeneratedImage(null);
    setPromptAndSave('');
  };

  const promptPercentage = Math.min((prompt.length / MAX_PROMPT_LENGTH) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer" onClick={handleReset}>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                <span>Landscape Vision</span>
                <span className="bg-leaf-600 text-white text-[10px] px-2 py-0.5 rounded-md italic shadow-sm tracking-widest font-bold">PRO</span>
              </h1>
            </div>
            <div className="flex items-center gap-6">
               <button onClick={() => document.getElementById('saved-designs-gallery')?.scrollIntoView({behavior:'smooth'})} className="text-sm font-bold text-gray-600 hover:text-leaf-600 transition-colors flex items-center gap-1">
                 Projects 
                 {savedDesigns.length > 0 && (
                   <span className="bg-leaf-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                     {savedDesigns.length}
                   </span>
                 )}
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        {appState === AppState.LOADING ? (
           <LoadingState imagePreview={generatedImage || imagePreview} />
        ) : appState === AppState.SUCCESS && (generatedImage || imagePreview) ? (
          <div className="max-w-7xl mx-auto space-y-8">
            <ResultComparison 
              originalImage={originalImageRef || imagePreview!} 
              generatedImage={generatedImage || originalImageRef || imagePreview!} 
              currentPrompt={prompt}
              pastIterations={pastIterations}
              onReset={handleReset} 
              onSave={handleSaveClick}
              onRefine={handleGenerate}
              onCrop={(img) => setGeneratedImage(img)}
              onSelectIteration={handleSelectIteration}
              onViewBaseline={handleViewBaseline}
              isSaving={isSaving}
              onDownload={() => generatedImage && handleDownloadClick(generatedImage)}
            />
            
            <ConfirmationDialog 
              isOpen={showSaveDialog}
              title={currentDesignId ? "Update Project" : "Save Project History"}
              message={`Ready to store this vision and all its development stages in your local portfolio?`}
              confirmText={currentDesignId ? "Update Project" : "Save Project"}
              onConfirm={confirmSaveDesign}
              onCancel={() => setShowSaveDialog(false)}
              isLoading={isSaving}
            />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
            <div className="max-w-3xl mx-auto space-y-8 text-center">
              <h2 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
                Design the <span className="text-leaf-600 underline decoration-leaf-200 decoration-8 underline-offset-4">perfect</span> yard.
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">Landscape Vision Pro transforms property photos into photorealistic landscape designs in seconds using industry-leading AI.</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
              {errorMsg && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3">
                  <div className="bg-red-100 p-1.5 rounded-full">
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <p className="text-sm font-bold text-red-700">{errorMsg}</p>
                </div>
              )}

              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden ring-1 ring-gray-900/5">
                <div className="p-6 sm:p-10 border-b border-gray-100">
                  <div className="flex items-center mb-8">
                    <div className="flex-shrink-0 bg-leaf-600 text-white rounded-2xl w-10 h-10 flex items-center justify-center font-black shadow-lg shadow-leaf-200">1</div>
                    <h3 className="ml-4 text-xl font-black text-gray-900 uppercase tracking-wide">Property View</h3>
                  </div>
                  {!imagePreview ? (
                    <div className={`mt-2 border-2 border-dashed rounded-[2rem] p-20 text-center cursor-pointer hover:bg-leaf-50/50 transition-all group ${isDragging ? 'border-leaf-500 bg-leaf-50' : 'border-gray-200'}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => {e.preventDefault(); setIsDragging(true)}}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={e => {e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0])}}
                    >
                      <div className="bg-gray-50 group-hover:bg-white p-5 rounded-3xl w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-gray-100 transition-colors shadow-sm">
                        <svg className="w-10 h-10 text-gray-300 group-hover:text-leaf-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Select Real Site Photo</p>
                      <p className="text-xs text-gray-300 mt-3 font-bold uppercase">PNG or JPEG • High Res Recommended</p>
                    </div>
                  ) : (
                    <div className="relative rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl group ring-4 ring-gray-50">
                       <img src={imagePreview} className="w-full h-[400px] object-cover" alt="Preview" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button 
                            onClick={() => {setImagePreview(null); setSelectedFile(null); setOriginalImageRef(null);}} 
                            className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            Reset Image
                          </button>
                       </div>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => e.target.files && processFile(e.target.files[0])} />
                </div>

                <div className="p-6 sm:p-10 bg-gray-50/50">
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-leaf-600 text-white rounded-2xl w-10 h-10 flex items-center justify-center font-black shadow-lg shadow-leaf-200">2</div>
                        <h3 className="ml-4 text-xl font-black text-gray-900 uppercase tracking-wide">Transformation Vision</h3>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={undo} disabled={!canUndo} className="p-3 disabled:opacity-10 hover:text-leaf-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 shadow-sm" title="Undo">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                        </button>
                        <button onClick={redo} disabled={!canRedo} className="p-3 disabled:opacity-10 hover:text-leaf-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 shadow-sm" title="Redo">
                          <svg className="w-6 h-6" fill="none" viewBox="0 