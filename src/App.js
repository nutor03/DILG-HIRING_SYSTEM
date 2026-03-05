import { useState } from "react";

const STEP_LABELS = [
  "Personal",
  "Education",
  "Experience",
  "Documents",
  "Review",
];

// Shared reusable class strings
const inputCls =
  "w-full px-4 py-3 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000] focus:ring-2 focus:ring-[#FFD000]/20";
const labelCls =
  "block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5";

export default function App() {
  const jobs = [
    {
      id: 1,
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      about:
        "We are looking for a skilled React developer to build modern, responsive user interfaces.",
      responsibilities: [
        "Develop new user-facing features.",
        "Build reusable code and libraries.",
        "Optimize applications for maximum speed.",
      ],
      requirements: [
        "3+ years of React experience.",
        "Strong proficiency in JavaScript and Tailwind CSS.",
        "Experience with Git.",
      ],
    },
    {
      id: 2,
      title: "HR Specialist",
      department: "Human Resources",
      location: "New York, NY",
      type: "Contract",
      about:
        "Join our HR team to help recruit, onboard, and support our amazing employees.",
      responsibilities: [
        "Manage the full cycle recruitment process.",
        "Maintain applicant tracking systems.",
        "Assist with employee onboarding.",
      ],
      requirements: [
        "Bachelor's degree in HR or related field.",
        "Excellent communication skills.",
        "Experience with modern HR software.",
      ],
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "San Francisco, CA",
      type: "Full-time",
      about:
        "Help us design intuitive and beautiful digital experiences for our users.",
      responsibilities: [
        "Create wireframes and interactive prototypes.",
        "Conduct user research and testing.",
        "Collaborate with frontend developers.",
      ],
      requirements: [
        "Portfolio demonstrating UX/UI process.",
        "Proficiency in Figma.",
        "Understanding of web accessibility standards.",
      ],
    },
    {
      id: 4,
      title: "Administrative Officer",
      department: "Administration",
      location: "Butuan City",
      type: "Full-time",
      about:
        "Support DILG-CARAGA's daily administrative operations and coordination efforts.",
      responsibilities: [
        "Coordinate office operations and procedures.",
        "Manage correspondence and documents.",
        "Liaise with government agencies.",
      ],
      requirements: [
        "Bachelor's degree in Public Administration.",
        "Strong organizational skills.",
        "Proficiency in MS Office.",
      ],
    },
    {
      id: 5,
      title: "IT Support Specialist",
      department: "Engineering",
      location: "Butuan City",
      type: "Full-time",
      about:
        "Provide technical support and maintain IT infrastructure for DILG-CARAGA.",
      responsibilities: [
        "Troubleshoot hardware and software issues.",
        "Maintain network infrastructure.",
        "Support end-users with technical needs.",
      ],
      requirements: [
        "Bachelor's degree in IT or CS.",
        "Experience with networking.",
        "Strong problem-solving skills.",
      ],
    },
    {
      id: 6,
      title: "Communications Officer",
      department: "Communications",
      location: "Butuan City",
      type: "Contract",
      about:
        "Handle public communications, press releases, and social media for DILG-CARAGA.",
      responsibilities: [
        "Draft press releases and official statements.",
        "Manage social media channels.",
        "Coordinate media engagements.",
      ],
      requirements: [
        "Degree in Communications or Journalism.",
        "Excellent writing skills.",
        "Social media management experience.",
      ],
    },
  ];

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    mi: "",
    address: "",
    status: "",
    age: "",
    sex: "",
    contact: "",
    email: "",
  });
  const [eduData, setEduData] = useState({
    school: "",
    course: "",
    year: "",
    honors: "",
    gradSchool: "",
    gradYear: "",
  });
  const [workData, setWorkData] = useState({
    trainings: "",
    skills: "",
    position: "",
    dates: "",
    employerLast: "",
    employerFirst: "",
  });

  const depts = ["All", ...new Set(jobs.map((j) => j.department))];
  const filtered = jobs.filter((j) => {
    const matchDept = selectedDept === "All" || j.department === selectedDept;
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const closeModal = () => {
    setSelectedJob(null);
    setIsApplying(false);
    setStep(1);
  };

  const FormCard = ({ title, children }) => (
    <div className="bg-white border-2 border-gray-100 rounded-lg p-6 mb-5">
      <div className="flex items-center gap-2 text-[13px] font-extrabold tracking-widest uppercase text-[#0A1F5C] border-b-2 border-[#FFD000] pb-2.5 mb-5">
        <span className="block w-1 h-4 bg-[#CC1B1B] rounded-sm flex-shrink-0" />
        {title}
      </div>
      {children}
    </div>
  );

  const ReviewSection = ({ emoji, title, onEdit, children }) => (
    <div className="bg-white border-2 border-gray-100 rounded-lg overflow-hidden mb-4">
      <div className="flex justify-between items-center px-6 py-4 bg-[#0A1F5C]">
        <h4 className="text-[14px] font-extrabold tracking-widest uppercase text-[#FFD000] flex items-center gap-2">
          {emoji} {title}
        </h4>
        <button
          onClick={onEdit}
          className="border border-[#FFD000] text-[#FFD000] px-3 py-1 rounded-sm text-[11px] font-bold tracking-wider uppercase hover:bg-[#FFD000] hover:text-[#0A1F5C] transition-colors cursor-pointer"
        >
          Edit
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFDF0] text-[#0A1F5C]">
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── NAVBAR ── */}
      <nav className="bg-[#FFD000] border-b-[5px] border-[#CC1B1B] sticky top-0 z-50 shadow-md flex items-center justify-between px-6 md:px-10 h-[72px]">
        <div className="flex items-center gap-3.5">
          {/* LOGO: Replace this div with <img src="/DILG_LOGO.png" alt="DILG Logo" className="w-12 h-12 rounded-lg object-contain" /> */}
          <div >
            {/* LOGO: Replace this div with: */}
            <img
              src="/DILG_LOGO.png"
              alt="DILG Logo"
              className="w-12 h-12 rounded-lg object-contain"
            />
          </div>
          <div className="leading-none">
            <h1
              className="font-bold text-2xl text-[#0A1F5C] tracking-wide uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              DEPARTMENT OF THE INTERIOR AND LOCAL GOVERNMENT
            </h1>
            <span className="block text-[10px] font-bold tracking-[3px] text-[#CC1B1B] uppercase mt-0.5">
              Careers Portal
            </span>
          </div>
        </div>
        <a
          href="#jobs"
          className="hidden md:inline-block bg-[#0A1F5C] text-[#FFD000] px-7 py-2.5 rounded font-bold text-[15px] tracking-wider uppercase hover:bg-[#CC1B1B] hover:text-white transition-all duration-200 hover:-translate-y-px no-underline"
        >
          Log In
        </a>
      </nav>

      {/* ── HERO ── */}
      <header className="relative bg-[#0A1F5C] min-h-[88vh] flex items-center justify-center text-center px-6 py-20 overflow-hidden border-b-[6px] border-[#FFD000]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,208,0,0.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,208,0,0.06) 40px)",
          }}
        />
        <div
          className="absolute -top-28 -right-28 w-[480px] h-[480px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(255,208,0,0.12) 0%,transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[360px] h-[360px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(204,27,27,0.10) 0%,transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <span className="inline-block bg-[#CC1B1B] text-white text-[12px] font-bold tracking-[3px] uppercase px-4 py-1.5 rounded-sm mb-6">
            Now Hiring
          </span>
          <h2
            className="font-black uppercase leading-[0.9] text-[#FFD000] tracking-tight mb-2"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(52px,8vw,100px)",
            }}
          >
            Shape the Future
            <span className="block text-white">of Local Governance</span>
          </h2>
          <p className="text-white/75 text-lg max-w-xl mx-auto mt-5 mb-10 leading-relaxed">
            Join DILG-CARAGA and make a lasting impact in the communities we
            serve across the Caraga region.
          </p>
          <a
            href="#jobs"
            className="relative z-10 inline-block bg-[#FFD000] text-[#0A1F5C] font-black text-xl tracking-[2px] uppercase px-12 py-5 rounded transition-all duration-200 hover:bg-white hover:-translate-y-1 no-underline"
            style={{
              boxShadow: "0 8px 32px rgba(255,208,0,0.3)",
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            View Open Positions
          </a>
          <div className="relative z-10 flex gap-12 justify-center mt-16 border-t border-[#FFD000]/20 pt-10">
            {[
              ["6", "Open Roles"],
              ["4", "Departments"],
              ["1K+", "Communities"],
            ].map(([num, label]) => (
              <div key={label}>
                <div
                  className="font-black text-[40px] text-[#FFD000] leading-none"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {num}
                </div>
                <div className="text-white/50 text-[11px] tracking-[2px] uppercase mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── JOBS SECTION ── */}
      <main id="jobs" className="bg-[#FFFDF0] py-20 px-6">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#FFD000] text-[#0A1F5C] text-[11px] font-extrabold tracking-[3px] uppercase px-3.5 py-1.5 rounded-sm mb-4 border-l-4 border-[#CC1B1B]">
            Career Opportunities
          </span>
          <h3
            className="font-black text-5xl text-[#0A1F5C] uppercase tracking-tight leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Open Roles
          </h3>
          <p className="text-gray-500 mt-2 text-base">
            Find your place in public service
          </p>
        </div>

        {/* Filters */}
        <div
          className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row gap-4 bg-white p-5 rounded-lg border-2 border-[#FFD000]"
          style={{ boxShadow: "4px 4px 0 #FFD000" }}
        >
          <input
            type="text"
            placeholder="Search positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded text-sm text-[#0A1F5C] outline-none focus:border-[#FFD000] transition-colors bg-gray-50"
          />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded text-sm text-[#0A1F5C] outline-none focus:border-[#FFD000] transition-colors bg-gray-50 cursor-pointer"
          >
            {depts.map((d) => (
              <option key={d} value={d}>
                {d === "All" ? "All Departments" : d}
              </option>
            ))}
          </select>
        </div>

        {/* Job Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <p className="col-span-3 text-center text-gray-400 py-12">
              No positions found.
            </p>
          ) : (
            filtered.map((job) => (
              <div
                key={job.id}
                className="group bg-white border-2 border-gray-200 rounded-lg p-6 transition-all duration-200 relative overflow-hidden hover:border-[#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ "--tw-shadow": "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = "6px 6px 0 #FFD000")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFD000] transition-all duration-200 group-hover:w-[6px] group-hover:bg-[#CC1B1B]" />
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-block bg-[#FFF8D6] text-[#0A1F5C] text-[11px] font-bold tracking-[2px] uppercase px-2.5 py-1 rounded-sm border border-[#FFD000]">
                    {job.department}
                  </span>
                  <span className="text-gray-400 text-xs font-semibold">
                    📍 {job.location}
                  </span>
                </div>
                <h4
                  className="font-extrabold text-2xl text-[#0A1F5C] uppercase leading-tight group-hover:text-[#CC1B1B] transition-colors mb-1"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {job.title}
                </h4>
                <p className="mb-5">
                  <span className="inline-block bg-[#EEF2FF] text-[#0A1F5C] text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm">
                    {job.type}
                  </span>
                </p>
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setIsApplying(false);
                    setStep(1);
                  }}
                  className="w-full bg-[#0A1F5C] text-[#FFD000] font-bold text-[15px] tracking-[2px] uppercase py-3 rounded transition-all duration-200 hover:bg-[#CC1B1B] hover:text-white cursor-pointer"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  View Details →
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ── MODAL ── */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-[200] bg-[#0A1F5C]/75 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="bg-white rounded-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden border-t-[6px] border-[#FFD000] relative"
            style={{ boxShadow: "0 40px 80px rgba(10,31,92,0.3)" }}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-[#CC1B1B] text-gray-500 hover:text-white rounded-full flex items-center justify-center transition-all text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* ─ JOB DETAILS ─ */}
            {!isApplying ? (
              <>
                <div className="flex-1 overflow-y-auto p-10">
                  <p className="text-[12px] font-bold tracking-[3px] uppercase text-[#CC1B1B] mb-2">
                    {selectedJob.department}
                  </p>
                  <h2
                    className="font-black text-[40px] text-[#0A1F5C] uppercase leading-none mb-3"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {selectedJob.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded">
                      📍 {selectedJob.location}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded">
                      🕒 {selectedJob.type}
                    </span>
                  </div>
                  {[
                    {
                      title: "About the Role",
                      content: (
                        <p className="text-gray-600 leading-relaxed text-[15px]">
                          {selectedJob.about}
                        </p>
                      ),
                    },
                    {
                      title: "What You'll Do",
                      content: (
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-600 text-[15px]">
                          {selectedJob.responsibilities.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      ),
                    },
                    {
                      title: "What You Need",
                      content: (
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-600 text-[15px]">
                          {selectedJob.requirements.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      ),
                    },
                  ].map(({ title, content }) => (
                    <div key={title} className="mb-7">
                      <h3
                        className="text-[13px] font-bold tracking-[2px] uppercase text-[#0A1F5C] border-b-2 border-[#FFD000] pb-2 mb-3"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        {title}
                      </h3>
                      {content}
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0 p-6 border-t-2 border-gray-100 flex justify-center">
                  <button
                    onClick={() => setIsApplying(true)}
                    className="bg-[#CC1B1B] text-white font-black text-xl tracking-[2px] uppercase px-16 py-4 rounded transition-all duration-200 hover:bg-[#0A1F5C] hover:-translate-y-0.5 cursor-pointer"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      boxShadow: "0 4px 20px rgba(204,27,27,0.3)",
                    }}
                  >
                    Apply for this Role
                  </button>
                </div>
              </>
            ) : (
              /* ─ APPLICATION FORM ─ */
              <>
                {/* Form Header */}
                <div className="flex-shrink-0 px-10 pt-7 pb-5 border-b-2 border-gray-100">
                  <button
                    onClick={() => setIsApplying(false)}
                    className="flex items-center gap-1.5 text-[13px] font-bold tracking-wider uppercase text-[#0A1F5C] hover:text-[#CC1B1B] transition-colors mb-3 bg-transparent border-0 cursor-pointer"
                  >
                    ← Back to Details
                  </button>
                  <div
                    className="flex-1 overflow-y-auto font-black text-2xl text-[#0A1F5C] uppercase leading-none mb-1"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Apply — {selectedJob.title}
                  </div>
                  <div className="text-[13px] text-gray-400 font-semibold">
                    Step {step} of 5:{" "}
                    <span className="text-[#CC1B1B] font-bold">
                      {STEP_LABELS[step - 1]}
                    </span>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-gray-50/50">
                  {/* STEP 1 */}
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
                            <option value="" disabled>
                              Select
                            </option>
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
                            <option value="" disabled>
                              Select
                            </option>
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

                  {/* STEP 2 */}
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
                            <label className={labelCls}>
                              School / University
                            </label>
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

                  {/* STEP 3 */}
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
                            <label className={labelCls}>
                              Employer Last Name
                            </label>
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
                            <label className={labelCls}>
                              Employer First Name
                            </label>
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
                            placeholder="e.g. Leadership Training, Disaster Risk Reduction..."
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
                            placeholder="e.g. React, Node.js, Project Management..."
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

                  {/* STEP 4 */}
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
                        <div className="text-5xl mb-3 transition-transform group-hover:scale-110">
                          {fileName ? "✅" : "📋"}
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
                                fontFamily: "'Barlow Condensed', sans-serif",
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
                            className="text-[#CC1B1B] text-sm font-bold underline relative z-10 bg-transparent border-0 cursor-pointer"
                          >
                            ✕ Remove File
                          </button>
                        </div>
                      )}
                    </FormCard>
                  )}

                  {/* STEP 5 */}
                  {step === 5 && (
                    <div>
                      <ReviewSection
                        emoji="👤"
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
                        emoji="🎓"
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
                        emoji="💼"
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
                        emoji="📂"
                        title="Documents"
                        onEdit={() => setStep(4)}
                      >
                        <div className="flex items-center gap-3 p-3 bg-[#FFF8D6] border border-[#FFD000] rounded-lg">
                          <span className="text-2xl">📄</span>
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
                          and correct to the best of my knowledge. I understand
                          that any false statement may be cause for
                          disqualification or dismissal.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── PROGRESS + BUTTONS ── */}
                <div className="flex-shrink-0 px-10 pt-4 pb-6 border-t-2 border-gray-100 bg-white rounded-b-xl">
                  {/* Dots */}
                  <div className="flex items-center mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div
                        key={s}
                        className={`flex items-center ${s < 5 ? "flex-1" : ""}`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300 ${s <= step ? "bg-[#0A1F5C]" : "bg-gray-300"} ${s === step ? "ring-4 ring-[#FFD000]/60 scale-150" : ""}`}
                        />
                        {s < 5 && (
                          <div
                            className={`flex-1 h-[3px] mx-1.5 rounded-full transition-all duration-300 ${s < step ? "bg-[#FFD000]" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Step labels */}
                  <div className="flex justify-between mb-4">
                    {STEP_LABELS.map((label, i) => (
                      <span
                        key={label}
                        className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${i + 1 === step ? "text-[#0A1F5C]" : "text-gray-300"}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  {/* Buttons */}
                  <div className="flex justify-between gap-4">
                    <button
                      disabled={step === 1}
                      onClick={() => setStep((p) => Math.max(p - 1, 1))}
                      className="px-8 py-3.5 bg-gray-100 text-[#0A1F5C] font-bold text-[15px] tracking-[2px] uppercase rounded transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep((p) => Math.min(p + 1, 5))}
                      className={`flex-1 max-w-[100px] py-2 font-extrabold text-[16px] tracking-[2px] uppercase rounded transition-all duration-200 cursor-pointer ${step === 5 ? "bg-[#CC1B1B] text-white hover:bg-[#0A1F5C] hover:text-[#FFD000]" : "bg-[#FFD000] text-[#0A1F5C] hover:bg-[#CC1B1B] hover:text-white"}`}
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        boxShadow:
                          step === 5
                            ? "0 4px 16px rgba(204,27,27,0.3)"
                            : "0 4px 16px rgba(255,208,0,0.3)",
                      }}
                    >
                      {step === 5 ? "Submit Application" : "Next →"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
