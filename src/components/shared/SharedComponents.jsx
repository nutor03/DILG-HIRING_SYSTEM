import React from "react";
import { Pencil } from "lucide-react";

export const FormCard = ({ title, children }) => (
  <div className="bg-white border-2 border-gray-100 rounded-lg p-6 mb-5">
    <div className="flex items-center gap-2 text-[13px] font-extrabold tracking-widest uppercase text-[#0A1F5C] border-b-2 border-[#FFD000] pb-2.5 mb-5">
      <span className="block w-1 h-4 bg-[#CC1B1B] rounded-sm flex-shrink-0" />
      {title}
    </div>
    {children}
  </div>
);

export const ReviewSection = ({ icon: Icon, title, onEdit, children }) => (
  <div className="bg-white border-2 border-gray-100 rounded-lg overflow-hidden mb-4">
    <div className="flex justify-between items-center px-6 py-4 bg-[#0A1F5C]">
      <h4 className="text-[14px] font-extrabold tracking-widest uppercase text-[#FFD000] flex items-center gap-2">
        <Icon size={16} />
        {title}
      </h4>
      <button
        onClick={onEdit}
        className="border border-[#FFD000] text-[#FFD000] px-3 py-1 rounded-sm text-[11px] font-bold tracking-wider uppercase hover:bg-[#FFD000] hover:text-[#0A1F5C] transition-colors cursor-pointer flex items-center gap-1"
      >
        <Pencil size={10} />
        Edit
      </button>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);