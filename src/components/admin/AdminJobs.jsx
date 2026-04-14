import React, { useState, forwardRef } from "react";
import {
  Plus,
  Search,
  MapPin,
  Edit3,
  Trash2,
  AlertTriangle,
  Save,
  X,
  Table,
} from "lucide-react";
import { labelCls, inputCls } from "../../utils/constants";

// CALENDAR IMPORTS
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

function JobFormModal({ job, onSave, onClose }) {
  // 1. Add this helper function to safely parse stringified arrays
  const parseArrayField = (data) => {
    if (Array.isArray(data)) return [...data];
    if (typeof data === "string") {
      try {
        // Attempt to parse stringified arrays like '["2345","567"]'
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // If it fails to parse, treat it as a single standard string
      }
      return data ? [data] : [""];
    }
    return [""];
  };

  // 2. Update your state initialization to use the helper
  const [form, setForm] = useState({
    ...job,
    responsibilities: [...(job.responsibilities || [""])],
    requirements: [...(job.requirements || [""])],
    itemNumber: parseArrayField(job.itemNumber),
    placeOfAssignment: parseArrayField(job.placeOfAssignment),
  });

  // --- COMPETENCY TOGGLE STATE ---
  const [selectedComps, setSelectedComps] = useState({
    core: !!job.coreComp,
    leadership: !!job.leadershipComp,
    functional: !!job.functionalComp,
  });

  const handleCompToggle = (compType, compKey) => {
    setSelectedComps((prev) => {
      const isChecked = !prev[compType];
      // If unchecked, optionally clear the data from the form so it doesn't save hidden data
      if (!isChecked) {
        setForm((f) => ({ ...f, [compKey]: "" }));
      }
      return { ...prev, [compType]: isChecked };
    });
  };

  const isNew = !job.id;
  const isPlantilla = form.category === "Plantilla";
  const isCOS = form.category === "Contract of Service";


  // --- CALENDAR LOGIC ---
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const handleDateChange = (update) => {
    setDateRange(update);
    const [start, end] = update;

    if (start && end) {
      const formattedStart = format(start, "MMMM d");
      const formattedEnd = format(end, "MMMM d");
      setForm((f) => ({
        ...f,
        dateOfPublication: `${formattedStart} - ${formattedEnd}`,
      }));
    } else if (!start && !end) {
      setForm((f) => ({ ...f, dateOfPublication: "" }));
    }
  };

  const CustomDateInput = forwardRef(({ onClick, placeholder }, ref) => (
    <input
      className={inputCls}
      onClick={onClick}
      ref={ref}
      value={form.dateOfPublication || ""}
      placeholder={placeholder}
      readOnly
    />
  ));
  // ----------------------

  return (
    <div
      className="fixed inset-0 z-[300] bg-[#0A1F5C]/80 backdrop-blur-sm flex items-center justify-center p-5 "
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border-t-[6px] border-[#FFD000]"
        style={{ boxShadow: "0 40px 80px rgba(10,31,92,0.3)" }}
      >
        <div className="sticky top-0 bg-[#0A1F5C] px-8 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2
              className="font-black text-[24px] text-[#FFD000] uppercase"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              {isNew ? "Add New Job" : "Edit Job"}
            </h2>
            {form.category && (
              <span className="bg-[#FFD000] text-[#0A1F5C] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                {form.category} Form
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-[#CC1B1B] text-white rounded-full flex items-center justify-center cursor-pointer border-0 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-8 space-y-8 ">
          {/* ALWAYS VISIBLE: Common Fields & Category Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6 border-b-2 border-gray-100">
            <div className="md:col-span-2">
              <label className={labelCls}>
                Title of Vacant Position{" "}
                <span className="text-[#CC1B1B]">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. LGOO IV / Information Officer II"
                value={form.title || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>
                Location <span className="text-[#CC1B1B]">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Butuan City"
                value={form.location || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>
                Job Category <span className="text-[#CC1B1B]">*</span>
              </label>
              <select
                className={inputCls}
                value={form.category || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                <option value="" disabled>
                  Select Job Category
                </option>
                <option value="Plantilla">Plantilla</option>
                <option value="Contract of Service">Contract of Service</option>
              </select>
            </div>
          </div>

          {!isPlantilla && !isCOS && (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm text-center border border-blue-100 font-medium">
              Please select a Job Category above to view specific details.
            </div>
          )}

          {/* PLANTILLA DETAILS */}
          {isPlantilla && (
            <div className="space-y-5 ">
              <h3 className="text-[14px] font-bold text-[#0A1F5C] uppercase tracking-[2px]">
                Plantilla Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="md:col-span-3 mb-2">
                  <label className={labelCls}>No. of Person Needed</label>
                  <input
                    type="number"
                    min="1"
                    className={`${inputCls} max-w-[200px]`}
                    placeholder="e.g. 5"
                    value={form.noOfPersonNeeded || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        noOfPersonNeeded: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* DYNAMIC PAIR: Item Number + Place of Assignment */}
                {Array.from({
                  length: Math.max(1, parseInt(form.noOfPersonNeeded) || 1),
                }).map((_, idx) => (
                  <div key={`plantilla-item-${idx}`} className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <label className={labelCls}>
                        Item Number{" "}
                        {parseInt(form.noOfPersonNeeded) > 1 ? idx + 1 : ""}
                      </label>
                      <input
                        className={inputCls}
                        placeholder="e.g. OSEC-DICTB-INFO1-12-2023"
                        value={form.itemNumber?.[idx] || ""}
                        onChange={(e) => {
                          const newItems = [...(form.itemNumber || [])];
                          newItems[idx] = e.target.value;
                          setForm((f) => ({ ...f, itemNumber: newItems }));
                        }}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Place Of Assignment{" "}
                        {parseInt(form.noOfPersonNeeded) > 1 ? idx + 1 : ""}
                      </label>
                      <input
                        className={inputCls}
                        placeholder="e.g. Bayugan City"
                        value={form.placeOfAssignment?.[idx] || ""}
                        onChange={(e) => {
                          const newPlaces = [...(form.placeOfAssignment || [])];
                          newPlaces[idx] = e.target.value;
                          setForm((f) => ({ ...f, placeOfAssignment: newPlaces }));
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <label className={labelCls}>Salary Grade</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. SG-19"
                    value={form.salaryGrade || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salaryGrade: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Monthly Salary</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. 50,000"
                    value={form.monthlySalary || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, monthlySalary: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelCls}>Date of Publication</label>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateChange}
                    monthsShown={2}
                    customInput={<CustomDateInput />}
                    placeholderText="e.g. March 25 - March 30"
                  />
                </div>
              </div>

              <h3 className="text-[14px] font-bold text-[#0A1F5C] uppercase tracking-[2px] pt-4">
                Qualification standard
              </h3>
              <div>
                <label className={labelCls}>Education</label>
                <textarea
                  className={inputCls}
                  placeholder="e.g. Bachelor's Degree"
                  value={form.education || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, education: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Experience</label>
                <textarea
                  className={inputCls}
                  placeholder="e.g. 5 years"
                  value={form.experience || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, experience: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Training Requirements</label>
                <textarea
                  className={inputCls}
                  placeholder="e.g. 4 hours"
                  value={form.trainingRequirements || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      trainingRequirements: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Eligibility</label>
                <textarea
                  className={inputCls}
                  placeholder="e.g. CS Professional"
                  value={form.eligibility || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, eligibility: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className={labelCls}>
                 STATEMENT OF DUTIES AND RESPONSIBILITIES <span className="text-[#CC1B1B]">*</span>
                </label>
                <textarea
                  className={`${inputCls} h-24 resize-none`}
                  placeholder="Describe the role..."
                  value={form.about || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, about: e.target.value }))
                  }
                />
              </div>

              <div>
                <h3 className="text-[14px] font-bold text-[#0A1F5C] uppercase tracking-[2px] mb-3">
                  Competency Requirements
                </h3>
                
                {/* Checkbox Selectors */}
                <div className="flex flex-wrap gap-4 mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#0A1F5C] cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 cursor-pointer accent-[#0A1F5C]"
                      checked={selectedComps.core}
                      onChange={() => handleCompToggle('core', 'coreComp')}
                    />
                    Core
                  </label>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#0A1F5C] cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 cursor-pointer accent-[#0A1F5C]"
                      checked={selectedComps.leadership}
                      onChange={() => handleCompToggle('leadership', 'leadershipComp')}
                    />
                    Leadership
                  </label>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#0A1F5C] cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 cursor-pointer accent-[#0A1F5C]"
                      checked={selectedComps.functional}
                      onChange={() => handleCompToggle('functional', 'functionalComp')}
                    />
                    Functional
                  </label>
                </div>

                {/* Conditional Textareas */}
                <div className="space-y-4">
                  {selectedComps.core && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelCls}>
                        Core Competencies <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="Describe the core competencies..."
                        value={form.coreComp || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, coreComp: e.target.value }))
                        }
                      />
                    </div>
                  )}
                  {selectedComps.leadership && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelCls}>
                        Leadership Competencies <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="Describe the leadership competencies..."
                        value={form.leadershipComp || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, leadershipComp: e.target.value }))
                        }
                      />
                    </div>
                  )}
                  {selectedComps.functional && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelCls}>
                        Functional Competencies <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="Describe the functional competencies..."
                        value={form.functionalComp || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, functionalComp: e.target.value }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Document Requirements{" "}
                  <span className="text-[#CC1B1B]">*</span>
                </label>
                <textarea
                  className={`${inputCls} h-24 resize-none`}
                  placeholder="List the required documents..."
                  value={form.docsReq || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, docsReq: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {/* C.O.S. SPECIFIC FORM */}
          {isCOS && (
            <div className="space-y-5 ">
              <h3 className="text-[14px] font-bold text-[#0A1F5C] uppercase tracking-[2px]">
                Contract of Service Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className={labelCls}>Date of Publication</label>
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={handleDateChange}
                      monthsShown={2}
                      customInput={<CustomDateInput />}
                      placeholderText="e.g. March 25 - March 30"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>No. of Person Needed</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. 5"
                      type="number"
                      min="1"
                      value={form.noOfPersonNeeded || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          noOfPersonNeeded: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* DYNAMIC C.O.S. ASSIGNMENTS */}
                {Array.from({
                  length: Math.max(1, parseInt(form.noOfPersonNeeded) || 1),
                }).map((_, idx) => (
                  <div key={`cos-assign-${idx}`} className="md:col-span-3">
                    <label className={labelCls}>
                      Place Of Assignment {parseInt(form.noOfPersonNeeded) > 1 ? idx + 1 : ""}
                    </label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Bayugan City"
                      value={form.placeOfAssignment?.[idx] || ""}
                      onChange={(e) => {
                        const newPlaces = [...(form.placeOfAssignment || [])];
                        newPlaces[idx] = e.target.value;
                        setForm((f) => ({ ...f, placeOfAssignment: newPlaces }));
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label className={labelCls}>Salary Grade</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. SG-19"
                    value={form.salaryGrade || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salaryGrade: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Monthly Salary</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. 50,000"
                    value={form.monthlySalary || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, monthlySalary: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Education</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Bachelor's Degree"
                    value={form.education || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, education: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Training Requirements</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. 4 hours"
                    value={form.trainingRequirements || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        trainingRequirements: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Experience</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. 5 years"
                    value={form.experience || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, experience: e.target.value }))
                    }
                  />
                </div>
              </div>
              
              <div>
                <label className={labelCls}>
                  STATEMENT OF DUTIES AND RESPONSIBILITIES <span className="text-[#CC1B1B]">*</span>
                </label>
                <textarea
                  className={`${inputCls} h-24 resize-none`}
                  placeholder="Describe the role..."
                  value={form.about || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, about: e.target.value }))
                  }
                />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#0A1F5C] uppercase tracking-[2px] mb-3">
                  Competency Requirements
                </h3>
                
                {/* Checkbox Selectors */}
                <div className="flex flex-wrap gap-4 mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#0A1F5C] cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 cursor-pointer accent-[#0A1F5C]"
                      checked={selectedComps.core}
                      onChange={() => handleCompToggle('core', 'coreComp')}
                    />
                    Core
                  </label>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#0A1F5C] cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 cursor-pointer accent-[#0A1F5C]"
                      checked={selectedComps.leadership}
                      onChange={() => handleCompToggle('leadership', 'leadershipComp')}
                    />
                    Leadership
                  </label>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#0A1F5C] cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 cursor-pointer accent-[#0A1F5C]"
                      checked={selectedComps.functional}
                      onChange={() => handleCompToggle('functional', 'functionalComp')}
                    />
                    Functional
                  </label>
                </div>

                {/* Conditional Textareas */}
                <div className="space-y-4">
                  {selectedComps.core && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelCls}>
                        Core Competencies <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="Describe the core competencies..."
                        value={form.coreComp || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, coreComp: e.target.value }))
                        }
                      />
                    </div>
                  )}
                  {selectedComps.leadership && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelCls}>
                        Leadership Competencies <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="Describe the leadership competencies..."
                        value={form.leadershipComp || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, leadershipComp: e.target.value }))
                        }
                      />
                    </div>
                  )}
                  {selectedComps.functional && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelCls}>
                        Functional Competencies <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="Describe the functional competencies..."
                        value={form.functionalComp || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, functionalComp: e.target.value }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Document Requirements{" "}
                  <span className="text-[#CC1B1B]">*</span>
                </label>
                <textarea
                  className={`${inputCls} h-24 resize-none`}
                  placeholder="Describe document requirements..."
                  value={form.docsReq || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, docsReq: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-6 border-t-2 border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-600 font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0A1F5C] text-[#FFD000] font-black text-[16px] uppercase py-3 rounded-lg cursor-pointer hover:bg-[#CC1B1B] hover:text-white transition-all"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              <Save size={16} />
              {isNew ? "Post Job" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobs({ jobs, onUpdateJobs }) {
  const [editingJob, setEditingJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isTableView, setIsTableView] = useState(false);

  // --- Ensure placeOfAssignment defaults to array here too ---
  const emptyJob = {
    title: "",
    location: "",
    category: "",
    responsibilities: [""],
    requirements: [""],
    itemNumber: [""],
    placeOfAssignment: [""],
  };

  const filtered = jobs.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      categoryFilter === "All" || j.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  const handleSave = (job) => {
    onUpdateJobs("save", job);
    setShowForm(false);
    setEditingJob(null);
  };

  const handleDelete = (id) => {
    onUpdateJobs("delete", id);
    setDeleteConfirm(null);
  };

  const handleToggle = (job) => {
    onUpdateJobs("toggle", { id: job.id, active: !job.active });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1F5C] px-8 py-8 border-b-4 border-[#FFD000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#FFD000]/60 text-[12px] font-bold tracking-[3px] uppercase mb-1">
              Admin
            </p>
            <h1
              className="font-black text-[38px] text-white uppercase leading-none"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              Manage Job Postings
            </h1>
            <p className="text-white/40 text-[13px] mt-1">
              {jobs.filter((j) => j.active !== false).length} active ·{" "}
              {jobs.filter((j) => j.active === false).length} inactive
            </p>
          </div>
          <button
            onClick={() => {
              setEditingJob(emptyJob);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-[#FFD000] text-[#0A1F5C] font-black text-[15px] tracking-[2px] uppercase px-6 py-3 rounded-lg hover:bg-white transition-all cursor-pointer"
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            <Plus size={18} />
            Add New Job
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 mb-8 flex flex-wrap gap-4 items-end shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
              Search Roles
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by job title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 px-4 py-2.5 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
              Category
            </label>
            <select
              className="px-4 py-2.5 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000] cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Plantilla">Plantilla</option>
              <option value="Contract of Service">Contract of Service</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-transparent mb-1.5 cursor-default select-none">
              View
            </label>
            <button
              onClick={() => setIsTableView(!isTableView)}
              className={`px-5 py-2.5 border-2 rounded font-bold text-[13px] tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${isTableView ? "bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]" : "bg-white text-[#0A1F5C] border-gray-200 hover:border-[#FFD000]"}`}
            >
              <Table size={16} />
              {isTableView ? "Board View" : "Table View"}
            </button>
          </div>

          <div className="text-[13px] font-semibold text-gray-400 self-center pt-5">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {isTableView ? (
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#0A1F5C] text-[#FFD000]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider sticky left-0 bg-[#0A1F5C] z-10 border-b border-[#FFD000]/20">
                    Actions
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Location
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Item No.{" "}
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Monthly Salary
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    SG
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Date Of Publication
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Education
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Experience
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Training
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#FFD000]/20">
                    Eligibility
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] text-gray-700">
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-gray-50 border-r border-gray-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingJob({
                            ...job,
                            responsibilities: [...(job.responsibilities || [])],
                            requirements: [...(job.requirements || [])],
                          });
                          setShowForm(true);
                        }}
                        className="p-1.5 bg-[#EEF2FF] text-[#6366F1] rounded hover:bg-[#6366F1] hover:text-white transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(job.id)}
                        className="p-1.5 bg-red-50 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(job)}
                        className={`px-3 py-1.5 rounded text-[11px] font-bold tracking-wider uppercase cursor-pointer border-2 transition-all ${
                          job.active === false
                            ? "border-green-300 text-green-600 bg-green-50 hover:bg-green-100"
                            : "border-gray-200 text-gray-500 bg-white hover:bg-gray-100"
                        }`}
                      >
                        {job.active === false ? "Activate" : "Deactivate"}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#0A1F5C]">
                      {job.title}
                    </td>
                    <td className="px-4 py-3">
                      {job.category ? (
                        <span className="bg-[#EEF2FF] px-2 py-1 rounded text-[11px] font-bold tracking-wider uppercase text-[#0A1F5C] border border-[#0A1F5C]/10">
                          {job.category}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{job.location}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {Array.isArray(job.itemNumber)
                        ? job.itemNumber.join(", ")
                        : job.itemNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {job.monthlySalary || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {job.salaryGrade || job.salaryGrade || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {job.dateOfPublication || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-500 truncate max-w-[200px]"
                      title={job.education}
                    >
                      {job.education || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-500 truncate max-w-[150px]"
                      title={job.experience}
                    >
                      {job.experience || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-500 truncate max-w-[150px]"
                      title={job.trainingRequirements}
                    >
                      {job.trainingRequirements || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {job.eligibility || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400 font-semibold">
                No jobs found matching your filter.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => {
              return (
                <div
                  key={job.id}
                  className={`bg-white border-2 rounded-xl px-6 py-5 flex items-center gap-4 flex-wrap transition-all ${job.active === false ? "border-gray-200 opacity-60" : "border-gray-200 hover:border-[#FFD000]"}`}
                  onMouseEnter={(e) =>
                    job.active !== false &&
                    (e.currentTarget.style.boxShadow = "4px 4px 0 #FFD000")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-gray-400 text-[12px] flex items-center gap-1">
                        <MapPin size={11} />
                        {job.location}
                      </span>
                      {job.category && (
                        <span className="text-gray-400 text-[12px] flex items-center gap-1 font-bold">
                          • {job.category}
                        </span>
                      )}
                      {job.active === false && (
                        <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-extrabold text-[20px] text-[#0A1F5C] uppercase"
                      style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                    >
                      {job.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(job)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase cursor-pointer border-2 transition-all ${job.active === false ? "border-green-300 text-green-600 hover:bg-green-50" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                    >
                      {job.active === false ? "Activate" : "Deactivate"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingJob({
                          ...job,
                          responsibilities: [...(job.responsibilities || [])],
                          requirements: [...(job.requirements || [])],
                        });
                        setShowForm(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] text-[#6366F1] rounded-lg text-[11px] font-bold tracking-wider uppercase cursor-pointer hover:bg-[#6366F1] hover:text-white transition-all border-2 border-[#6366F1]/20"
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(job.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[11px] font-bold tracking-wider uppercase cursor-pointer hover:bg-red-500 hover:text-white transition-all border-2 border-red-200"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400 font-semibold bg-white border-2 border-gray-200 rounded-xl">
                No jobs found matching your filter.
              </div>
            )}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border-t-4 border-red-500">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3
              className="font-black text-[22px] text-[#0A1F5C] uppercase mb-2"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              Delete Job?
            </h3>
            <p className="text-gray-500 text-[14px] mb-6">
              This action cannot be undone. The job posting will be permanently
              removed.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2.5 bg-red-500 text-white font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && editingJob && (
        <JobFormModal
          job={editingJob}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}