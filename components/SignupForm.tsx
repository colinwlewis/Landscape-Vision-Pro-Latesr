
import React, { useState } from 'react';
import { Button } from './Button';
import { UserLead } from '../types';

interface SignupFormProps {
  onComplete: (user: UserLead) => void;
  onCancel: () => void;
  actionName: string; // "Save Project" or "Download"
}

export const SignupForm: React.FC<SignupFormProps> = ({ onComplete, onCancel, actionName }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyAddress: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate a bit of validation
    if (!formData.name || !formData.email) {
      alert("Please enter your name and email.");
      setIsSubmitting(false);
      return;
    }

    const lead: UserLead = {
      ...formData,
      timestamp: Date.now()
    };

    onComplete(lead);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="bg-leaf-600 p-8 text-white relative">
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22H22L12 2Z" fillOpacity="0.3" />
              <path d="M12 6L4 22H20L12 6Z" />
            </svg>
            <h2 className="text-2xl font-bold">Consult with a Pro</h2>
          </div>
          <p className="text-leaf-50 opacity-90">
            Sign up to {actionName.toLowerCase()} and get a free professional review of your design.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label>
              <input 
                type="text" 
                required
                className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-leaf-500 focus:border-leaf-500 border text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address *</label>
              <input 
                type="email" 
                required
                className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-leaf-500 focus:border-leaf-500 border text-sm"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
            <input 
              type="tel" 
              className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-leaf-500 focus:border-leaf-500 border text-sm"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Property Address</label>
            <textarea 
              rows={2}
              className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-leaf-500 focus:border-leaf-500 border text-sm"
              value={formData.propertyAddress}
              onChange={e => setFormData({...formData, propertyAddress: e.target.value})}
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full py-3 text-base shadow-lg shadow-leaf-200"
              isLoading={isSubmitting}
            >
              Continue to {actionName}
            </Button>
            <p className="text-[10px] text-center text-gray-400">
              By continuing, you agree to receive a consultation about your landscaping project. We respect your privacy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
