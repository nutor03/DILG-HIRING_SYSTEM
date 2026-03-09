import { useState, useEffect } from "react";
import {
  MapPin, Clock, ChevronRight, ChevronLeft, User, GraduationCap,
  Briefcase, FolderOpen, FileText, CheckCircle, Upload, X, Pencil,
  Building2, Globe, LogIn, LogOut, Eye, EyeOff, AlertCircle,
  ClipboardList, Calendar, UserCheck, XCircle, Loader2, Mail,
  Lock, ArrowRight, Home, Shield, Plus, Trash2, Edit3, Save,
  Download, Search, Filter, ChevronDown, Users, BarChart2,
  AlertTriangle, RefreshCw, Check, Layers,
} from "lucide-react";

// ─── IMPORT SUPABASE SERVICE LAYER ────────────────────────────────────────────
// Make sure supabaseClient.js is in the same folder (or adjust the path).
import {
  signUp, signIn, signOut, getSession,
  fetchJobs, saveJob, deleteJob, toggleJob,
  submitApplication, fetchMyApplications, fetchAllApplications,
  updateApplicationStatus, deleteApplication,
} from "./supabaseClient";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STEP_LABELS = ["Personal","Education","Experience","Documents","Review"];
const STEP_ICONS  = [User, GraduationCap, Briefcase, FolderOpen, CheckCircle];

const STATUS_CONFIG = {
  "Submitted":           { color:"#6366F1", bg:"#EEF2FF", icon:ClipboardList, label:"Submitted" },
  "Under Review":        { color:"#F59E0B", bg:"#FFFBEB", icon:Loader2,       label:"Under Review" },
  "Interview Scheduled": { color:"#3B82F6", bg:"#EFF6FF", icon:Calendar,      label:"Interview Scheduled" },
  "Approved / Hired":    { color:"#10B981", bg:"#ECFDF5", icon:UserCheck,     label:"Approved / Hired" },
  "Rejected":            { color:"#EF4444", bg:"#FEF2F2", icon:XCircle,       label:"Rejected" },
};
const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const DEPT_COLORS = {
  "Engineering":     { bg:"#DBEAFE", text:"#1D4ED8" },
  "Human Resources": { bg:"#FCE7F3", text:"#9D174D" },
  "Design":          { bg:"#D1FAE5", text:"#065F46" },
  "Administration":  { bg:"#FEF3C7", text:"#92400E" },
  "Communications":  { bg:"#EDE9FE", text:"#5B21B6" },
};

const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000] focus:ring-2 focus:ring-[#FFD000]/20";
const labelCls = "block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5";

function validateEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validatePassword(p){ return { length:p.length>=8, upper:/[A-Z]/.test(p), number:/[0-9]/.test(p) }; }

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]               = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [authModal, setAuthModal]     = useState(null);
  const [pendingJob, setPendingJob]   = useState(null);
  const [jobs, setJobs]               = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Home state
  const [search, setSearch]           = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying]   = useState(false);
  const [step, setStep]               = useState(1);
  const [fileName, setFileName]       = useState("");
  const [submitted, setSubmitted]     = useState(false);
  const [formData, setFormData]       = useState({ lastName:"",firstName:"",mi:"",address:"",status:"",age:"",sex:"",contact:"",email:"" });
  const [eduData,  setEduData]        = useState({ school:"",course:"",year:"",honors:"",gradSchool:"",gradYear:"" });
  const [workData, setWorkData]       = useState({ trainings:"",skills:"",position:"",dates:"",employerLast:"",employerFirst:"" });
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading]   = useState(false);

  // ── Bootstrap: restore session + load jobs on mount
  useEffect(() => {
    (async () => {
      const user = await getSession();
      if (user) {
        setCurrentUser(user);
        if (user.role === "admin") setPage("admin");
        else loadMyApplications(user.email);
      }
      await loadJobs();
    })();
  }, []);

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (e) {
      console.error("Failed to load jobs:", e);
    } finally {
      setJobsLoading(false);
    }
  };

  const loadMyApplications = async (email) => {
    setAppLoading(true);
    try {
      const data = await fetchMyApplications(email);
      setApplications(data);
    } catch (e) {
      console.error("Failed to load applications:", e);
    } finally {
      setAppLoading(false);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthModal(null);
    if (user.role === "admin") { setPage("admin"); return; }
    loadMyApplications(user.email);
    if (pendingJob) {
      setSelectedJob(pendingJob); setIsApplying(false); setStep(1); setPendingJob(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setPage("home");
    setSelectedJob(null);
    setIsApplying(false);
    setApplications([]);
  };

  const openApply = (job) => {
    if (!currentUser) { setPendingJob(job); setAuthModal("login"); return; }
    if (isAdmin) return;
    setSelectedJob(job); setIsApplying(false); setStep(1); setSubmitted(false);
  };

  const handleSubmitApp = async () => {
    const app = {
      jobId:          selectedJob.id,
      jobTitle:       selectedJob.title,
      department:     selectedJob.department,
      location:       selectedJob.location,
      type:           selectedJob.type,
      applicantEmail: currentUser.email,
      applicantName:  `${formData.firstName} ${formData.mi} ${formData.lastName}`.trim(),
      formData:       { ...formData },
      eduData:        { ...eduData },
      workData:       { ...workData },
      fileName,
    };
    try {
      await submitApplication(app);
      // Refresh local list
      await loadMyApplications(currentUser.email);
      setSubmitted(true);
    } catch (e) {
      console.error("Failed to submit application:", e);
      alert("Submission failed. Please try again.");
    }
  };

  const updateJobsState = async (action, payload) => {
    // action: "save" | "delete" | "toggle"
    try {
      if (action === "save")   await saveJob(payload);
      if (action === "delete") await deleteJob(payload);
      if (action === "toggle") await toggleJob(payload.id, payload.active);
      await loadJobs(); // re-fetch to stay in sync
    } catch (e) {
      console.error("Job update failed:", e);
      alert("Operation failed. Please try again.");
    }
  };

  const closeModal = () => {
    setSelectedJob(null); setIsApplying(false); setStep(1); setSubmitted(false); setFileName("");
    setFormData({ lastName:"",firstName:"",mi:"",address:"",status:"",age:"",sex:"",contact:"",email:"" });
    setEduData({ school:"",course:"",year:"",honors:"",gradSchool:"",gradYear:"" });
    setWorkData({ trainings:"",skills:"",position:"",dates:"",employerLast:"",employerFirst:"" });
  };

  const activeJobs = jobs.filter(j => j.active !== false);
  const depts      = ["All", ...new Set(activeJobs.map(j => j.department))];
  const filtered   = activeJobs.filter(j => {
    const matchDept   = selectedDept === "All" || j.department === selectedDept;
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const FormCard = ({ title, children }) => (
    <div className="bg-white border-2 border-gray-100 rounded-lg p-6 mb-5">
      <div className="flex items-center gap-2 text-[13px] font-extrabold tracking-widest uppercase text-[#0A1F5C] border-b-2 border-[#FFD000] pb-2.5 mb-5">
        <span className="block w-1 h-4 bg-[#CC1B1B] rounded-sm flex-shrink-0" />{title}
      </div>
      {children}
    </div>
  );

  const ReviewSection = ({ icon: Icon, title, onEdit, children }) => (
    <div className="bg-white border-2 border-gray-100 rounded-lg overflow-hidden mb-4">
      <div className="flex justify-between items-center px-6 py-4 bg-[#0A1F5C]">
        <h4 className="text-[14px] font-extrabold tracking-widest uppercase text-[#FFD000] flex items-center gap-2"><Icon size={16} />{title}</h4>
        <button onClick={onEdit} className="border border-[#FFD000] text-[#FFD000] px-3 py-1 rounded-sm text-[11px] font-bold tracking-wider uppercase hover:bg-[#FFD000] hover:text-[#0A1F5C] transition-colors cursor-pointer flex items-center gap-1"><Pencil size={10} />Edit</button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFDF0] text-[#0A1F5C]">
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => { setAuthModal(null); setPendingJob(null); }}
          onLogin={handleLogin}
          switchMode={m => setAuthModal(m)}
        />
      )}

      {/* NAVBAR */}
      <nav className={`border-b-[5px] sticky top-0 z-50 shadow-md flex items-center justify-between px-6 md:px-10 h-[72px] ${isAdmin ? "bg-[#0A1F5C] border-[#FFD000]" : "bg-[#FFD000] border-[#CC1B1B]"}`}>
        <button onClick={() => setPage(isAdmin ? "admin" : "home")} className="flex items-center gap-3.5 bg-transparent border-0 cursor-pointer">
          <img src="/DILG_LOGO.png" alt="DILG Logo" className="w-12 h-12 rounded-lg object-contain" />
          <div className="leading-none text-left">
            <h1 className={`font-bold text-2xl tracking-wide uppercase ${isAdmin ? "text-[#FFD000]" : "text-[#0A1F5C]"}`} style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>DEPARTMENT OF THE INTERIOR AND LOCAL GOVERNMENT</h1>
            <span className={`block text-[10px] font-bold tracking-[3px] uppercase mt-0.5 ${isAdmin ? "text-[#CC1B1B]" : "text-[#CC1B1B]"}`}>{isAdmin ? "Admin Dashboard" : "Careers Portal"}</span>
          </div>
        </button>
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {isAdmin ? (
                <>
                  {["admin","jobs","applications"].map(p => (
                    <button key={p} onClick={() => setPage(p)} className={`hidden md:flex items-center gap-1.5 px-4 py-2 rounded font-bold text-[12px] tracking-wider uppercase transition-all cursor-pointer border-2 ${page===p ? "bg-[#FFD000] text-[#0A1F5C] border-[#FFD000]" : "text-[#FFD000] border-[#FFD000]/40 hover:border-[#FFD000]"}`}>
                      {p==="admin" && <BarChart2 size={13} />}{p==="jobs" && <Briefcase size={13} />}{p==="applications" && <Users size={13} />}
                      {p==="admin" ? "Overview" : p==="jobs" ? "Manage Jobs" : "Applications"}
                    </button>
                  ))}
                </>
              ) : (
                <button onClick={() => setPage("tracker")} className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded font-bold text-[13px] tracking-wider uppercase transition-all duration-200 border-2 cursor-pointer ${page==="tracker" ? "bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]" : "bg-white/40 text-[#0A1F5C] border-[#0A1F5C] hover:bg-[#0A1F5C] hover:text-[#FFD000]"}`}>
                  <ClipboardList size={15} />My Applications
                  {applications.length > 0 && <span className="bg-[#CC1B1B] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">{applications.length}</span>}
                </button>
              )}
              <div className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-[13px] tracking-wider uppercase ${isAdmin ? "bg-[#FFD000] text-[#0A1F5C]" : "bg-[#0A1F5C] text-[#FFD000]"}`}>
                {isAdmin ? <Shield size={14} /> : <User size={14} />}
                <span className="hidden md:block">{currentUser.firstName}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 bg-[#CC1B1B] text-white px-4 py-2.5 rounded font-bold text-[13px] tracking-wider uppercase hover:opacity-80 transition-all cursor-pointer">
                <LogOut size={14} /><span className="hidden md:block">Logout</span>
              </button>
            </>
          ) : (
            <button onClick={() => setAuthModal("login")} className="flex items-center gap-2 bg-[#0A1F5C] text-[#FFD000] px-7 py-2.5 rounded font-bold text-[15px] tracking-wider uppercase hover:bg-[#CC1B1B] hover:text-white transition-all duration-200 cursor-pointer">
              <LogIn size={16} />Log In
            </button>
          )}
        </div>
      </nav>

      {/* ADMIN PAGES */}
      {isAdmin && page === "admin"        && <AdminOverview jobs={jobs} onNav={setPage} />}
      {isAdmin && page === "jobs"         && <AdminJobs jobs={jobs} onUpdateJobs={updateJobsState} />}
      {isAdmin && page === "applications" && <AdminApplications jobs={jobs} />}

      {/* USER PAGES */}
      {!isAdmin && page === "tracker" && currentUser && (
        <TrackerPage
          applications={applications}
          loading={appLoading}
          onBack={() => setPage("home")}
          user={currentUser}
        />
      )}

      {/* HOME */}
      {(!isAdmin) && page === "home" && (
        <>
          <header className="relative bg-[#0A1F5C] min-h-[88vh] flex items-center justify-center text-center px-6 py-20 overflow-hidden border-b-[6px] border-[#FFD000]">
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,208,0,0.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,208,0,0.06) 40px)" }} />
            <div className="relative z-10">
              <span className="inline-block bg-[#CC1B1B] text-white text-[12px] font-bold tracking-[3px] uppercase px-4 py-1.5 rounded-sm mb-6">Now Hiring</span>
              <h2 className="font-black uppercase leading-[0.9] text-[#FFD000] tracking-tight mb-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(52px,8vw,100px)" }}>
                Shape the Future<span className="block text-white">of Local Governance</span>
              </h2>
              <p className="text-white/75 text-lg max-w-xl mx-auto mt-5 mb-10 leading-relaxed">Join DILG-CARAGA and make a lasting impact in the communities we serve across the Caraga region.</p>
              <a href="#jobs" className="relative z-10 inline-block bg-[#FFD000] text-[#0A1F5C] font-black text-xl tracking-[2px] uppercase px-12 py-5 rounded transition-all duration-200 hover:bg-white hover:-translate-y-1 no-underline" style={{ boxShadow:"0 8px 32px rgba(255,208,0,0.3)", fontFamily:"'Barlow Condensed',sans-serif" }}>View Open Positions</a>
              <div className="relative z-10 flex gap-12 justify-center mt-16 border-t border-[#FFD000]/20 pt-10">
                {[[String(activeJobs.length),"Open Roles",Briefcase],[String(new Set(activeJobs.map(j=>j.department)).size),"Departments",Building2],["1K+","Communities",Globe]].map(([num,label,Icon]) => (
                  <div key={label}>
                    <div className="font-black text-[40px] text-[#FFD000] leading-none" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>{num}</div>
                    <div className="text-white/50 text-[11px] tracking-[2px] uppercase mt-1 flex items-center justify-center gap-1"><Icon size={11} />{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <main id="jobs" className="bg-[#FFFDF0] py-20 px-6">
            <div className="text-center mb-12">
              <span className="inline-block bg-[#FFD000] text-[#0A1F5C] text-[11px] font-extrabold tracking-[3px] uppercase px-3.5 py-1.5 rounded-sm mb-4 border-l-4 border-[#CC1B1B]">Career Opportunities</span>
              <h3 className="font-black text-5xl text-[#0A1F5C] uppercase tracking-tight leading-none" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Open Roles</h3>
              <p className="text-gray-500 mt-2 text-base">Find your place in public service</p>
            </div>
            <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row gap-4 bg-white p-5 rounded-lg border-2 border-[#FFD000]" style={{ boxShadow:"4px 4px 0 #FFD000" }}>
              <input type="text" placeholder="Search positions..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded text-sm text-[#0A1F5C] outline-none focus:border-[#FFD000] transition-colors bg-gray-50" />
              <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded text-sm text-[#0A1F5C] outline-none focus:border-[#FFD000] transition-colors bg-gray-50 cursor-pointer">
                {depts.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
              </select>
            </div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsLoading ? (
                <div className="col-span-3 flex items-center justify-center py-24 gap-3 text-gray-400">
                  <Loader2 size={28} className="animate-spin" /><span className="font-semibold text-[15px]">Loading positions...</span>
                </div>
              ) : filtered.length === 0 ? (
                <p className="col-span-3 text-center text-gray-400 py-12">No positions found.</p>
              ) : filtered.map(job => (
                <div key={job.id} className="group bg-white border-2 border-gray-200 rounded-lg p-6 transition-all duration-200 relative overflow-hidden hover:border-[#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  onMouseEnter={e => e.currentTarget.style.boxShadow="6px 6px 0 #FFD000"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow="none"}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFD000] transition-all duration-200 group-hover:w-[6px] group-hover:bg-[#CC1B1B]" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block bg-[#FFF8D6] text-[#0A1F5C] text-[11px] font-bold tracking-[2px] uppercase px-2.5 py-1 rounded-sm border border-[#FFD000]">{job.department}</span>
                    <span className="text-gray-400 text-xs font-semibold flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                  </div>
                  <h4 className="font-extrabold text-2xl text-[#0A1F5C] uppercase leading-tight group-hover:text-[#CC1B1B] transition-colors mb-1" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>{job.title}</h4>
                  <p className="mb-5"><span className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#0A1F5C] text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm"><Clock size={11} />{job.type}</span></p>
                  <button onClick={() => openApply(job)} className="w-full bg-[#0A1F5C] text-[#FFD000] font-bold text-[15px] tracking-[2px] uppercase py-3 rounded transition-all duration-200 hover:bg-[#CC1B1B] hover:text-white cursor-pointer flex items-center justify-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>
                    View Details<ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {/* JOB MODAL */}
      {selectedJob && !isAdmin && (
        <div className="fixed inset-0 z-[200] bg-[#0A1F5C]/75 backdrop-blur-sm flex items-center justify-center p-5" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden border-t-[6px] border-[#FFD000] relative" style={{ boxShadow:"0 40px 80px rgba(10,31,92,0.3)" }}>
            <button onClick={closeModal} className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-[#CC1B1B] text-gray-500 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer"><X size={15} strokeWidth={2.5} /></button>

            {submitted ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><CheckCircle size={40} className="text-green-500" /></div>
                <h2 className="font-black text-[36px] text-[#0A1F5C] uppercase leading-none mb-3" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Application Submitted!</h2>
                <p className="text-gray-500 text-[15px] max-w-sm leading-relaxed mb-8">Your application for <strong className="text-[#0A1F5C]">{selectedJob.title}</strong> has been received.</p>
                <div className="flex gap-3 flex-wrap justify-center">
                  <button onClick={() => { closeModal(); setPage("tracker"); }} className="flex items-center gap-2 bg-[#0A1F5C] text-[#FFD000] font-bold text-[15px] tracking-[2px] uppercase px-8 py-3.5 rounded hover:bg-[#CC1B1B] hover:text-white transition-all cursor-pointer" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}><ClipboardList size={16} />Track Application</button>
                  <button onClick={closeModal} className="flex items-center gap-2 bg-gray-100 text-[#0A1F5C] font-bold text-[15px] tracking-[2px] uppercase px-8 py-3.5 rounded hover:bg-gray-200 transition-all cursor-pointer" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}><Home size={16} />Back to Jobs</button>
                </div>
              </div>
            ) : !isApplying ? (
              <>
                <div className="flex-1 overflow-y-auto p-10">
                  <p className="text-[12px] font-bold tracking-[3px] uppercase text-[#CC1B1B] mb-2">{selectedJob.department}</p>
                  <h2 className="font-black text-[40px] text-[#0A1F5C] uppercase leading-none mb-3" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>{selectedJob.title}</h2>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1.5"><MapPin size={13} />{selectedJob.location}</span>
                    <span className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1.5"><Clock size={13} />{selectedJob.type}</span>
                  </div>
                  {[
                    {title:"About the Role",    content:<p className="text-gray-600 leading-relaxed text-[15px]">{selectedJob.about}</p>},
                    {title:"What You'll Do",    content:<ul className="list-disc pl-5 space-y-1.5 text-gray-600 text-[15px]">{(selectedJob.responsibilities||[]).map((r,i)=><li key={i}>{r}</li>)}</ul>},
                    {title:"What You Need",     content:<ul className="list-disc pl-5 space-y-1.5 text-gray-600 text-[15px]">{(selectedJob.requirements||[]).map((r,i)=><li key={i}>{r}</li>)}</ul>},
                  ].map(({title,content}) => (
                    <div key={title} className="mb-7">
                      <h3 className="text-[13px] font-bold tracking-[2px] uppercase text-[#0A1F5C] border-b-2 border-[#FFD000] pb-2 mb-3" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>{title}</h3>
                      {content}
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0 p-6 border-t-2 border-gray-100 flex justify-center">
                  <button onClick={() => setIsApplying(true)} className="bg-[#CC1B1B] text-white font-black text-xl tracking-[2px] uppercase px-16 py-4 rounded transition-all duration-200 hover:bg-[#0A1F5C] hover:-translate-y-0.5 cursor-pointer" style={{ fontFamily:"'Barlow Condensed',sans-serif", boxShadow:"0 4px 20px rgba(204,27,27,0.3)" }}>Apply for this Role</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 px-10 pt-7 pb-5 border-b-2 border-gray-100">
                  <button onClick={() => setIsApplying(false)} className="flex items-center gap-1.5 text-[13px] font-bold tracking-wider uppercase text-[#0A1F5C] hover:text-[#CC1B1B] transition-colors mb-3 bg-transparent border-0 cursor-pointer"><ChevronLeft size={14} />Back to Details</button>
                  <div className="font-black text-2xl text-[#0A1F5C] uppercase leading-none mb-1" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Apply — {selectedJob.title}</div>
                  <div className="text-[13px] text-gray-400 font-semibold">Step {step} of 5: <span className="text-[#CC1B1B] font-bold">{STEP_LABELS[step-1]}</span></div>
                </div>
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-gray-50/50">
                  {step===1 && <FormCard title="Personal Information">
                    <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 mb-4">
                      {[["Last Name","lastName","Dela Cruz",true],["First Name","firstName","Juan",true],["M.I.","mi","A.",true]].map(([label,key,ph,req])=>(
                        <div key={key}><label className={labelCls}>{label} {req&&<span className="text-[#CC1B1B]">*</span>}</label><input className={inputCls} placeholder={ph} value={formData[key]} onChange={e=>setFormData({...formData,[key]:e.target.value})} /></div>
                      ))}
                    </div>
                    <div className="mb-4"><label className={labelCls}>Address <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} placeholder="Butuan City, Agusan del Norte" value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} /></div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div><label className={labelCls}>Civil Status <span className="text-[#CC1B1B]">*</span></label><select className={inputCls} value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})}><option value="" disabled>Select</option>{["Single","Married","Widowed","Separated"].map(o=><option key={o}>{o}</option>)}</select></div>
                      <div><label className={labelCls}>Age <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} type="number" placeholder="25" min="18" value={formData.age} onChange={e=>setFormData({...formData,age:e.target.value})} /></div>
                      <div><label className={labelCls}>Sex <span className="text-[#CC1B1B]">*</span></label><select className={inputCls} value={formData.sex} onChange={e=>setFormData({...formData,sex:e.target.value})}><option value="" disabled>Select</option><option>Male</option><option>Female</option></select></div>
                      <div><label className={labelCls}>Contact <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} type="tel" placeholder="0912 345 6789" value={formData.contact} onChange={e=>setFormData({...formData,contact:e.target.value})} /></div>
                      <div><label className={labelCls}>Email <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} type="email" placeholder="email@gov.ph" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} /></div>
                    </div>
                  </FormCard>}
                  {step===2 && <><FormCard title="Tertiary / College">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div><label className={labelCls}>School / University <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} placeholder="Caraga State University" value={eduData.school} onChange={e=>setEduData({...eduData,school:e.target.value})} /></div>
                      <div><label className={labelCls}>Degree / Course <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} placeholder="BS Information Technology" value={eduData.course} onChange={e=>setEduData({...eduData,course:e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelCls}>Year Graduated <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} placeholder="2022" value={eduData.year} onChange={e=>setEduData({...eduData,year:e.target.value})} /></div>
                      <div><label className={labelCls}>Academic Honors</label><input className={inputCls} placeholder="e.g. Cum Laude" value={eduData.honors} onChange={e=>setEduData({...eduData,honors:e.target.value})} /></div>
                    </div>
                  </FormCard>
                  <FormCard title="Graduate Studies (Optional)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelCls}>School / University</label><input className={inputCls} placeholder="Graduate school name" value={eduData.gradSchool} onChange={e=>setEduData({...eduData,gradSchool:e.target.value})} /></div>
                      <div><label className={labelCls}>Year Graduated</label><input className={inputCls} type="number" placeholder="YYYY" value={eduData.gradYear} onChange={e=>setEduData({...eduData,gradYear:e.target.value})} /></div>
                    </div>
                  </FormCard></>}
                  {step===3 && <><FormCard title="Work Experience">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div><label className={labelCls}>Position</label><input className={inputCls} placeholder="e.g. Software Engineer" value={workData.position} onChange={e=>setWorkData({...workData,position:e.target.value})} /></div>
                      <div><label className={labelCls}>Inclusive Dates</label><input className={inputCls} placeholder="2020 – 2023" value={workData.dates} onChange={e=>setWorkData({...workData,dates:e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelCls}>Employer Last Name</label><input className={inputCls} placeholder="Dela Cruz" value={workData.employerLast} onChange={e=>setWorkData({...workData,employerLast:e.target.value})} /></div>
                      <div><label className={labelCls}>Employer First Name</label><input className={inputCls} placeholder="Juan" value={workData.employerFirst} onChange={e=>setWorkData({...workData,employerFirst:e.target.value})} /></div>
                    </div>
                  </FormCard>
                  <FormCard title="Skills & Trainings">
                    <div className="mb-4"><label className={labelCls}>Relevant Trainings <span className="text-[#CC1B1B]">*</span></label><textarea className={`${inputCls} h-24 resize-none`} placeholder="e.g. Leadership Training..." value={workData.trainings} onChange={e=>setWorkData({...workData,trainings:e.target.value})} /></div>
                    <div><label className={labelCls}>Skills <span className="text-[#CC1B1B]">*</span></label><textarea className={`${inputCls} h-24 resize-none`} placeholder="e.g. React, Node.js..." value={workData.skills} onChange={e=>setWorkData({...workData,skills:e.target.value})} /></div>
                  </FormCard></>}
                  {step===4 && <FormCard title="Upload Requirements">
                    <p className="text-[14px] text-gray-500 leading-relaxed mb-6 text-center">Upload your complete application requirements as a single file. Rename it to <strong className="text-[#0A1F5C]">DILG_[Your Name]</strong>. Max 5MB.</p>
                    <div className="relative border-2 border-dashed border-[#FFD000] bg-[#FFF8D6] hover:bg-[#FFD000]/10 rounded-lg p-12 flex flex-col items-center justify-center transition-colors cursor-pointer group">
                      <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e=>{ if(e.target.files?.[0]) setFileName(e.target.files[0].name); }} />
                      <div className="mb-3 transition-transform group-hover:scale-110">{fileName ? <CheckCircle size={48} className="text-green-500" /> : <Upload size={48} className="text-[#0A1F5C]/40" />}</div>
                      {fileName ? <div className="text-[#0A1F5C] font-bold text-base text-center">Attached: <span className="text-green-600 block mt-1">{fileName}</span></div> : <><p className="font-extrabold text-xl text-[#0A1F5C] uppercase tracking-wide" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>Click to Browse or Drop File</p><p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX · Max 5MB</p></>}
                    </div>
                    {fileName && <div className="text-center mt-4"><button type="button" onClick={()=>setFileName("")} className="text-[#CC1B1B] text-sm font-bold underline bg-transparent border-0 cursor-pointer flex items-center gap-1 mx-auto"><X size={13}/>Remove File</button></div>}
                  </FormCard>}
                  {step===5 && <div>
                    <ReviewSection icon={User} title="Personal Information" onEdit={()=>setStep(1)}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2"><p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">Full Name</p><p className="text-[15px] font-semibold text-[#0A1F5C]">{formData.firstName} {formData.mi} {formData.lastName}</p></div>
                        {[["Age",formData.age],["Sex",formData.sex],["Civil Status",formData.status]].map(([l,v])=><div key={l}><p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">{l}</p><p className="text-[15px] font-semibold text-[#0A1F5C]">{v||"—"}</p></div>)}
                        <div className="col-span-2"><p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">Address</p><p className="text-[15px] font-semibold text-[#0A1F5C]">{formData.address||"—"}</p></div>
                        {[["Email",formData.email],["Contact",formData.contact]].map(([l,v])=><div key={l}><p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">{l}</p><p className="text-[15px] font-semibold text-[#0A1F5C]">{v||"—"}</p></div>)}
                      </div>
                    </ReviewSection>
                    <ReviewSection icon={GraduationCap} title="Education" onEdit={()=>setStep(2)}>
                      <p className="text-[15px] font-semibold text-[#0A1F5C]">{eduData.school||"No school provided"}</p>
                      <p className="text-[12px] font-bold tracking-wider uppercase text-gray-400 mt-1">{eduData.course} {eduData.year?`· ${eduData.year}`:""}</p>
                    </ReviewSection>
                    <ReviewSection icon={Briefcase} title="Work Experience" onEdit={()=>setStep(3)}>
                      <div className="grid grid-cols-2 gap-4">
                        {[["Position",workData.position||"N/A"],["Employer",`${workData.employerFirst} ${workData.employerLast}`.trim()||"N/A"],["Dates",workData.dates||"N/A"],["Skills",workData.skills||"N/A"]].map(([l,v])=><div key={l}><p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">{l}</p><p className="text-[15px] font-semibold text-[#0A1F5C]">{v}</p></div>)}
                      </div>
                    </ReviewSection>
                    <ReviewSection icon={FolderOpen} title="Documents" onEdit={()=>setStep(4)}>
                      <div className="flex items-center gap-3 p-3 bg-[#FFF8D6] border border-[#FFD000] rounded-lg">
                        <FileText size={24} className="text-[#0A1F5C] flex-shrink-0" />
                        <div><p className="text-[15px] font-semibold text-[#0A1F5C]">{fileName||"No file attached"}</p><p className="text-[11px] font-bold tracking-wider uppercase text-gray-400">Resume / Application Requirement</p></div>
                      </div>
                    </ReviewSection>
                    <div className="flex items-start gap-3 p-5 bg-[#FFF8D6] border-2 border-[#FFD000] rounded-lg mt-4">
                      <input type="checkbox" required className="mt-0.5 w-4 h-4 cursor-pointer flex-shrink-0 accent-[#0A1F5C]" />
                      <p className="text-[13px] text-[#0A1F5C] leading-relaxed font-medium">I hereby certify that the information above is true and correct to the best of my knowledge.</p>
                    </div>
                  </div>}
                </div>
                <div className="flex-shrink-0 px-10 pt-4 pb-6 border-t-2 border-gray-100 bg-white rounded-b-xl">
                  <div className="flex items-center mb-3">
                    {[1,2,3,4,5].map(s=>{
                      const Icon=STEP_ICONS[s-1];
                      return (<div key={s} className={`flex items-center ${s<5?"flex-1":""}`}>
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${s<step?"bg-[#FFD000] text-[#0A1F5C]":s===step?"bg-[#0A1F5C] text-[#FFD000] ring-4 ring-[#FFD000]/40 scale-110":"bg-gray-200 text-gray-400"}`}><Icon size={13} strokeWidth={2.5}/></div>
                        {s<5&&<div className={`flex-1 h-[3px] mx-1 rounded-full transition-all duration-300 ${s<step?"bg-[#FFD000]":"bg-gray-200"}`}/>}
                      </div>);
                    })}
                  </div>
                  <div className="flex justify-between mb-4">
                    {STEP_LABELS.map((label,i)=><span key={label} className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${i+1===step?"text-[#0A1F5C]":"text-gray-300"}`}>{label}</span>)}
                  </div>
                  <div className="flex justify-between gap-4">
                    <button disabled={step===1} onClick={()=>setStep(p=>Math.max(p-1,1))} className="px-8 py-3.5 bg-gray-100 text-[#0A1F5C] font-bold text-[15px] tracking-[2px] uppercase rounded transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2" style={{fontFamily:"'Barlow Condensed',sans-serif"}}><ChevronLeft size={16}/>Back</button>
                    <button onClick={()=>step===5?handleSubmitApp():setStep(p=>Math.min(p+1,5))} className={`flex-1 max-w-[160px] py-2 font-extrabold text-[16px] tracking-[2px] uppercase rounded transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${step===5?"bg-[#CC1B1B] text-white hover:bg-[#0A1F5C] hover:text-[#FFD000]":"bg-[#FFD000] text-[#0A1F5C] hover:bg-[#CC1B1B] hover:text-white"}`} style={{fontFamily:"'Barlow Condensed',sans-serif",boxShadow:step===5?"0 4px 16px rgba(204,27,27,0.3)":"0 4px 16px rgba(255,208,0,0.3)"}}>
                      {step===5?<><CheckCircle size={16}/>Submit</>:<>Next<ChevronRight size={16}/></>}
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

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose, onLogin, switchMode }) {
  const isLogin = mode === "login";
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const pwRules = validatePassword(password);
  const pwValid = Object.values(pwRules).every(Boolean);

  const handleSubmit = async () => {
    setError("");
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!password)             { setError("Please enter your password."); return; }
    if (!isLogin && !pwValid)  { setError("Password does not meet all requirements."); return; }
    if (!isLogin && (!firstName.trim()||!lastName.trim())) { setError("Please enter your full name."); return; }
    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await signIn(email, password);
      } else {
        await signUp(email, password, firstName.trim(), lastName.trim());
        user = await signIn(email, password);
      }
      onLogin(user);
    } catch (e) {
      // Supabase error messages are user-friendly enough
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0A1F5C]/80 backdrop-blur-sm flex items-center justify-center p-5" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border-t-[6px] border-[#FFD000] relative" style={{boxShadow:"0 40px 80px rgba(10,31,92,0.35)"}}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-[#CC1B1B] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer"><X size={14} strokeWidth={2.5}/></button>
        <div className="bg-[#0A1F5C] px-8 pt-8 pb-6">
          <div className="w-12 h-12 bg-[#FFD000] rounded-xl flex items-center justify-center mb-4"><LogIn size={22} className="text-[#0A1F5C]"/></div>
          <h2 className="font-black text-[28px] text-white uppercase leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{isLogin?"Welcome Back":"Create Account"}</h2>
          <p className="text-white/50 text-[13px] mt-1">{isLogin?"Sign in to continue your application":"Register to start applying for roles"}</p>
        </div>
        <div className="px-8 py-7">
          {error && <div className="flex items-center gap-2.5 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-[13px] font-semibold"><AlertCircle size={16} className="flex-shrink-0"/>{error}</div>}
          {!isLogin && <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className={labelCls}>First Name <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} placeholder="Juan" value={firstName} onChange={e=>setFirstName(e.target.value)}/></div>
            <div><label className={labelCls}>Last Name <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} placeholder="Dela Cruz" value={lastName} onChange={e=>setLastName(e.target.value)}/></div>
          </div>}
          <div className="mb-4"><label className={labelCls}>Email Address <span className="text-[#CC1B1B]">*</span></label>
            <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input className={`${inputCls} pl-10`} type="email" placeholder="email@gov.ph" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/></div>
          </div>
          <div className="mb-5"><label className={labelCls}>Password <span className="text-[#CC1B1B]">*</span></label>
            <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input className={`${inputCls} pl-10 pr-11`} type={showPw?"text":"password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
              <button type="button" onClick={()=>setShowPw(p=>!p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A1F5C] cursor-pointer bg-transparent border-0">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
          </div>
          {!isLogin && password.length>0 && <div className="mb-5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 space-y-1.5">
            {[[pwRules.length,"At least 8 characters"],[pwRules.upper,"One uppercase letter"],[pwRules.number,"One number"]].map(([ok,label])=>(
              <div key={label} className={`flex items-center gap-2 text-[12px] font-semibold ${ok?"text-green-600":"text-gray-400"}`}><CheckCircle size={13} className={ok?"text-green-500":"text-gray-300"}/>{label}</div>
            ))}
          </div>}
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#CC1B1B] text-white font-black text-[17px] tracking-[2px] uppercase py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0A1F5C] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{fontFamily:"'Barlow Condensed',sans-serif",boxShadow:"0 4px 20px rgba(204,27,27,0.25)"}}>
            {loading?<Loader2 size={18} className="animate-spin"/>:<><ArrowRight size={18}/>{isLogin?"Sign In":"Create Account"}</>}
          </button>
          <p className="text-center text-[13px] text-gray-500 mt-5">{isLogin?"Don't have an account?":"Already have an account?"}{" "}
            <button onClick={()=>switchMode(isLogin?"register":"login")} className="text-[#CC1B1B] font-bold underline bg-transparent border-0 cursor-pointer hover:text-[#0A1F5C] transition-colors">{isLogin?"Register here":"Sign in"}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── TRACKER PAGE ─────────────────────────────────────────────────────────────
function TrackerPage({ applications, loading, onBack, user }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter==="All" ? applications : applications.filter(a=>a.status===filter);
  const statusCounts = ALL_STATUSES.reduce((acc,s)=>{acc[s]=applications.filter(a=>a.status===s).length;return acc;},{});

  return (
    <div className="min-h-screen bg-[#FFFDF0]">
      <div className="bg-[#0A1F5C] border-b-[6px] border-[#FFD000] px-6 md:px-12 py-10">
        <div className="max-w-5xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[#FFD000]/60 hover:text-[#FFD000] text-[12px] font-bold tracking-[2px] uppercase mb-5 bg-transparent border-0 cursor-pointer transition-colors"><ChevronLeft size={14}/>Back to Jobs</button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-black text-[48px] text-[#FFD000] uppercase leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>My Applications</h1>
              <p className="text-white/50 mt-1 text-[14px]">Signed in as <span className="text-white font-semibold">{user.firstName} {user.lastName}</span> · {user.email}</p>
            </div>
            <div className="bg-[#FFD000] text-[#0A1F5C] px-5 py-3 rounded-lg text-center min-w-[80px]">
              <div className="font-black text-[32px] leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{applications.length}</div>
              <div className="text-[10px] font-bold tracking-[2px] uppercase">Total Applied</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {ALL_STATUSES.map(s=>{const cfg=STATUS_CONFIG[s];const Icon=cfg.icon;return(
              <div key={s} className="flex items-center gap-1.5 bg-white/10 text-white/80 text-[12px] font-semibold px-3 py-1.5 rounded-full">
                <Icon size={12} style={{color:cfg.color}}/>{cfg.label}: <span className="font-black ml-0.5 text-white">{statusCounts[s]}</span>
              </div>
            );})}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {["All",...ALL_STATUSES].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`px-4 py-2 rounded-lg text-[12px] font-bold tracking-[1px] uppercase transition-all cursor-pointer border-2 ${filter===s?"bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]":"bg-white text-gray-500 border-gray-200 hover:border-[#FFD000]"}`}>
              {s==="All"?`All (${applications.length})`:`${STATUS_CONFIG[s].label} (${statusCounts[s]})`}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin"/><span className="font-semibold">Loading applications...</span>
          </div>
        ) : filtered.length===0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-gray-100">
            <ClipboardList size={48} className="text-gray-200 mx-auto mb-4"/>
            <p className="font-black text-[22px] text-gray-300 uppercase" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{applications.length===0?"No Applications Yet":"No results for this filter"}</p>
            {applications.length===0&&<button onClick={onBack} className="mt-5 inline-flex items-center gap-2 bg-[#FFD000] text-[#0A1F5C] font-bold text-[14px] tracking-[2px] uppercase px-8 py-3 rounded-lg cursor-pointer hover:bg-[#0A1F5C] hover:text-[#FFD000] transition-all" style={{fontFamily:"'Barlow Condensed',sans-serif"}}><Briefcase size={16}/>Browse Open Roles</button>}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(app=>{
              const cfg=STATUS_CONFIG[app.status]||STATUS_CONFIG["Submitted"];
              const StatusIcon=cfg.icon;
              const statusIdx=ALL_STATUSES.indexOf(app.status);
              return (
                <div key={app.id} className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden transition-all duration-200 hover:border-[#FFD000]"
                  onMouseEnter={e=>e.currentTarget.style.boxShadow="4px 4px 0 #FFD000"}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                  <div className="flex items-start justify-between px-6 py-5 gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-block bg-[#FFF8D6] text-[#0A1F5C] text-[11px] font-bold tracking-[2px] uppercase px-2.5 py-0.5 rounded-sm border border-[#FFD000]">{app.department}</span>
                        <span className="text-gray-400 text-[12px] flex items-center gap-1"><MapPin size={11}/>{app.location}</span>
                        <span className="text-gray-400 text-[12px] flex items-center gap-1"><Clock size={11}/>{app.type}</span>
                      </div>
                      <h3 className="font-extrabold text-[22px] text-[#0A1F5C] uppercase leading-tight" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{app.jobTitle}</h3>
                      <p className="text-[12px] text-gray-400 mt-1 flex items-center gap-1"><Calendar size={11}/>Applied {app.appliedAt}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[13px] tracking-wide flex-shrink-0" style={{background:cfg.bg,color:cfg.color}}><StatusIcon size={15}/>{cfg.label}</div>
                  </div>
                  <div className="px-6 pb-6 pt-1">
                    <div className="relative flex items-start justify-between">
                      <div className="absolute left-3.5 right-3.5 top-[13px] h-[3px] bg-gray-100 z-0"/>
                      <div className="absolute left-3.5 top-[13px] h-[3px] z-0 transition-all duration-700" style={{background:"#FFD000",width:statusIdx<=0?"0%":`calc(${(statusIdx/(ALL_STATUSES.length-1))*100}% - 0px)`}}/>
                      {ALL_STATUSES.map((s,i)=>{
                        const sCfg=STATUS_CONFIG[s];const SIcon=sCfg.icon;
                        const done=i<statusIdx;const current=i===statusIdx;const isRej=app.status==="Rejected"&&current;
                        return (
                          <div key={s} className="relative z-10 flex flex-col items-center gap-2" style={{minWidth:56}}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isRej?"bg-red-500 border-red-500 text-white scale-125 ring-4 ring-red-200":current?"bg-[#0A1F5C] border-[#0A1F5C] text-[#FFD000] scale-125 ring-4 ring-[#FFD000]/30":done?"bg-[#FFD000] border-[#FFD000] text-[#0A1F5C]":"bg-white border-gray-200 text-gray-300"}`}><SIcon size={13} strokeWidth={2}/></div>
                            <span className={`text-[9px] font-bold tracking-wider uppercase text-center leading-tight max-w-[56px] ${current?(isRej?"text-red-500":"text-[#0A1F5C]"):done?"text-gray-400":"text-gray-300"}`}>{sCfg.label.replace(" / ","/\n")}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN OVERVIEW ───────────────────────────────────────────────────────────
function AdminOverview({ jobs, onNav }) {
  const [allApps, setAllApps]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchAllApplications()
      .then(setAllApps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeJobs    = jobs.filter(j=>j.active!==false);
  const depts         = [...new Set(jobs.map(j=>j.department))];
  const uniqueEmails  = [...new Set(allApps.map(a=>a.applicantEmail))];
  const statusCounts  = ALL_STATUSES.reduce((acc,s)=>{acc[s]=allApps.filter(a=>a.status===s).length;return acc;},{});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1F5C] px-8 py-10 border-b-4 border-[#FFD000]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#FFD000]/60 text-[12px] font-bold tracking-[3px] uppercase mb-1">Admin Dashboard</p>
          <h1 className="font-black text-[42px] text-white uppercase leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>Overview</h1>
          <p className="text-white/40 text-[13px] mt-1">DILG-CARAGA Careers Management System</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label:"Total Applications", value:allApps.length,     icon:ClipboardList, color:"#6366F1", bg:"#EEF2FF" },
            { label:"Active Job Postings", value:activeJobs.length,  icon:Briefcase,    color:"#F59E0B", bg:"#FFFBEB" },
            { label:"Departments",         value:depts.length,       icon:Layers,       color:"#10B981", bg:"#ECFDF5" },
            { label:"Total Applicants",    value:uniqueEmails.length, icon:Users,        color:"#3B82F6", bg:"#EFF6FF" },
          ].map(({ label, value, icon:Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-[#FFD000] transition-all" onMouseEnter={e=>e.currentTarget.style.boxShadow="4px 4px 0 #FFD000"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{background:bg}}><Icon size={20} style={{color}}/></div>
              <div className="font-black text-[32px] text-[#0A1F5C] leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{loading ? "—" : value}</div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-100 p-6 mb-6">
          <h2 className="font-black text-[20px] text-[#0A1F5C] uppercase mb-5 flex items-center gap-2" style={{fontFamily:"'Barlow Condensed',sans-serif"}}><BarChart2 size={18}/>Application Status Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {ALL_STATUSES.map(s=>{
              const cfg=STATUS_CONFIG[s];const Icon=cfg.icon;const count=statusCounts[s];const pct=allApps.length>0?Math.round((count/allApps.length)*100):0;
              return (
                <div key={s} className="rounded-lg p-4 text-center" style={{background:cfg.bg}}>
                  <Icon size={20} className="mx-auto mb-2" style={{color:cfg.color}}/>
                  <div className="font-black text-[28px] leading-none" style={{color:cfg.color,fontFamily:"'Barlow Condensed',sans-serif"}}>{loading ? "—" : count}</div>
                  <div className="text-[10px] font-bold tracking-wider uppercase mt-1" style={{color:cfg.color}}>{cfg.label}</div>
                  <div className="text-[11px] font-semibold mt-1" style={{color:cfg.color,opacity:0.7}}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={()=>onNav("jobs")} className="bg-[#0A1F5C] text-[#FFD000] rounded-xl p-6 text-left hover:bg-[#CC1B1B] transition-all cursor-pointer border-2 border-transparent hover:border-[#FFD000] group">
            <Briefcase size={28} className="mb-3"/>
            <div className="font-black text-[22px] uppercase" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>Manage Job Postings</div>
            <p className="text-[#FFD000]/60 text-[13px] mt-1">Add, edit or remove job listings</p>
            <ChevronRight size={18} className="mt-3 group-hover:translate-x-1 transition-transform"/>
          </button>
          <button onClick={()=>onNav("applications")} className="bg-white text-[#0A1F5C] rounded-xl p-6 text-left hover:border-[#FFD000] transition-all cursor-pointer border-2 border-gray-200 group"
            onMouseEnter={e=>e.currentTarget.style.boxShadow="4px 4px 0 #FFD000"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <Users size={28} className="mb-3 text-[#6366F1]"/>
            <div className="font-black text-[22px] uppercase" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>View Applications</div>
            <p className="text-gray-400 text-[13px] mt-1">Review and manage applicants by department</p>
            <ChevronRight size={18} className="mt-3 group-hover:translate-x-1 transition-transform text-[#6366F1]"/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN JOBS ───────────────────────────────────────────────────────────────
function AdminJobs({ jobs, onUpdateJobs }) {
  const [editingJob, setEditingJob]     = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch]             = useState("");
  const DEPTS = ["Engineering","Human Resources","Design","Administration","Communications"];
  const TYPES = ["Full-time","Part-time","Contract","Internship"];

  const emptyJob = { title:"", department:"Engineering", location:"", type:"Full-time", about:"", active:true, responsibilities:[""], requirements:[""] };
  const filtered = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase()));

  const handleSave   = (job) => { onUpdateJobs("save",   job);                                  setShowForm(false); setEditingJob(null); };
  const handleDelete = (id)  => { onUpdateJobs("delete", id);                                   setDeleteConfirm(null); };
  const handleToggle = (job) => { onUpdateJobs("toggle", { id:job.id, active:!job.active }); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1F5C] px-8 py-8 border-b-4 border-[#FFD000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#FFD000]/60 text-[12px] font-bold tracking-[3px] uppercase mb-1">Admin</p>
            <h1 className="font-black text-[38px] text-white uppercase leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>Manage Job Postings</h1>
            <p className="text-white/40 text-[13px] mt-1">{jobs.filter(j=>j.active!==false).length} active · {jobs.filter(j=>j.active===false).length} inactive</p>
          </div>
          <button onClick={()=>{setEditingJob({...emptyJob});setShowForm(true);}} className="flex items-center gap-2 bg-[#FFD000] text-[#0A1F5C] font-black text-[15px] tracking-[2px] uppercase px-6 py-3 rounded-lg hover:bg-white transition-all cursor-pointer" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>
            <Plus size={18}/>Add New Job
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center gap-3 mb-6 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-[#FFD000] transition-colors">
          <Search size={16} className="text-gray-400 flex-shrink-0"/>
          <input type="text" placeholder="Search jobs..." value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 outline-none text-[15px] text-[#0A1F5C] bg-transparent"/>
        </div>

        <div className="space-y-3">
          {filtered.map(job => {
            const dc = DEPT_COLORS[job.department] || { bg:"#F3F4F6", text:"#374151" };
            return (
              <div key={job.id} className={`bg-white border-2 rounded-xl px-6 py-5 flex items-center gap-4 flex-wrap transition-all ${job.active===false?"border-gray-200 opacity-60":"border-gray-200 hover:border-[#FFD000]"}`}
                onMouseEnter={e=>job.active!==false&&(e.currentTarget.style.boxShadow="4px 4px 0 #FFD000")}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-bold tracking-[2px] uppercase px-2.5 py-0.5 rounded-full" style={{background:dc.bg,color:dc.text}}>{job.department}</span>
                    <span className="text-gray-400 text-[12px] flex items-center gap-1"><MapPin size={11}/>{job.location}</span>
                    <span className="text-gray-400 text-[12px] flex items-center gap-1"><Clock size={11}/>{job.type}</span>
                    {job.active===false && <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactive</span>}
                  </div>
                  <h3 className="font-extrabold text-[20px] text-[#0A1F5C] uppercase" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{job.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>handleToggle(job)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase cursor-pointer border-2 transition-all ${job.active===false?"border-green-300 text-green-600 hover:bg-green-50":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    {job.active===false?"Activate":"Deactivate"}
                  </button>
                  <button onClick={()=>{setEditingJob({...job, responsibilities:[...(job.responsibilities||[])], requirements:[...(job.requirements||[])]});setShowForm(true);}} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] text-[#6366F1] rounded-lg text-[11px] font-bold tracking-wider uppercase cursor-pointer hover:bg-[#6366F1] hover:text-white transition-all border-2 border-[#6366F1]/20">
                    <Edit3 size={12}/>Edit
                  </button>
                  <button onClick={()=>setDeleteConfirm(job.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[11px] font-bold tracking-wider uppercase cursor-pointer hover:bg-red-500 hover:text-white transition-all border-2 border-red-200">
                    <Trash2 size={12}/>Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border-t-4 border-red-500">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={28} className="text-red-500"/></div>
            <h3 className="font-black text-[22px] text-[#0A1F5C] uppercase mb-2" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>Delete Job?</h3>
            <p className="text-gray-500 text-[14px] mb-6">This action cannot be undone. The job posting will be permanently removed.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>setDeleteConfirm(null)} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={()=>handleDelete(deleteConfirm)} className="px-6 py-2.5 bg-red-500 text-white font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-red-600 transition-all flex items-center gap-2"><Trash2 size={14}/>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && editingJob && <JobFormModal job={editingJob} depts={DEPTS} types={TYPES} onSave={handleSave} onClose={()=>{setShowForm(false);setEditingJob(null);}} />}
    </div>
  );
}

// ─── JOB FORM MODAL ──────────────────────────────────────────────────────────
function JobFormModal({ job, depts, types, onSave, onClose }) {
  const [form, setForm] = useState({ ...job, responsibilities:[...(job.responsibilities||[""]) ], requirements:[...(job.requirements||[""])] });
  const isNew = !job.id;

  const setArr = (key, idx, val) => setForm(f => { const arr=[...f[key]]; arr[idx]=val; return {...f,[key]:arr}; });
  const addArr = (key) => setForm(f => ({...f,[key]:[...f[key],""]}));
  const delArr = (key, idx) => setForm(f => ({...f,[key]:f[key].filter((_,i)=>i!==idx)}));

  return (
    <div className="fixed inset-0 z-[300] bg-[#0A1F5C]/80 backdrop-blur-sm flex items-center justify-center p-5" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-t-[6px] border-[#FFD000]" style={{boxShadow:"0 40px 80px rgba(10,31,92,0.3)"}}>
        <div className="sticky top-0 bg-[#0A1F5C] px-8 py-5 flex items-center justify-between z-10">
          <h2 className="font-black text-[24px] text-[#FFD000] uppercase" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{isNew?"Add New Job":"Edit Job"}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-[#CC1B1B] text-white rounded-full flex items-center justify-center cursor-pointer border-0"><X size={14}/></button>
        </div>
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Job Title <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} placeholder="e.g. Software Engineer" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div><label className={labelCls}>Department <span className="text-[#CC1B1B]">*</span></label><select className={inputCls} value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}>{depts.map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label className={labelCls}>Location <span className="text-[#CC1B1B]">*</span></label><input className={inputCls} placeholder="e.g. Butuan City" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
            <div><label className={labelCls}>Type <span className="text-[#CC1B1B]">*</span></label><select className={inputCls} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{types.map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <div><label className={labelCls}>About the Role <span className="text-[#CC1B1B]">*</span></label><textarea className={`${inputCls} h-24 resize-none`} placeholder="Describe the role..." value={form.about} onChange={e=>setForm(f=>({...f,about:e.target.value}))}/></div>
          <div>
            <label className={labelCls}>Responsibilities</label>
            {form.responsibilities.map((r,i)=>(
              <div key={i} className="flex gap-2 mb-2">
                <input className={inputCls} placeholder={`Responsibility ${i+1}`} value={r} onChange={e=>setArr("responsibilities",i,e.target.value)}/>
                {form.responsibilities.length>1&&<button onClick={()=>delArr("responsibilities",i)} className="w-10 h-[46px] flex-shrink-0 bg-red-50 text-red-400 rounded border-2 border-red-200 hover:bg-red-500 hover:text-white cursor-pointer flex items-center justify-center transition-all"><X size={14}/></button>}
              </div>
            ))}
            <button onClick={()=>addArr("responsibilities")} className="flex items-center gap-1.5 text-[12px] font-bold tracking-wider uppercase text-[#6366F1] hover:text-[#0A1F5C] cursor-pointer bg-transparent border-0 mt-1"><Plus size={14}/>Add Responsibility</button>
          </div>
          <div>
            <label className={labelCls}>Requirements</label>
            {form.requirements.map((r,i)=>(
              <div key={i} className="flex gap-2 mb-2">
                <input className={inputCls} placeholder={`Requirement ${i+1}`} value={r} onChange={e=>setArr("requirements",i,e.target.value)}/>
                {form.requirements.length>1&&<button onClick={()=>delArr("requirements",i)} className="w-10 h-[46px] flex-shrink-0 bg-red-50 text-red-400 rounded border-2 border-red-200 hover:bg-red-500 hover:text-white cursor-pointer flex items-center justify-center transition-all"><X size={14}/></button>}
              </div>
            ))}
            <button onClick={()=>addArr("requirements")} className="flex items-center gap-1.5 text-[12px] font-bold tracking-wider uppercase text-[#6366F1] hover:text-[#0A1F5C] cursor-pointer bg-transparent border-0 mt-1"><Plus size={14}/>Add Requirement</button>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all">Cancel</button>
            <button onClick={()=>onSave(form)} className="flex-1 flex items-center justify-center gap-2 bg-[#0A1F5C] text-[#FFD000] font-black text-[16px] uppercase py-3 rounded-lg cursor-pointer hover:bg-[#CC1B1B] hover:text-white transition-all" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>
              <Save size={16}/>{isNew?"Post Job":"Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN APPLICATIONS ───────────────────────────────────────────────────────
function AdminApplications({ jobs }) {
  const [allApps, setAllApps]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeDept, setActiveDept]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQ, setSearchQ]           = useState("");
  const [viewApp, setViewApp]           = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAllApplications()
      .then(setAllApps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const depts = ["All", ...new Set(allApps.map(a => a.department))];

  const filtered = allApps.filter(a => {
    const matchDept   = activeDept==="All"    || a.department===activeDept;
    const matchStatus = statusFilter==="All"  || a.status===statusFilter;
    const matchSearch = !searchQ || a.applicantName?.toLowerCase().includes(searchQ.toLowerCase()) || a.jobTitle?.toLowerCase().includes(searchQ.toLowerCase()) || a.applicantEmail?.toLowerCase().includes(searchQ.toLowerCase());
    return matchDept && matchStatus && matchSearch;
  });

  const byDept = depts.filter(d=>d!=="All").reduce((acc,d)=>{ acc[d]=filtered.filter(a=>a.department===d); return acc; },{});

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setAllApps(prev => prev.map(a => a.id===appId ? {...a,status:newStatus} : a));
      if (viewApp && viewApp.id===appId) setViewApp({...viewApp,status:newStatus});
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (appId) => {
    try {
      await deleteApplication(appId);
      setAllApps(prev => prev.filter(a => a.id!==appId));
      setDeleteConfirm(null);
      if (viewApp?.id===appId) setViewApp(null);
    } catch(e) { console.error(e); }
  };

  const exportCSV = () => {
    const rows = [["Name","Email","Job","Department","Location","Type","Status","Applied Date"],...filtered.map(a=>[a.applicantName||"",a.applicantEmail||"",a.jobTitle||"",a.department||"",a.location||"",a.type||"",a.status||"",a.appliedAt||""])];
    const csv  = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href=url; a.download="dilg_applications.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1F5C] px-8 py-8 border-b-4 border-[#FFD000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#FFD000]/60 text-[12px] font-bold tracking-[3px] uppercase mb-1">Admin</p>
            <h1 className="font-black text-[38px] text-white uppercase leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>Applications</h1>
            <p className="text-white/40 text-[13px] mt-1">{allApps.length} total · categorized by department</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-[#FFD000] text-[#0A1F5C] font-black text-[14px] tracking-[2px] uppercase px-6 py-3 rounded-lg hover:bg-white transition-all cursor-pointer" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>
            <Download size={16}/>Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className={labelCls}>Search</label>
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Name, email or job..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} className={`${inputCls} pl-9 py-2.5`}/></div>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={`${inputCls} py-2.5`} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="text-[13px] font-semibold text-gray-400 self-center pt-5">{filtered.length} result{filtered.length!==1?"s":""}</div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {depts.map(d=>{
            const count = d==="All" ? filtered.length : filtered.filter(a=>a.department===d).length;
            const dc = DEPT_COLORS[d]||{bg:"#F3F4F6",text:"#374151"};
            return (
              <button key={d} onClick={()=>setActiveDept(d)} className={`px-4 py-2 rounded-lg text-[12px] font-bold tracking-[1px] uppercase transition-all cursor-pointer border-2 flex items-center gap-1.5 ${activeDept===d?"bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]":"bg-white text-gray-500 border-gray-200 hover:border-[#FFD000]"}`}>
                {d} <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${activeDept===d?"bg-[#FFD000] text-[#0A1F5C]":"bg-gray-100 text-gray-500"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin"/><span className="font-semibold">Loading applications...</span>
          </div>
        ) : allApps.length===0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-gray-100">
            <Users size={48} className="text-gray-200 mx-auto mb-4"/>
            <p className="font-black text-[22px] text-gray-300 uppercase" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>No Applications Yet</p>
          </div>
        ) : activeDept==="All" ? (
          <div className="space-y-8">
            {Object.entries(byDept).filter(([,apps])=>apps.length>0).map(([dept,apps])=>(
              <DeptSection key={dept} dept={dept} apps={apps} onView={setViewApp} onDelete={setDeleteConfirm} onStatusChange={handleStatusChange}/>
            ))}
            {Object.values(byDept).every(a=>a.length===0) && <div className="text-center py-16 text-gray-400 font-semibold">No applications match your filters.</div>}
          </div>
        ) : (
          <DeptSection dept={activeDept} apps={filtered} onView={setViewApp} onDelete={setDeleteConfirm} onStatusChange={handleStatusChange}/>
        )}
      </div>

      {viewApp && <ApplicantModal app={viewApp} onClose={()=>setViewApp(null)} onStatusChange={(s)=>handleStatusChange(viewApp.id,s)} onDelete={()=>setDeleteConfirm(viewApp.id)}/>}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border-t-4 border-red-500">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={28} className="text-red-500"/></div>
            <h3 className="font-black text-[22px] text-[#0A1F5C] uppercase mb-2" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>Delete Application?</h3>
            <p className="text-gray-500 text-[14px] mb-6">This will permanently remove this application record.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>setDeleteConfirm(null)} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={()=>handleDelete(deleteConfirm)} className="px-6 py-2.5 bg-red-500 text-white font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-red-600 transition-all flex items-center gap-2"><Trash2 size={14}/>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// DeptSection — no changes needed, but update onStatusChange signature
function DeptSection({ dept, apps, onView, onDelete, onStatusChange }) {
  const dc = DEPT_COLORS[dept]||{bg:"#F3F4F6",text:"#374151"};
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-100" style={{background:dc.bg}}>
        <div className="flex items-center gap-3">
          <Building2 size={18} style={{color:dc.text}}/>
          <h2 className="font-black text-[20px] uppercase" style={{color:dc.text,fontFamily:"'Barlow Condensed',sans-serif"}}>{dept}</h2>
          <span className="font-black text-[13px] px-2.5 py-0.5 rounded-full text-white" style={{background:dc.text}}>{apps.length}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_STATUSES.map(s=>{
            const count=apps.filter(a=>a.status===s).length;
            if(!count) return null;
            const cfg=STATUS_CONFIG[s];
            return <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:cfg.bg,color:cfg.color}}>{cfg.label}: {count}</span>;
          })}
        </div>
      </div>
      {apps.length===0 ? (
        <div className="px-6 py-8 text-center text-gray-400 text-[13px] font-semibold">No applications for this department.</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {apps.map(app=>{
            const cfg=STATUS_CONFIG[app.status]||STATUS_CONFIG["Submitted"];
            return (
              <div key={app.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors flex-wrap">
                <div className="w-10 h-10 bg-[#0A1F5C] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FFD000] font-black text-[14px]">{(app.applicantName||"?")[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-[#0A1F5C]">{app.applicantName||"Unknown Applicant"}</p>
                  <p className="text-[12px] text-gray-400">{app.applicantEmail} · {app.jobTitle} · <span className="text-gray-500">{app.appliedAt}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={app.status} onChange={e=>onStatusChange(app.id,e.target.value)} className="text-[12px] font-bold px-3 py-1.5 rounded-lg border-2 cursor-pointer outline-none transition-all" style={{borderColor:cfg.color,color:cfg.color,background:cfg.bg}}>
                    {ALL_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={()=>onView(app)} className="flex items-center gap-1 px-3 py-1.5 bg-[#EEF2FF] text-[#6366F1] rounded-lg text-[11px] font-bold uppercase cursor-pointer hover:bg-[#6366F1] hover:text-white transition-all border-2 border-[#6366F1]/20"><Eye size={12}/>View</button>
                  <button onClick={()=>onDelete(app.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-400 rounded-lg text-[11px] font-bold uppercase cursor-pointer hover:bg-red-500 hover:text-white transition-all border-2 border-red-200"><Trash2 size={12}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ApplicantModal({ app, onClose, onStatusChange, onDelete }) {
  const cfg = STATUS_CONFIG[app.status]||STATUS_CONFIG["Submitted"];
  const fd  = app.formData||{};
  const ed  = app.eduData||{};
  const wd  = app.workData||{};

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-[12px] font-extrabold tracking-widest uppercase text-[#0A1F5C] border-b-2 border-[#FFD000] pb-2 mb-4">
        <span className="w-1 h-4 bg-[#CC1B1B] rounded-sm flex-shrink-0 block"/>{title}
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }) => (
    <div><p className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">{label}</p><p className="text-[14px] font-semibold text-[#0A1F5C]">{value||"—"}</p></div>
  );

  return (
    <div className="fixed inset-0 z-[350] bg-[#0A1F5C]/80 backdrop-blur-sm flex items-center justify-center p-5" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-t-[6px] border-[#FFD000]" style={{boxShadow:"0 40px 80px rgba(10,31,92,0.3)"}}>
        <div className="bg-[#0A1F5C] px-8 py-6 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#FFD000]/60 text-[11px] font-bold tracking-[3px] uppercase mb-1">{app.department} · {app.jobTitle}</p>
              <h2 className="font-black text-[26px] text-white uppercase leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{app.applicantName||"Unknown"}</h2>
              <p className="text-white/50 text-[13px] mt-1">{app.applicantEmail} · Applied {app.appliedAt}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-[#CC1B1B] text-white rounded-full flex items-center justify-center cursor-pointer border-0 flex-shrink-0"><X size={14}/></button>
          </div>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="text-[13px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{background:cfg.bg,color:cfg.color}}><cfg.icon size={14}/>{app.status}</span>
            <select value={app.status} onChange={e=>onStatusChange(e.target.value)} className="text-[12px] font-bold px-3 py-1.5 rounded-lg border-2 cursor-pointer outline-none bg-white text-[#0A1F5C] border-gray-200">
              <option value="" disabled>Change status...</option>
              {ALL_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <Section title="Personal Information">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Full Name" value={app.applicantName}/>
              <Field label="Age" value={fd.age}/>
              <Field label="Sex" value={fd.sex}/>
              <Field label="Civil Status" value={fd.status}/>
              <Field label="Contact" value={fd.contact}/>
              <Field label="Email" value={fd.email||app.applicantEmail}/>
              <div className="col-span-2 md:col-span-3"><Field label="Address" value={fd.address}/></div>
            </div>
          </Section>
          <Section title="Education">
            <div className="grid grid-cols-2 gap-4">
              <Field label="School / University" value={ed.school}/>
              <Field label="Degree / Course" value={ed.course}/>
              <Field label="Year Graduated" value={ed.year}/>
              <Field label="Academic Honors" value={ed.honors}/>
              {ed.gradSchool && <><Field label="Graduate School" value={ed.gradSchool}/><Field label="Grad Year" value={ed.gradYear}/></>}
            </div>
          </Section>
          <Section title="Work Experience">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Position" value={wd.position}/>
              <Field label="Inclusive Dates" value={wd.dates}/>
              <Field label="Employer Last Name" value={wd.employerLast}/>
              <Field label="Employer First Name" value={wd.employerFirst}/>
            </div>
            <Field label="Relevant Trainings" value={wd.trainings}/>
            <div className="mt-3"><Field label="Skills" value={wd.skills}/></div>
          </Section>
          {app.fileName && <Section title="Uploaded Document">
            <div className="flex items-center gap-3 p-3 bg-[#FFF8D6] border border-[#FFD000] rounded-lg">
              <FileText size={22} className="text-[#0A1F5C] flex-shrink-0"/>
              <div><p className="text-[14px] font-semibold text-[#0A1F5C]">{app.fileName}</p><p className="text-[11px] uppercase font-bold tracking-wider text-gray-400">Attached Document</p></div>
            </div>
          </Section>}
        </div>

        <div className="flex-shrink-0 px-8 py-4 border-t-2 border-gray-100 flex justify-between items-center">
          <button onClick={onDelete} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 rounded-lg font-bold text-[13px] uppercase cursor-pointer hover:bg-red-500 hover:text-white transition-all border-2 border-red-200"><Trash2 size={14}/>Delete Application</button>
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}