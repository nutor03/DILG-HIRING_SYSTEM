import React, { useState } from "react";
import {
  MapPin, Clock, ChevronRight, ChevronLeft, Users, Briefcase, 
  CheckCircle, Upload, X, ClipboardList, GraduationCap, FolderOpen, Tag, User
} from "lucide-react";
import { STEP_LABELS, STEP_ICONS, inputCls, labelCls } from "../../utils/constants";
import { FormCard, ReviewSection } from "../shared/SharedComponents";
import { submitApplication } from "../../supabaseClient";

export default function PlantillaModal({ job, currentUser, onClose, onSuccess }) {
  // Modal internal state
  const [isApplying, setIsApplying] = useState(false);
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Application Form State
  const [formData, setFormData] = useState({
    lastName: "", firstName: "", mi: "", address: "", status: "", age: 0, sex: "", contact: "", email: "",
  });
  const [eduData, setEduData] = useState({
    school: "", course: "", year: "", honors: "", gradSchool: 0, gradYear: "",
  });
  const [workData, setWorkData] = useState({
    trainings: "", skills: "", position: "", dates: null, employerLast: "", employerFirst: "",
  });

  const handleSubmitApp = async () => {
    const app = {
      jobId: job.id,
      jobTitle: job.title,
      location: job.location,
      type: "Plantilla",
      applicant_email: currentUser.email,
      applicant_name: `${formData.firstName} ${formData.mi} ${formData.lastName}`.trim(),
      applicant_age: formData.age,
      applicant_address: formData.address,
      applicant_status: formData.status,
      applicant_sex: formData.sex,
      applicant_contact: formData.contact,
      edu_school: eduData.school,
      edu_course: eduData.course,
      edu_year: eduData.year,
      edu_honors: eduData.honors,
      edu_grad_school: eduData.gradSchool,
      edu_grad_year: eduData.gradYear,
      work_trainings: workData.trainings,
      work_skills: workData.skills,
      work_position: workData.position,
      work_dates: workData.dates,
      work_employer_name: `${workData.employerFirst} ${workData.employerLast}`.trim(), 
      worksheet_file: fileName,
    };
    
    try {
      await submitApplication(app);
      onSuccess();
      setSubmitted(true);
    } catch (e) {
      console.error("Failed to submit application:", e);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-[#0A1F5C]/75 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden border-t-[6px] border-[#FFD000] relative"
        style={{ boxShadow: "0 40px 80px rgba(10,31,92,0.3)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-[#CC1B1B] text-gray-500 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer border-0"
        >
          <X size={15} strokeWidth={2.5} />
        </button>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2
              className="font-black text-[36px] text-[#0A1F5C] uppercase leading-none mb-3"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              Application Submitted!
            </h2>
            <p className="text-gray-500 text-[15px] max-w-sm leading-relaxed mb-8">
              Your application for{" "}
              <strong className="text-[#0A1F5C]">{job.title}</strong>{" "}
              has been received.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => {
                  onClose();
                  onSuccess();
                }}
                className="flex items-center gap-2 bg-[#0A1F5C] text-[#FFD000] font-bold text-[15px] tracking-[2px] uppercase px-8 py-3.5 rounded hover:bg-[#CC1B1B] hover:text-white transition-all cursor-pointer border-0"
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                <ClipboardList size={16} />
                Track Application
              </button>
            </div>
          </div>
        ) : !isApplying ? (
          <>
            <div className="flex-1 overflow-y-auto p-10">
              <p className="text-[12px] font-bold tracking-[3px] uppercase text-[#CC1B1B] mb-2">
                Item No: {job.itemNo || "N/A"}
              </p>
              <h2
                className="font-black text-[40px] text-[#0A1F5C] uppercase leading-none mb-3"
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                {job.title}
              </h2>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1.5">
                  <MapPin size={13} />
                  {job.location}
                </span>
                <span className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1.5">
                  <Clock size={13} />
                  {job.dateOfPublication}
                </span>
                <span className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1.5">
                  <Tag size={13} />
                  SG {job.sg} (₱{job.monthlySalary})
                </span>
                <span className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1.5">
                  <Users size={13} />
                  {job.personsNeeded} Vacanc{job.personsNeeded > 1 ? 'ies' : 'y'}
                </span>
              </div>

              {[
                { title: "Position Description", content: job.positionDescription },
                { title: "Education", content: job.education },
                { title: "Experience", content: job.experience },
                { title: "Training Requirements", content: job.trainingRequirements },
                { title: "Eligibility", content: job.eligibility },
              ].map(({ title, content }) => (
                <div key={title} className="mb-7">
                  <h3
                    className="text-[13px] font-bold tracking-[2px] uppercase text-[#0A1F5C] border-b-2 border-[#FFD000] pb-2 mb-3"
                    style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                  >
                    {title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {content || "Not specified."}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0 p-6 border-t-2 border-gray-100 flex justify-center">
              <button
                onClick={() => setIsApplying(true)}
                className="bg-[#CC1B1B] border-0 text-white font-black text-xl tracking-[2px] uppercase px-16 py-4 rounded transition-all duration-200 hover:bg-[#0A1F5C] hover:-translate-y-0.5 cursor-pointer"
                style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  boxShadow: "0 4px 20px rgba(204,27,27,0.3)",
                }}
              >
                Apply for this Role
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-shrink-0 px-10 pt-7 pb-5 border-b-2 border-gray-100">
              <button
                onClick={() => setIsApplying(false)}
                className="flex items-center gap-1.5 text-[13px] font-bold tracking-wider uppercase text-[#0A1F5C] hover:text-[#CC1B1B] transition-colors mb-3 bg-transparent border-0 cursor-pointer"
              >
                <ChevronLeft size={14} />
                Back to Details
              </button>
              <div
                className="font-black text-2xl text-[#0A1F5C] uppercase leading-none mb-1"
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                Apply — {job.title}
              </div>
              <div className="text-[13px] text-gray-400 font-semibold">
                Step {step} of 5:{" "}
                <span className="text-[#CC1B1B] font-bold">
                  {STEP_LABELS[step - 1]}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-10 py-8 bg-gray-50/50">
              {step === 1 && (
                <FormCard title="Personal Information">
                  <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 mb-4">
                    {[
                      ["Last Name", "lastName", "Dela Cruz", true],
                      ["First Name", "firstName", "Juan", true],
                      ["M.I.", "mi", "A.", true],
                    ].map(([label, key, ph, req]) => (
                      <div key={key}>
                        <label className={labelCls}>
                          {label}{" "}
                          {req && <span className="text-[#CC1B1B]">*</span>}
                        </label>
                        <input
                          className={inputCls}
                          placeholder={ph}
                          value={formData[key]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [key]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mb-4">
                    <label className={labelCls}>
                      Address <span className="text-[#CC1B1B]">*</span>
                    </label>
                    <input
                      className={inputCls}
                      placeholder="Butuan City, Agusan del Norte"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className={labelCls}>
                        Civil Status{" "}
                        <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <select
                        className={inputCls}
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="" disabled>Select</option>
                        {["Single", "Married", "Widowed", "Separated"].map(
                          (o) => (
                            <option key={o}>{o}</option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Age <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <input
                        className={inputCls}
                        type="number"
                        placeholder="25"
                        min="18"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Sex <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <select
                        className={inputCls}
                        value={formData.sex}
                        onChange={(e) =>
                          setFormData({ ...formData, sex: e.target.value })
                        }
                      >
                        <option value="" disabled>Select</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Contact <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <input
                        className={inputCls}
                        type="tel"
                        placeholder="0912 345 6789"
                        value={formData.contact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Email <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <input
                        className={inputCls}
                        type="email"
                        placeholder="email@gov.ph"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </FormCard>
              )}
              {step === 2 && (
                <>
                  <FormCard title="Tertiary / College">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={labelCls}>
                          School / University{" "}
                          <span className="text-[#CC1B1B]">*</span>
                        </label>
                        <input
                          className={inputCls}
                          placeholder="Caraga State University"
                          value={eduData.school}
                          onChange={(e) =>
                            setEduData({
                              ...eduData,
                              school: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Degree / Course{" "}
                          <span className="text-[#CC1B1B]">*</span>
                        </label>
                        <input
                          className={inputCls}
                          placeholder="BS Information Technology"
                          value={eduData.course}
                          onChange={(e) =>
                            setEduData({
                              ...eduData,
                              course: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>
                          Year Graduated{" "}
                          <span className="text-[#CC1B1B]">*</span>
                        </label>
                        <input
                          className={inputCls}
                          placeholder="2022"
                          value={eduData.year}
                          onChange={(e) =>
                            setEduData({ ...eduData, year: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Academic Honors</label>
                        <input
                          className={inputCls}
                          placeholder="e.g. Cum Laude"
                          value={eduData.honors}
                          onChange={(e) =>
                            setEduData({
                              ...eduData,
                              honors: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </FormCard>
                  <FormCard title="Graduate Studies (Optional)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>School / University</label>
                        <input
                          className={inputCls}
                          placeholder="Graduate school name"
                          value={eduData.gradSchool}
                          onChange={(e) =>
                            setEduData({
                              ...eduData,
                              gradSchool: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Year Graduated</label>
                        <input
                          className={inputCls}
                          type="number"
                          placeholder="YYYY"
                          value={eduData.gradYear}
                          onChange={(e) =>
                            setEduData({
                              ...eduData,
                              gradYear: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </FormCard>
                </>
              )}
              {step === 3 && (
                <>
                  <FormCard title="Work Experience">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={labelCls}>Position</label>
                        <input
                          className={inputCls}
                          placeholder="e.g. Software Engineer"
                          value={workData.position}
                          onChange={(e) =>
                            setWorkData({
                              ...workData,
                              position: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Inclusive Dates</label>
                        <input
                          className={inputCls}
                          placeholder="2020 – 2023"
                          value={workData.dates}
                          onChange={(e) =>
                            setWorkData({
                              ...workData,
                              dates: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Employer Last Name</label>
                        <input
                          className={inputCls}
                          placeholder="Dela Cruz"
                          value={workData.employerLast}
                          onChange={(e) =>
                            setWorkData({
                              ...workData,
                              employerLast: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Employer First Name</label>
                        <input
                          className={inputCls}
                          placeholder="Juan"
                          value={workData.employerFirst}
                          onChange={(e) =>
                            setWorkData({
                              ...workData,
                              employerFirst: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </FormCard>
                  <FormCard title="Skills & Trainings">
                    <div className="mb-4">
                      <label className={labelCls}>
                        Relevant Trainings{" "}
                        <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="e.g. Leadership Training..."
                        value={workData.trainings}
                        onChange={(e) =>
                          setWorkData({
                            ...workData,
                            trainings: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Skills <span className="text-[#CC1B1B]">*</span>
                      </label>
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="e.g. React, Node.js..."
                        value={workData.skills}
                        onChange={(e) =>
                          setWorkData({
                            ...workData,
                            skills: e.target.value,
                          })
                        }
                      />
                    </div>
                  </FormCard>
                </>
              )}
              {step === 4 && (
                <FormCard title="Upload Requirements">
                  <p className="text-[14px] text-gray-500 leading-relaxed mb-6 text-center">
                    Upload your complete application requirements as a
                    single file. Rename it to{" "}
                    <strong className="text-[#0A1F5C]">
                      DILG_[Your Name]
                    </strong>
                    . Max 5MB.
                  </p>
                  <div className="relative border-2 border-dashed border-[#FFD000] bg-[#FFF8D6] hover:bg-[#FFD000]/10 rounded-lg p-12 flex flex-col items-center justify-center transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          setFileName(e.target.files[0].name);
                      }}
                    />
                    <div className="mb-3 transition-transform group-hover:scale-110">
                      {fileName ? (
                        <CheckCircle size={48} className="text-green-500" />
                      ) : (
                        <Upload size={48} className="text-[#0A1F5C]/40" />
                      )}
                    </div>
                    {fileName ? (
                      <div className="text-[#0A1F5C] font-bold text-base text-center">
                        Attached:{" "}
                        <span className="text-green-600 block mt-1">
                          {fileName}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p
                          className="font-extrabold text-xl text-[#0A1F5C] uppercase tracking-wide"
                          style={{
                            fontFamily: "'Barlow Condensed',sans-serif",
                          }}
                        >
                          Click to Browse or Drop File
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          PDF, DOC, DOCX · Max 5MB
                        </p>
                      </>
                    )}
                  </div>
                  {fileName && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => setFileName("")}
                        className="text-[#CC1B1B] text-sm font-bold underline bg-transparent border-0 cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <X size={13} />
                        Remove File
                      </button>
                    </div>
                  )}
                </FormCard>
              )}
              {step === 5 && (
                <div>
                  <ReviewSection
                    icon={User}
                    title="Personal Information"
                    onEdit={() => setStep(1)}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                          Full Name
                        </p>
                        <p className="text-[15px] font-semibold text-[#0A1F5C]">
                          {formData.firstName} {formData.mi}{" "}
                          {formData.lastName}
                        </p>
                      </div>
                      {[
                        ["Age", formData.age],
                        ["Sex", formData.sex],
                        ["Civil Status", formData.status],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                            {l}
                          </p>
                          <p className="text-[15px] font-semibold text-[#0A1F5C]">
                            {v || "—"}
                          </p>
                        </div>
                      ))}
                      <div className="col-span-2">
                        <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                          Address
                        </p>
                        <p className="text-[15px] font-semibold text-[#0A1F5C]">
                          {formData.address || "—"}
                        </p>
                      </div>
                      {[
                        ["Email", formData.email],
                        ["Contact", formData.contact],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                            {l}
                          </p>
                          <p className="text-[15px] font-semibold text-[#0A1F5C]">
                            {v || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ReviewSection>
                  <ReviewSection
                    icon={GraduationCap}
                    title="Education"
                    onEdit={() => setStep(2)}
                  >
                    <p className="text-[15px] font-semibold text-[#0A1F5C]">
                      {eduData.school || "No school provided"}
                    </p>
                    <p className="text-[12px] font-bold tracking-wider uppercase text-gray-400 mt-1">
                      {eduData.course}{" "}
                      {eduData.year ? `· ${eduData.year}` : ""}
                    </p>
                  </ReviewSection>
                  <ReviewSection
                    icon={Briefcase}
                    title="Work Experience"
                    onEdit={() => setStep(3)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        ["Position", workData.position || "N/A"],
                        [
                          "Employer",
                          `${workData.employerFirst} ${workData.employerLast}`.trim() ||
                            "N/A",
                        ],
                        ["Dates", workData.dates || "N/A"],
                        ["Skills", workData.skills || "N/A"],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                            {l}
                          </p>
                          <p className="text-[15px] font-semibold text-[#0A1F5C]">
                            {v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ReviewSection>
                  <ReviewSection
                    icon={FolderOpen}
                    title="Documents"
                    onEdit={() => setStep(4)}
                  >
                    <div className="flex items-center gap-3 p-3 bg-[#FFF8D6] border border-[#FFD000] rounded-lg">
                      <ClipboardList
                        size={24}
                        className="text-[#0A1F5C] flex-shrink-0"
                      />
                      <div>
                        <p className="text-[15px] font-semibold text-[#0A1F5C]">
                          {fileName || "No file attached"}
                        </p>
                        <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400">
                          Resume / Application Requirement
                        </p>
                      </div>
                    </div>
                  </ReviewSection>
                  <div className="flex items-start gap-3 p-5 bg-[#FFF8D6] border-2 border-[#FFD000] rounded-lg mt-4">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 w-4 h-4 cursor-pointer flex-shrink-0 accent-[#0A1F5C]"
                    />
                    <p className="text-[13px] text-[#0A1F5C] leading-relaxed font-medium">
                      I hereby certify that the information above is true
                      and correct to the best of my knowledge.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 px-10 pt-4 pb-6 border-t-2 border-gray-100 bg-white rounded-b-xl">
              <div className="flex items-center mb-3">
                {[1, 2, 3, 4, 5].map((s) => {
                  const Icon = STEP_ICONS[s - 1];
                  return (
                    <div key={s} className={`flex items-center ${s < 5 ? "flex-1" : ""}`}>
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${s < step ? "bg-[#FFD000] text-[#0A1F5C]" : s === step ? "bg-[#0A1F5C] text-[#FFD000] ring-4 ring-[#FFD000]/40 scale-110" : "bg-gray-200 text-gray-400"}`}>
                        <Icon size={13} strokeWidth={2.5} />
                      </div>
                      {s < 5 && <div className={`flex-1 h-[3px] mx-1 rounded-full transition-all duration-300 ${s < step ? "bg-[#FFD000]" : "bg-gray-200"}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mb-4">
                {STEP_LABELS.map((label, i) => (
                  <span key={label} className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${i + 1 === step ? "text-[#0A1F5C]" : "text-gray-300"}`}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex justify-between gap-4">
                <button
                  disabled={step === 1}
                  onClick={() => setStep((p) => Math.max(p - 1, 1))}
                  className="px-8 py-3.5 bg-gray-100 border-0 text-[#0A1F5C] font-bold text-[15px] tracking-[2px] uppercase rounded transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => step === 5 ? handleSubmitApp() : setStep((p) => Math.min(p + 1, 5))}
                  className={`flex-1 border-0 max-w-[160px] py-2 font-extrabold text-[16px] tracking-[2px] uppercase rounded transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${step === 5 ? "bg-[#CC1B1B] text-white hover:bg-[#0A1F5C] hover:text-[#FFD000]" : "bg-[#FFD000] text-[#0A1F5C] hover:bg-[#CC1B1B] hover:text-white"}`}
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    boxShadow: step === 5 ? "0 4px 16px rgba(204,27,27,0.3)" : "0 4px 16px rgba(255,208,0,0.3)",
                  }}
                >
                  {step === 5 ? (<><CheckCircle size={16} />Submit</>) : (<>Next<ChevronRight size={16} /></>)}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}