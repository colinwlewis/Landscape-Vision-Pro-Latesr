
import React, { useState, useRef, useEffect } from 'react';
import { generateLandscapeVisualization } from './services/geminiService';
import { getSavedDesigns, saveDesign, deleteDesign, saveDraft, getDraft, clearDraft } from './services/storageService';
import { updateLeadDesign } from './services/firebaseService';
import { Button } from './components/Button';
import { ResultComparison } from './components/ResultComparison';
import { SavedDesignsGallery } from './components/SavedDesignsGallery';
import { LoadingState } from './components/LoadingState';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { HowItWorks } from './components/HowItWorks';
import { PresetGallery } from './components/PresetGallery';
import { FeaturedTransformation } from './components/FeaturedTransformation';
import { DemoShowcase } from './components/DemoShowcase';
import { SignupForm } from './components/SignupForm';
import { AISuggestions } from './components/AISuggestions';
import { AppState, SavedDesign, DesignIteration, AutoSaveState, UserLead, LandscapePreset, LandscapingSuggestion } from './types';
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
  const [suggestions, setSuggestions] = useState<LandscapingSuggestion[]>([]);
  const [showSignup, setShowSignup] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'save' | 'download' } | null>(null);

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

      // Simple mock suggestions logic based on prompt keywords
      const mockSuggestions: LandscapingSuggestion[] = [
        { category: 'Plants', item: 'Lavender Hidcote', description: 'Adds year-round structure and summer fragrance.' },
        { category: 'Lighting', item: 'Solar Uplights', description: 'Highlights architectural trees like Acers at night.' },
        { category: 'Hardscape', item: 'Granite Sets', description: 'Perfect for defining clean paths and borders.' }
      ];
      setSuggestions(mockSuggestions);

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
    if (!user) {
      setPendingAction({ type: 'save' });
      setShowSignup(true);
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleDownloadClick = () => {
    if (!generatedImage) return;
    if (!user) {
      setPendingAction({ type: 'download' });
      setShowSignup(true);
    } else {
      executeDownload(generatedImage);
    }
  };

  const executeDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `landscape-vision-pro-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSignupComplete = (newUser: UserLead) => {
    setUser(newUser);
    localStorage.setItem('landscape_vision_user', JSON.stringify(newUser));
    setShowSignup(false);
    
    if (pendingAction?.type === 'save') {
      setShowSaveDialog(true);
    } else if (pendingAction?.type === 'download' && generatedImage) {
      executeDownload(generatedImage);
    }
    setPendingAction(null);
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
    setSuggestions([]);
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
               {user && (
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-leaf-50 rounded-full border border-leaf-100">
                    <div className="w-6 h-6 bg-leaf-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black uppercase text-leaf-700">{user.name.split(' ')[0]}</span>
                 </div>
               )}
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
        {showSignup && (
          <SignupForm 
            actionName={pendingAction?.type === 'save' ? 'Save Design' : 'Download HD'} 
            onComplete={handleSignupComplete} 
            onCancel={() => { setShowSignup(false); setPendingAction(null); }}
          />
        )}

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
              onDownload={handleDownloadClick}
            />
            
            <AISuggestions 
              suggestions={suggestions} 
              onSelectSuggestion={(item) => handleGenerate(`Integrate ${item} into the landscaping naturally.`)} 
              isLoading={appState === AppState.LOADING}
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

            <FeaturedTransformation />

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
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative group/input">
                        <textarea 
                          id="vision-prompt"
                          rows={4} 
                          className="w-full border-2 border-gray-100 rounded-3xl p-6 pr-14 text-base font-medium focus:border-leaf-500 transition-all outline-none bg-white shadow-xl shadow-gray-200/20 resize-none placeholder:text-gray-200 leading-relaxed" 
                          placeholder="Describe your architectural dream... e.g. 'Add a contemporary slate patio with an integrated fire pit, low-level warm LED lighting, and a screen of bamboo for privacy...'" 
                          value={prompt} 
                          maxLength={MAX_PROMPT_LENGTH}
                          onChange={e => {
                            setPrompt(e.target.value);
                            setActivePresetId(undefined);
                          }} 
                          onBlur={() => commit()}
                        />
                        
                        {prompt && (
                          <button 
                            onClick={handleClearPrompt}
                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group-hover/input:opacity-100"
                            title="Clear prompt"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}

                        <div className="mt-4 flex items-center justify-between px-2">
                           <div className="flex items-center gap-3 flex-grow max-w-xs">
                              <div className="h-1.5 flex-grow bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${promptPercentage > 90 ? 'bg-amber-500' : 'bg-leaf-500'}`} 
                                  style={{ width: `${promptPercentage}%` }}
                                ></div>
                              </div>
                              <span className={`text-[10px] font-black tracking-widest uppercase flex-shrink-0 ${promptPercentage > 90 ? 'text-amber-600' : 'text-gray-400'}`}>
                                {prompt.length} / {MAX_PROMPT_LENGTH}
                              </span>
                           </div>
                           <div className="flex gap-1">
                              <div className={`w-2 h-2 rounded-full ${prompt.length > 0 ? 'bg-leaf-500 animate-pulse' : 'bg-gray-200'}`}></div>
                           </div>
                        </div>
                      </div>

                      {/* Presets Gallery */}
                      <div className="px-1 pt-2">
                        <PresetGallery onSelect={handlePresetSelect} activePresetId={activePresetId} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white border-t border-gray-50 flex justify-end">
                  <Button 
                    onClick={() => handleGenerate()} 
                    disabled={!imagePreview || !prompt.trim()} 
                    className="px-16 py-5 text-xl font-black uppercase tracking-[0.15em] shadow-[0_20px_40px_rgba(22,163,74,0.25)] hover:scale-105 active:scale-95 transition-all rounded-[1.5rem]"
                  >
                    Generate Vision
                  </Button>
                </div>
              </div>
            </div>

            <HowItWorks />
            <DemoShowcase />
          </div>
        )}
        
        <div className="max-w-7xl mx-auto">
          <SavedDesignsGallery 
            designs={savedDesigns} 
            onLoad={handleLoadSaved} 
            onEdit={(d) => {
              setImagePreview(d.originalImage);
              setOriginalImageRef(d.originalImage);
              setPromptAndSave(d.prompt);
              setAppState(AppState.IDLE);
              setGeneratedImage(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            onRefine={handleRefineSaved}
            onDelete={async id => setSavedDesigns(await deleteDesign(id))} 
          />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">Landscape Vision Pro &copy; {new Date().getFullYear()}</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-leaf-600 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
            <a href="#" className="text-gray-400 hover:text-leaf-600 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
