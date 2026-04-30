import React from 'react';
import { X, Tag, HandCoins, Banknote, Landmark } from 'lucide-react';

export default function JobDetailsModal({ job, onClose, onApply }) {
  // Early return if no job is selected
  if (!job) return null;

  const isPlantilla = job.category === "Plantilla";
  const isCOS = job.category === "Contract of Service";

  // --- PARSING LOGIC FOR ITEM NUMBERS ---
  let parsedItemNumbers = [];
  if (Array.isArray(job.itemNumber)) {
    parsedItemNumbers = job.itemNumber;
  } else if (typeof job.itemNumber === "string") {
    try {
      const parsed = JSON.parse(job.itemNumber);
      parsedItemNumbers = Array.isArray(parsed) ? parsed : [job.itemNumber];
    } catch (e) {
      parsedItemNumbers = [job.itemNumber];
    }
  }

  // --- PARSING LOGIC FOR PLACES OF ASSIGNMENT ---
  let parsedAssignments = [];
  if (Array.isArray(job.placeOfAssignment)) {
    parsedAssignments = job.placeOfAssignment;
  } else if (typeof job.placeOfAssignment === "string") {
    try {
      const parsed = JSON.parse(job.placeOfAssignment);
      parsedAssignments = Array.isArray(parsed) ? parsed : [job.placeOfAssignment];
    } catch (e) {
      parsedAssignments = [job.placeOfAssignment];
    }
  }

  const hasCompetencies = job.coreComp || job.leadershipComp || job.functionalComp;

  return (
    <div className="fixed inset-0 bg-[#0A1F5C]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* max-w-2xl keeps the modal width permanently locked on large screens */}
      <div className="bg-white rounded-lg w-full max-w-2xl min-h-[500px] max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden border-t-[6px] border-[#FFD000]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-[#CC1B1B] w-8 h-8 flex items-center justify-center rounded-full transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="px-6 md:px-10 pt-8 pb-5 shrink-0 bg-gray-50 border-b border-gray-200">
          {/* Responsive Header Text: 2xl on mobile, 3xl on md+ screens */}
          <h2 
            className="text-[#0A1F5C] text-2xl md:text-3xl font-black uppercase leading-tight tracking-tight mb-3"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {job.title}{" "}
            <span className="text-[#CC1B1B] font-bold text-sm md:text-base tracking-[1px] md:tracking-[2px] uppercase mb-1 gap-2 items-center block sm:inline">
              {job.category || "Job Opportunity"}
              {job.active === false && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded ml-2 text-xs">INACTIVE</span>}
            </span>
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {/* Responsive Badges */}
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-2 py-1 md:px-2 md:py-1 rounded shadow-sm">
              <Banknote size={12} className="text-[#CC1B1B]" /> SG {job.salaryGrade} 
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-2 py-1 md:px-2 md:py-1 rounded shadow-sm">
              <HandCoins size={12} className="text-[#CC1B1B]" />₱{job.monthlySalary} Monthly
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-6 md:px-10 py-5 md:py-6 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Section 1: Position Description & Item/Assignment Pairs */}
          <div className="mb-6">
              <div className="flex flex-col gap-2 mb-4">
                {parsedItemNumbers.map((item, idx) => {
                  if (!item || typeof item !== 'string' || item.trim() === "") return null;
                  
                  const assignment = parsedAssignments[idx] || parsedAssignments[0] || "Caraga Regional Office";

                  return (
                    <div key={`item-${idx}`} className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 text-[9px] md:text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded shadow-sm">
                        <Tag size={12} className="text-[#CC1B1B]" /> Item: {item}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 text-[9px] md:text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded shadow-sm">
                        <Landmark size={12} className="text-[#CC1B1B]" /> {assignment}
                      </span>
                    </div>
                  );
                })}
              </div> 

            <div>
              {isPlantilla ? (
                <div className="bg-[#EEF2FF] p-3 md:p-4 rounded-lg border border-[#0A1F5C]/10">
                  <h4 className="text-[#0A1F5C] font-bold text-xs md:text-sm uppercase tracking-wider mb-2"> Minimum Requirements</h4>
                  {/* Text scales from text-xs (sm) to text-sm (md) */}
                  <ul className="grid md:grid-cols-2 gap-y-2 gap-x-4 text-xs md:text-sm text-gray-700">
                    <li><strong className="text-[#0A1F5C]">Education:</strong> {job.education || "N/A"}</li>
                    <li><strong className="text-[#0A1F5C]">Experience:</strong> {job.experience || "N/A"}</li>
                    <li><strong className="text-[#0A1F5C]">Training:</strong> {job.trainingRequirements || "N/A"}</li>
                    <li><strong className="text-[#0A1F5C]">Eligibility:</strong> {job.eligibility || "N/A"}</li>
                  </ul>
                </div>
              ) : isCOS ? (
                <div className="bg-[#FFF8D6] p-3 md:p-4 rounded-lg border border-[#FFD000]/30">
                  <h4 className="text-[#0A1F5C] font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2">Contract of Service Details</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-xs md:text-sm text-gray-700">
                    <li><strong className="text-[#0A1F5C]">Salary:</strong> {job.salary || "N/A"}</li>
                    <li><strong className="text-[#0A1F5C]">Duration:</strong> {job.duration || "N/A"}</li>
                    <li className="md:col-span-2"><strong className="text-[#0A1F5C]">Project:</strong> {job.project || "N/A"}</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <h3 className="text-[#0A1F5C] font-black text-xs md:text-sm tracking-[1px] md:tracking-[2px] uppercase border-b-2 border-[#FFD000] pb-1.5 mb-3">
             STATEMENT OF DUTIES AND RESPONSIBILITIES
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line mb-4">
            {job.about || "No description provided for this role."}
          </p>

          {/* Only show the entire section if at least one competency exists */}
          {hasCompetencies && (
            <div>  
              <h3 className="text-[#0A1F5C] font-black text-xs md:text-sm tracking-[1px] md:tracking-[2px] uppercase border-b-2 border-[#FFD000] pb-1.5 mb-3">
                Competency Requirements
              </h3>
              <div className="mx-0 md:mx-2">
                
                {job.coreComp && (
                  <div className="mb-4">
                    <h3 className="text-[#0A1F5C] font-black text-[10px] md:text-[11px] tracking-[1px] md:tracking-[2px] uppercase mb-1">
                      Core Competencies
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                      {job.coreComp}
                    </p>
                  </div>
                )}

                {job.leadershipComp && (
                  <div className="mb-4">
                    <h3 className="text-[#0A1F5C] font-black text-[10px] md:text-[11px] tracking-[1px] md:tracking-[2px] uppercase mb-1">
                      Leadership Competencies
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                      {job.leadershipComp}
                    </p>
                  </div>
                )}

                {job.functionalComp && (
                  <div className="mb-4">
                    <h3 className="text-[#0A1F5C] font-black text-[10px] md:text-[11px] tracking-[1px] md:tracking-[2px] uppercase mb-1">
                      Functional Competencies
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                      {job.functionalComp}
                    </p>
                  </div>
                )}
                
              </div>
            </div> 
          )}    

          <h3 className="text-[#0A1F5C] font-black text-xs md:text-sm tracking-[1px] md:tracking-[2px] uppercase border-b-2 border-[#FFD000] pb-1.5 mb-3">
            Document Requirements
          </h3>
          <p className="text-gray-600 text-xs md:text-sm leading-relaxed whitespace-pre-line mb-4">
            {job.docsReq || "No description provided for this role."}
          </p>
        </div>

        {/* Fixed Footer */}
        <div className="p-3 md:p-5 border-t border-gray-200 flex justify-center bg-gray-50 shrink-0">
          <button 
            onClick={onApply}
            disabled={job.active === false}
            className={`font-black text-sm md:text-base tracking-[1px] md:tracking-[2px] uppercase px-6 md:px-10 py-2.5 md:py-3 rounded shadow-md transition-all w-full max-w-sm flex items-center justify-center gap-2 ${job.active === false ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#CC1B1B] text-white hover:bg-[#0A1F5C] hover:-translate-y-0.5"}`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {job.active === false ? "Position Closed" : "Apply For This Role"}
          </button>
        </div>

      </div>
    </div>
  );
}