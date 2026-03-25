import React from 'react';
import { CheckCircle, ClipboardList, X } from 'lucide-react';

export default function SuccessModal({ onClose, onGoToDashboard }) {
  return (
    <div className="fixed inset-0 bg-[#0A1F5C]/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl relative border-t-[8px] border-[#CC1B1B]">
        
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>

        <h2 
          className="text-[#0A1F5C] text-3xl font-black uppercase tracking-tight leading-none mb-3"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Application Submitted!
        </h2>
        
        <p className="text-gray-500 text-sm mb-8 px-2">
          Your application has been successfully sent to the DILG-CARAGA HR department. You can track your status on your dashboard.
        </p>

        <div className="space-y-3">
          <button 
            onClick={onGoToDashboard}
            className="w-full bg-[#0A1F5C] text-[#FFD000] font-black text-[15px] tracking-[2px] uppercase py-3.5 rounded shadow-md hover:bg-[#CC1B1B] hover:text-white transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <ClipboardList size={18} />
            Go to My Applications
          </button>
          
          <button 
            onClick={onClose}
            className="w-full bg-white border-2 border-gray-200 text-gray-500 font-bold text-[13px] tracking-wider uppercase py-3 rounded hover:bg-gray-50 hover:text-[#0A1F5C] hover:border-[#0A1F5C] transition-colors"
          >
            Back to Job Board
          </button>
        </div>

      </div>
    </div>
  );
}