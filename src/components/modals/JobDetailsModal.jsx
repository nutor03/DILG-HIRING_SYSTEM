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

  // Add this right before the `return (` statement
  const hasCompetencies = job.coreComp || job.leadershipComp || job.functionalComp;

  return (
    <div className={`fixed inset-0 bg-[#0A1F5C]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm`}>
      <div className="bg-white rounded-lg w-full max-w-4xl min-h-[500px] max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden border-t-[6px] border-[#FFD000]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-[#CC1B1B] w-8 h-8 flex items-center justify-center rounded-full transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="px-10 pt-10 pb-6 shrink-0 bg-gray-50 border-b border-gray-200">
          <h2 
            className="text-[#0A1F5C] text-[40px] font-black uppercase leading-tight tracking-tight mb-4"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {job.title} <span className="text-[#CC1B1B] font-bold text-[19px] tracking-[3px] uppercase mb-1 gap-2 items-center">
            {job.category || "Job Opportunity"}
            {job.active === false && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded ml-2">INACTIVE</span>}
          </span>
          </h2>
          
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[12px] font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow-sm">
              <Banknote size={14} className="text-[#CC1B1B]" /> SG {job.salaryGrade} 
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[12px] font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow-sm">
              <HandCoins size={14} className="text-[#CC1B1B]" />₱{job.monthlySalary} Monthly Salary
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-10 py-8 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Section 1: Position Description & Item/Assignment Pairs */}
          <div className="mb-8">
              <div className="flex flex-col gap-3 mb-6">
                {parsedItemNumbers.map((item, idx) => {
                  if (!item || typeof item !== 'string' || item.trim() === "") return null;
                  
                  // Match the assignment to the item index. 
                  // If there's only 1 assignment but 2 items, it defaults to the first assignment.
                  const assignment = parsedAssignments[idx] || parsedAssignments[0] || "Caraga Regional Office";

                  return (
                    <div key={`item-${idx}`} className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[12px] font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow-sm">
                        <Tag size={14} className="text-[#CC1B1B]" /> Item No. {item}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[12px] font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow-sm">
                        <Landmark size={14} className="text-[#CC1B1B]" /> Assignment: {assignment}
                      </span>
                    </div>
                  );
                })}
              </div> 

            <div>
              {isPlantilla ? (
                <div className="bg-[#EEF2FF] p-5 rounded-lg border border-[#0A1F5C]/10">
                  <h4 className="text-[#0A1F5C] font-bold text-[15px] uppercase tracking-wider mb-3 "> Minimum Requirements</h4>
                  <ul className="grid md:grid-cols-2 gap-y-3 gap-x-6 text-[16px] text-gray-700">
                    <li><strong className="text-[#0A1F5C]">Education:</strong> {job.education || "N/A"}</li>
                    <li><strong className="text-[#0A1F5C]">Experience:</strong> {job.experience || "N/A"}</li>
                    <li><strong className="text-[#0A1F5C]">Training:</strong> {job.trainingRequirements || "N/A"}</li>
                    <li><strong className="text-[#0A1F5C]">Eligibility:</strong> {job.eligibility || "N/A"}</li>
                  </ul>
                </div>
              ) : isCOS ? (
                <div className="bg-[#FFF8D6] p-5 rounded-lg border border-[#FFD000]/30">
                  <h4 className="text-[#0A1F5C] font-bold text-[12px] uppercase tracking-wider mb-3">Contract of Service Details</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-700">
                    <li><strong className="text-[#0A1F5C]">Salary:</strong> {job.salary || "N/A"}</li>
                    <li><strong className="text-[#0A1F5C]">Duration:</strong> {job.duration || "N/A"}</li>
                    <li className="md:col-span-2"><strong className="text-[#0A1F5C]">Project/Program:</strong> {job.project || "N/A"}</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <h3 className="text-[#0A1F5C] font-black text-[15px] tracking-[2px] uppercase border-b-2 border-[#FFD000] pb-2 mb-4">
             STATEMENT OF DUTIES AND RESPONSIBILITIES
          </h3>
          <p className="text-gray-600 text-[18px] leading-relaxed whitespace-pre-line mb-5">
            {job.about || "No description provided for this role."}
          </p>

          {/* Only show the entire section if at least one competency exists */}
          {hasCompetencies && (
            <div>  
              <h3 className="text-[#0A1F5C] font-black text-[15px] tracking-[2px] uppercase border-b-2 border-[#FFD000] pb-2 mb-4">
                Competency Requirements
              </h3>
              <div className="mx-2">
                
                {/* Conditionally render Core */}
                {job.coreComp && (
                  <div className="mb-5">
                    <h3 className="text-[#0A1F5C] font-black text-[12px] tracking-[2px] uppercase mb-1">
                      Core Competencies
                    </h3>
                    <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                      {job.coreComp}
                    </p>
                  </div>
                )}

                {/* Conditionally render Leadership */}
                {job.leadershipComp && (
                  <div className="mb-5">
                    <h3 className="text-[#0A1F5C] font-black text-[12px] tracking-[2px] uppercase mb-1">
                      Leadership Competencies
                    </h3>
                    <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                      {job.leadershipComp}
                    </p>
                  </div>
                )}

                {/* Conditionally render Functional */}
                {job.functionalComp && (
                  <div className="mb-5">
                    <h3 className="text-[#0A1F5C] font-black text-[12px] tracking-[2px] uppercase mb-1">
                      Functional Competencies
                    </h3>
                    <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                      {job.functionalComp}
                    </p>
                  </div>
                )}
                
              </div>
            </div> 
          )}    

          <h3 className="text-[#0A1F5C] font-black text-[15px] tracking-[2px] uppercase border-b-2 border-[#FFD000] pb-2 mb-4">
            Document Requirements
          </h3>
          <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line mb-5">
            {job.docsReq || "No description provided for this role."}
          </p>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-center bg-gray-50 shrink-0">
          <button 
            onClick={onApply}
            disabled={job.active === false}
            className={`font-black text-lg tracking-[2px] uppercase px-12 py-4 rounded shadow-md transition-all w-full max-w-sm flex items-center justify-center gap-2 ${job.active === false ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#CC1B1B] text-white hover:bg-[#0A1F5C] hover:-translate-y-0.5"}`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {job.active === false ? "Position Closed" : "Apply For This Role"}
          </button>
        </div>

      </div>
    </div>
  );
}