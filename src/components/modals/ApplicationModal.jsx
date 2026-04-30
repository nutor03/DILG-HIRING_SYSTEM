import React, { useState } from "react";
import {
  User,
  GraduationCap,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Loader2,
  CheckCircle,
  Eye,
  Edit3,
} from "lucide-react";

export default function ApplicationModal({
  job,
  currentUser,
  onClose,
  onSubmit,
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); 

  const validateStep = (currentStep) => {
    let newErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.contact.trim()) newErrors.contact = "Contact is required";
      if (!formData.address.trim()) newErrors.address = "Complete Address is required";
      if (!formData.age) newErrors.age = "Age is required";
      if (!formData.sex) newErrors.sex = "Sex is required";
      if (!formData.status) newErrors.status = "Civil Status is required";
    } 
    
    if (currentStep === 3) {
   
      if (!workData.workExpFile) newErrors.file = "Please upload the required document";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; 
  };

  // Form States
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: currentUser?.firstName || "",
    mi: "",
    address: "",
    status: "",
    age: "",
    sex: "",
    contact: "",
    email: currentUser?.email || "",
  });

  const [eduData, setEduData] = useState({
    school: "",
    course: "",
    year: "",
    honors: "",
    eligibility: "",
    gradSchool: "",
    gradYear: "",
    unitearn: "",
  });

  // Replace your current workData state with this:
  const [workData, setWorkData] = useState({
    experiences: [
      { work_employer_name: "", work_position: "", work_dates: "", work_skills: "" },
    ],
    appLetterFile: null,
    appLetterName: "",
    workExpFile: null,
    workExpFileName: "",
  });

  

  const handleExpChange = (index, field, value) => {
  const updatedExperiences = [...workData.experiences];

  updatedExperiences[index][field] = value;
  setWorkData({ ...workData, experiences: updatedExperiences });
  };

  const addExperience = () => {
    setWorkData({
      ...workData,
      experiences: [
        ...workData.experiences,
        { work_employer_name: "", work_position: "", work_dates: "", work_skills: "" },
      ],
    });
  };

  const removeExperience = (index) => {
    const updatedExperiences = workData.experiences.filter((_, i) => i !== index);
    setWorkData({ ...workData, experiences: updatedExperiences });
  };

  const inputCls =
    "w-full border-2 border-gray-200 rounded px-4 py-2.5 text-sm outline-none focus:border-[#FFD000] text-[#0A1F5C] transition-colors bg-gray-50 focus:bg-white";
  const labelCls =
    "block text-[11px] font-bold text-[#0A1F5C] uppercase tracking-wider mb-1.5";

const handleNext = () => {
    // Only proceed if the current step is valid
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      setErrors({}); // Clear errors when successfully moving to the next step
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setErrors({}); // Clear errors when moving back
  };

  const jumpToStep = (s) => {
    setErrors({}); // Clear errors when jumping between review steps
    setStep(s);
  };

  const handleSubmit = async () => {
    console.log("Submitting application with data:", { formData, eduData, workData });
    setIsSubmitting(true);
    await onSubmit({ formData, eduData, workData });
    setIsSubmitting(false);
  };

  const ReviewRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#0A1F5C] text-right">
        {value || <span className="text-gray-300 italic">None</span>}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#0A1F5C]/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-4xl min-h-[650px] max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden border-t-[6px] border-[#CC1B1B]">
        {/* Header */}
        <div className="px-8 py-6 shrink-0 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-[#CC1B1B] font-bold text-[11px] tracking-[3px] uppercase mb-1">
              Application Form
            </p>
            <h2
              className="text-[#0A1F5C] text-2xl font-black uppercase tracking-tight"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {job.title} ({job.category})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-[#CC1B1B] w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex px-4 md:px-8 py-4 bg-white border-b border-gray-100 shrink-0 overflow-x-auto custom-scrollbar">
          {[
            { num: 1, label: "Personal", icon: User },
            { num: 2, label: "Education", icon: GraduationCap },
            { num: 3, label: "Experience", icon: Briefcase },
            { num: 4, label: "Review", icon: Eye },
          ].map((s, i) => (
            <div
              key={s.num}
              className={`flex-1 min-w-[120px] flex items-center ${i !== 3 ? "border-r border-gray-100" : ""} ${i !== 0 ? "pl-4" : ""}`}
            >
              <div
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm mr-3 transition-colors ${step >= s.num ? "bg-[#0A1F5C] text-[#FFD000]" : "bg-gray-100 text-gray-400"}`}
              >
                <s.icon size={14} />
              </div>
              <div>
                <p
                  className={`text-[10px] font-bold tracking-wider uppercase ${step >= s.num ? "text-[#CC1B1B]" : "text-gray-400"}`}
                >
                  Step {s.num}
                </p>
                <p
                  className={`text-xs font-bold ${step >= s.num ? "text-[#0A1F5C]" : "text-gray-400"}`}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <div className="px-8 py-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* STEP 1: PERSONAL INFO */}
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`${inputCls} ${errors.firstName ? "border-red-500 bg-red-50" : ""}`}
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (errors.firstName) setErrors({ ...errors, firstName: null }); // Clear error on type
                    }}
                    placeholder="Juan"
                  />
                  {errors.firstName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.firstName}</p>}
                </div>
                
                {/* MI is not required, so no error logic needed here */}
                <div>
                  <label className={labelCls}>M.I.</label>
                  <input
                    className={inputCls}
                    value={formData.mi}
                    onChange={(e) => setFormData({ ...formData, mi: e.target.value })}
                    placeholder="D."
                    maxLength={2}
                  />
                </div>
                
                <div>
                  <label className={labelCls}>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`${inputCls} ${errors.lastName ? "border-red-500 bg-red-50" : ""}`}
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (errors.lastName) setErrors({ ...errors, lastName: null });
                    }}
                    placeholder="Dela Cruz"
                  />
                  {errors.lastName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`${inputCls} ${errors.email ? "border-red-500 bg-red-50" : ""}`}
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder={!!currentUser?.email}
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email}</p>}
                </div>
                
                <div>
                  <label className={labelCls}>
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`${inputCls} ${errors.contact ? "border-red-500 bg-red-50" : ""}`}
                    value={formData.contact}
                    onChange={(e) => {
                      setFormData({ ...formData, contact: e.target.value });
                      if (errors.contact) setErrors({ ...errors, contact: null });
                    }}
                    placeholder="09XX XXX XXXX"
                  />
                  {errors.contact && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.contact}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`${inputCls} ${errors.age ? "border-red-500 bg-red-50" : ""}`}
                    type="number"
                    value={formData.age}
                    onChange={(e) => {
                      setFormData({ ...formData, age: e.target.value });
                      if (errors.age) setErrors({ ...errors, age: null }); // Clear error
                    }}
                    placeholder="e.g. 25"
                  />
                  {errors.age && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.age}</p>}
                </div>
                
                <div>
                  <label className={labelCls}>
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`${inputCls} ${errors.sex ? "border-red-500 bg-red-50" : ""}`}
                    value={formData.sex}
                    onChange={(e) => {
                      setFormData({ ...formData, sex: e.target.value });
                      if (errors.sex) setErrors({ ...errors, sex: null }); // Clear error
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.sex}</p>}
                </div>
                
                <div>
                  <label className={labelCls}>
                    Civil Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`${inputCls} ${errors.status ? "border-red-500 bg-red-50" : ""}`}
                    value={formData.status}
                    onChange={(e) => {
                      setFormData({ ...formData, status: e.target.value });
                      if (errors.status) setErrors({ ...errors, status: null }); // Clear error
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.status}</p>}
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Complete Address <span className="text-red-500">*</span>
                </label>
                <input
                  className={`${inputCls} ${errors.address ? "border-red-500 bg-red-50" : ""}`}
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: null });
                  }}
                  placeholder="House/Block No., Street, Barangay, City, Province"
                />
                {errors.address && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.address}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-5 border-2 border-gray-100 rounded-lg bg-gray-50/50">
                <h3 className="text-[#0A1F5C] font-black text-[14px] uppercase tracking-wider mb-4 border-b-2 border-[#FFD000] inline-block pb-1">
                  Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>School / University</label>
                    <input
                      className={inputCls}
                      value={eduData.school}
                      onChange={(e) =>
                        setEduData({ ...eduData, school: e.target.value })
                      }
                      placeholder="e.g. Caraga State University"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Course / Degree</label>
                    <input
                      className={inputCls}
                      value={eduData.course}
                      onChange={(e) =>
                        setEduData({ ...eduData, course: e.target.value })
                      }
                      placeholder="e.g. BS Computer Science"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Year Grad.</label>
                      <input
                        className={inputCls}
                        value={eduData.year}
                        onChange={(e) =>
                          setEduData({ ...eduData, year: e.target.value })
                        }
                        placeholder="YYYY"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Honors</label>
                      <input
                        className={inputCls}
                        value={eduData.honors}
                        onChange={(e) =>
                          setEduData({ ...eduData, honors: e.target.value })
                        }
                        placeholder="Cum Laude"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-2 border-gray-100 rounded-lg bg-gray-50/50">
                <h3 className="text-[#0A1F5C] font-black text-[14px] uppercase tracking-wider mb-4 border-b-2 border-[#FFD000] inline-block pb-1">
                  Eligibility
                </h3>
                <div className=" mb-4">
                  <div>
                    <input
                      className={inputCls}
                      value={eduData.eligibility}
                      onChange={(e) =>
                        setEduData({ ...eduData, eligibility: e.target.value })
                      }
                      placeholder="e.g. BS Computer Science"
                    />
                  </div>
                 
                </div>
              </div>

              <div className="p-5 border-2 border-gray-100 rounded-lg bg-gray-50/50">
                <h3 className="text-[#0A1F5C] font-black text-[14px] uppercase tracking-wider mb-4 border-b-2 border-[#FFD000] inline-block pb-1">
                  Graduate Studies (Optional)
                </h3>
                <div className="mb-4">
                    <label className={labelCls}>School / University</label>
                    <input
                      className={inputCls}
                      value={eduData.gradSchool}
                      onChange={(e) =>
                        setEduData({ ...eduData, gradSchool: e.target.value })
                      }
                      placeholder="Institution Name"
                    />
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <label className={labelCls}>Unit Earn</label>
                    <input
                      className={inputCls}
                      value={eduData.unitEarn}
                      onChange={(e) =>
                        setEduData({ ...eduData, unitEarn: e.target.value })
                      }
                      placeholder="e.g. 12 units"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Year Graduated</label>
                    <input
                      className={inputCls}
                      value={eduData.gradYear}
                      onChange={(e) =>
                        setEduData({ ...eduData, gradYear: e.target.value })
                      }
                      placeholder="YYYY"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE & UPLOAD */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Map through the experiences array */}
              {workData.experiences.map((exp, index) => (
                <div key={index} className="p-5 border-2 border-gray-100 rounded-lg bg-gray-50/50 relative">
                  <h3 className="text-[#0A1F5C] font-black text-[14px] uppercase tracking-wider mb-4 border-b-2 border-[#FFD000] inline-block pb-1">
                    Work Experience {index + 1}
                  </h3>

                  {/* Show Remove button if there is more than 1 experience */}
                  {index > 0 && (
                    <button
                      onClick={() => removeExperience(index)}
                      className="absolute top-5 right-5 text-red-500 hover:text-red-700 text-[11px] font-bold uppercase tracking-wider"
                    >
                      <X size={16} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Position Title</label>
                      <input
                        className={inputCls}
                        value={exp.work_position}
                        onChange={(e) => handleExpChange(index, "work_position", e.target.value)}
                        placeholder="e.g. IT Officer I"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Inclusive Dates</label>
                      <input
                        className={inputCls}
                        value={exp.work_dates}
                        onChange={(e) => handleExpChange(index, "work_dates", e.target.value)}
                        placeholder="Jan 2022 - Present"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Employer / Agency Name</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className={inputCls}
                          value={exp.work_employer_name}
                          onChange={(e) => handleExpChange(index, "work_employer_name", e.target.value)}
                          placeholder="Employer / Agency Name"
                        />
                        
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Relevant Skills & Trainings</label>
                    <textarea
                      className={`${inputCls} h-20 resize-none`}
                      value={exp.work_skills}
                      onChange={(e) => handleExpChange(index, "work_skills", e.target.value)}
                      placeholder="List your technical skills and relevant seminars attended..."
                    />
                  </div>
                </div>
              ))}

              {/* The Add Experience Button */}
              <button
                onClick={addExperience}
                className="bg-[#0A1F5C] text-[#FFD000] font-bold py-2 px-4 rounded-full hover:bg-[#CC1B1B] hover:text-white transition-all mt-3 flex items-center mx-auto w-fit text-sm tracking-wider uppercase"
              >
                + Add Another Experience
              </button>

              {/* --- DOCUMENT UPLOADS --- */}

              <div>
                <h3 className="text-[#0A1F5C] font-black text-[14px] uppercase tracking-wider inline-block pb-1">
                  Document requirements (Please save all documents in a single PDF file.)
                </h3>
              </div>
              <div className="p-5 border-2 border-dashed border-[#0A1F5C]/30 rounded-lg bg-[#EEF2FF] text-center">
                <Upload size={28} className="mx-auto mb-2 text-[#0A1F5C]" />
                <h3 className="text-[#0A1F5C] font-bold text-sm mb-1">Upload Required Documents</h3>
                <p className="text-gray-500 text-xs mb-4">Please rename your file DILG_Caraga_FirstnameLastname.pdf</p>
                <div className="max-w-xs mx-auto">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0A1F5C] file:text-[#FFD000] hover:file:bg-[#CC1B1B] hover:file:text-white transition-all cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setWorkData({
                        ...workData,
                        workExpFile: file,
                        workExpFileName: file ? file.name : "",
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW & REVIEW */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[#FFF8D6] border border-[#FFD000]/50 p-4 rounded-lg text-sm text-[#0A1F5C] font-medium flex gap-3">
                <Eye size={20} className="shrink-0 text-[#CC1B1B]" />
                Please review your application details below carefully before
                final submission.
              </div>

              {/* Section 1 Review */}
              <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="font-black text-[#0A1F5C] uppercase tracking-wider text-[13px]">
                    Personal Information
                  </h4>
                  <button
                    onClick={() => jumpToStep(1)}
                    className="text-[#CC1B1B] hover:text-[#0A1F5C] flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div className="p-5 bg-white space-y-1">
                  <ReviewRow
                    label="Full Name"
                    value={`${formData.firstName} ${formData.mi} ${formData.lastName}`.trim()}
                  />
                  <ReviewRow label="Email" value={formData.email} />
                  <ReviewRow label="Contact" value={formData.contact} />
                  <ReviewRow
                    label="Demographics"
                    value={`${formData.age} yrs old • ${formData.sex} • ${formData.status}`}
                  />
                  <ReviewRow label="Address" value={formData.address} />
                </div>
              </div>

              {/* Section 2 Review */}
              <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="font-black text-[#0A1F5C] uppercase tracking-wider text-[13px]">
                    Education
                  </h4>
                  <button
                    onClick={() => jumpToStep(2)}
                    className="text-[#CC1B1B] hover:text-[#0A1F5C] flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div className="p-5 bg-white space-y-1">
                  <ReviewRow
                    label="College/University"
                    value={eduData.school}
                  />
                  <ReviewRow
                    label="Degree"
                    value={`${eduData.course} `}
                  />
                   <ReviewRow
                    label="Year Graduated"
                    value={`${eduData.year}`}
                  />
                  <ReviewRow label="Honors" value={eduData.honors} />
                  <ReviewRow label="Eligibility" value={eduData.eligibility} />
                  
                </div>
              </div>

              <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="font-black text-[#0A1F5C] uppercase tracking-wider text-[13px]">
                    Graduate Studies
                  </h4>
                  <button
                    onClick={() => jumpToStep(2)}
                    className="text-[#CC1B1B] hover:text-[#0A1F5C] flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div className="p-5 bg-white space-y-1">
                  <ReviewRow
                    label="College/University"
                    value={eduData.gradSchool}
                  />
                   <ReviewRow
                    label="Unit Earned"
                    value={`${eduData.unitEarn}`}
                  />
                  <ReviewRow label="Year" value={eduData.gradYear} />
                  
                </div>
              </div>

              {/* Section 3 Review */}
           
              <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="font-black text-[#0A1F5C] uppercase tracking-wider text-[13px]">
                    Experience & Docs
                  </h4>
                  <button
                    onClick={() => jumpToStep(3)}
                    className="text-[#CC1B1B] hover:text-[#0A1F5C] flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div className="p-5 bg-white space-y-4">
                  {workData.experiences.map((exp, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Role {index + 1}
                      </p>
                      <div className="space-y-1">
                        {/*  Updated to match the new state keys */}
                        <ReviewRow label="Position" value={exp.work_position} />
                        <ReviewRow
                          label="Employer"
                          value={exp.work_employer_name}
                        />
                        <ReviewRow label="Inclusive Dates" value={exp.work_dates} />
                        <ReviewRow label="Relevant Skills & Trainings" value={exp.work_skills} />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2 space-y-1">
                    <ReviewRow label="Document Requirements" value={workData.workExpFileName} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-gray-200 flex justify-between bg-gray-50 shrink-0">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-600 font-bold text-[13px] tracking-wider uppercase rounded hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-8 py-2.5 bg-[#0A1F5C] text-[#FFD000] font-bold text-[13px] tracking-wider uppercase rounded shadow hover:bg-[#CC1B1B] hover:text-white transition-all flex items-center gap-2"
            >
              {step === 3 ? "Review Details" : "Next Step"}{" "}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-10 py-2.5 bg-[#CC1B1B] text-white font-black text-[15px] tracking-[2px] uppercase rounded shadow-lg hover:bg-[#a81616] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={18} /> Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
