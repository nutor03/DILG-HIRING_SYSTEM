import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  ChevronRight,
  Building2,
  Globe,
  LogIn,
  LogOut,
  ClipboardList,
  Users,
  BarChart2,
  Shield,
  User,
  Briefcase,
  Loader2,
} from "lucide-react";

// Services
import {
  getSession,
  fetchJobs,
  saveJob,
  deleteJob,
  toggleJob,
  submitApplication,
  fetchMyApplications,
  uploadApplicantDocument,
  signOut,
} from "./supabaseClient";

// Constants & Shared

// Pages & Modals
import AuthModal from "./components/auth/AuthModal";
import TrackerPage from "./components/user/TrackerPage";
import AdminOverview from "./components/admin/AdminOverview";
import AdminJobs from "./components/admin/AdminJobs";
import AdminApplications from "./components/admin/AdminApplications";
import JobDetailsModal from "./components/modals/JobDetailsModal";
import ApplicationModal from "./components/modals/ApplicationModal";
import SuccessModal from "./components/modals/SuccessModal";

export default function App() {
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [pendingJob, setPendingJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Home state
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    if (user.role === "admin") {
      setPage("admin");
      return;
    }
    loadMyApplications(user.email);
    if (pendingJob) {
      setSelectedJob(pendingJob);
      setIsApplying(false);
      setPendingJob(null);
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
    if (!currentUser) {
      setPendingJob(job);
      setAuthModal("login");
      return;
    }
    if (isAdmin) return;
    setSelectedJob(job);
  };

  const updateJobsState = async (action, payload) => {
    try {
      if (action === "save") await saveJob(payload);
      if (action === "delete") await deleteJob(payload);
      if (action === "toggle") await toggleJob(payload.id, payload.active);
      await loadJobs();
    } catch (e) {
      console.error("Job update failed:", e);
      alert("Operation failed. Please try again.");
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setIsApplying(false);
  };

  const activeJobs = jobs.filter((j) => j.active !== false);
  const depts = ["All", ...new Set(activeJobs.map((j) => j.category))];
  const filtered = activeJobs.filter((j) => {
    const matchDept = selectedDept === "All" || j.category === selectedDept;
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF0] text-[#0A1F5C]">
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => {
            setAuthModal(null);
            setPendingJob(null);
          }}
          onLogin={handleLogin}
          switchMode={(m) => setAuthModal(m)}
        />
      )}

      {/* NAVBAR */}
      <nav
        className={`border-b-[5px] sticky top-0 z-50 shadow-md flex items-center justify-between px-6 md:px-10 h-[72px] md:px-4 md:py-2 xl:px-3 xl:py-1.5 ${isAdmin ? "bg-[#0A1F5C] border-[#FFD000]" : "bg-[#FFD000] border-[#CC1B1B]"}`}
      >
        <button
          onClick={() => setPage(isAdmin ? "admin" : "home")}
          className="flex items-center gap-3.5 bg-transparent border-0 cursor-pointer"
        >
          <img
            src="/DILG_LOGO.png"
            alt="DILG Logo"
            className="w-12 h-12 rounded-lg object-contain"
          />
          <div className="leading-none text-left">
          <h1
            className={`font-bold tracking-wide uppercase transition-all duration-300 text-sm sm:text-base md:text-xl  ${isAdmin ? "text-[#FFD000]" : "text-[#0A1F5C]"}`}
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            Department of the Interior and Local Government - Caraga
          </h1>
          <span
            className={`block font-bold tracking-[3px] uppercase mt-0.5 transition-all duration-300 text-[9px] sm:text-[10px]  ${isAdmin ? "text-[#CC1B1B]" : "text-[#CC1B1B]"}`}
          >
            {isAdmin ? "Admin Dashboard" : "Careers Portal"}
          </span>
        </div>
        </button>
        <div className="flex items-center gap-2 md:gap-3">
          {currentUser ? (
            <>
              {isAdmin ? (
                <>
                  {["admin", "jobs", "applications"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                     
                      className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 xl:px-3 xl:py-1.5 rounded font-bold uppercase transition-all cursor-pointer border-2 text-[11px] md:text-[12px] xl:text-[11px] ${page === p ? "bg-[#FFD000] text-[#0A1F5C] border-[#FFD000]" : "text-[#FFD000] border-[#FFD000]/40 hover:border-[#FFD000]"}`}
                    >
                      {p === "admin" && <BarChart2 size={13} />}
                      {p === "jobs" && <Briefcase size={13} />}
                      {p === "applications" && <Users size={13} />}
                      {p === "admin"
                        ? "Overview"
                        : p === "jobs"
                          ? "Manage Jobs"
                          : "Applications"}
                    </button>
                  ))}
                </>
              ) : (
                <button
                  onClick={() => setPage("tracker")}
                  // Responsive scaling for 'My Applications' button
                  className={`hidden md:flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 xl:px-4 xl:py-2 rounded font-bold uppercase transition-all duration-200 border-2 cursor-pointer text-[11px] md:text-[13px] xl:text-[12px] ${page === "tracker" ? "bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]" : "bg-white/40 text-[#0A1F5C] border-[#0A1F5C] hover:bg-[#0A1F5C] hover:text-[#FFD000]"}`}
                >
                  <ClipboardList size={14} className="md:w-[15px] md:h-[15px]" />
                  My Applications
                  {applications.length > 0 && (
                    <span className="bg-[#CC1B1B] text-white text-[9px] md:text-[10px] font-black rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                      {applications.length}
                    </span>
                  )}
                </button>
              )}
              <div
                // Responsive scaling for Name display
                className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded font-bold uppercase text-[11px] md:text-[13px] xl:text-[12px] ${isAdmin ? "bg-[#FFD000] text-[#0A1F5C]" : "bg-[#0A1F5C] text-[#FFD000]"}`}
              >
                {isAdmin ? <Shield size={13} className="md:w-[14px] md:h-[14px]" /> : <User size={13} className="md:w-[14px] md:h-[14px]" />}
                <span className="hidden md:block">{currentUser.firstName}</span>
              </div>
              <button
                onClick={handleLogout}
                // Responsive scaling for Logout button
                className="flex items-center gap-1.5 bg-[#CC1B1B] text-white px-3 py-1.5 md:px-4 md:py-2.5 xl:px-3 xl:py-2 rounded font-bold uppercase hover:opacity-80 transition-all cursor-pointer text-[11px] md:text-[13px] xl:text-[12px]"
              >
                <LogOut size={13} className="md:w-[14px] md:h-[14px]" />
                <span className="hidden md:block">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setAuthModal("login")}
              // Responsive scaling for Login button
              className="flex items-center gap-2 bg-[#0A1F5C] text-[#FFD000] px-5 py-2 md:px-7 md:py-2.5 xl:px-5 xl:py-2 rounded font-bold uppercase hover:bg-[#CC1B1B] hover:text-white transition-all duration-200 cursor-pointer text-[13px] md:text-[15px] xl:text-[13px]"
            >
              <LogIn size={15} className="md:w-[16px] md:h-[16px]" />
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* ADMIN PAGES */}
      {isAdmin && page === "admin" && (
        <AdminOverview jobs={jobs} onNav={setPage} />
      )}
      {isAdmin && page === "jobs" && (
        <AdminJobs jobs={jobs} onUpdateJobs={updateJobsState} />
      )}
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
      {!isAdmin && page === "home" && (
        <>
          <header className="relative bg-[#0A1F5C] min-h-[88vh] flex items-center justify-center text-center px-6 py-20 overflow-hidden border-b-[6px] border-[#FFD000]">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,208,0,0.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,208,0,0.06) 40px)",
              }}
            />
            <div className="relative z-10">
              <span className="inline-block bg-[#CC1B1B] text-white text-[12px] font-bold tracking-[3px] uppercase px-4 py-1.5 rounded-sm mb-6">
                Now Hiring
              </span>
              <h2
                className="font-black uppercase leading-[0.9] text-[#FFD000] tracking-tight mb-2"
                style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
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
                  fontFamily: "'Barlow Condensed',sans-serif",
                }}
              >
                View Open Positions
              </a>
              <div className="relative z-10 flex gap-12 justify-center mt-16 border-t border-[#FFD000]/20 pt-10">
                {[
                  [String(activeJobs.length), "Open Roles", Briefcase],
                  [
                    String(new Set(activeJobs.map((j) => j.category)).size),
                    "Categories",
                    Building2,
                  ],
                  ["1K+", "Communities", Globe],
                ].map(([num, label, Icon]) => (
                  <div key={label}>
                    <div
                      className="font-black text-[40px] text-[#FFD000] leading-none"
                      style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                    >
                      {num}
                    </div>
                    <div className="text-white/50 text-[11px] tracking-[2px] uppercase mt-1 flex items-center justify-center gap-1">
                      <Icon size={11} />
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <main id="jobs" className="bg-[#FFFDF0] py-20 px-6">
            <div className="flex flex-col h-full text-center mb-12">
              <span className="inline-block bg-[#FFD000] text-[#0A1F5C] text-[11px] font-extrabold tracking-[3px] uppercase px-3.5 py-1.5 rounded-sm mb-4 border-l-4 border-[#CC1B1B]">
                Career Opportunities
              </span>
              <h3
                className="font-black text-5xl text-[#0A1F5C] uppercase tracking-tight leading-none"
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                Open Roles
              </h3>
              <p className="text-gray-500 mt-2 text-base">
                Find your place in public service
              </p>
            </div>
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
                    {d === "All" ? "All Category" : d}
                  </option>
                ))}
              </select>
            </div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsLoading ? (
                <div className="col-span-3 flex items-center justify-center py-24 gap-3 text-gray-400">
                  <Loader2 size={28} className="animate-spin" />
                  <span className="font-semibold text-[15px]">
                    Loading positions...
                  </span>
                </div>
              ) : filtered.length === 0 ? (
                <p className="col-span-3 text-center text-gray-400 py-12">
                  No positions found.
                </p>
              ) : (
                filtered.map((job) => (
                  <div
                    key={job.id}
                    // 1. ADDED: flex, flex-col, and h-full here
                    className="group flex flex-col h-full bg-white border-2 border-gray-200 rounded-lg p-6 transition-all duration-200 relative overflow-hidden hover:border-[#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow = "6px 6px 0 #FFD000")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "none")
                    }
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFD000] transition-all duration-200 group-hover:w-[6px] group-hover:bg-[#CC1B1B] " />

                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block bg-[#FFF8D6] text-[#0A1F5C] text-[11px] font-bold tracking-[2px] uppercase px-2.5 py-1 rounded-sm border border-[#FFD000]">
                        {job.category}
                      </span>
                      <span className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                        <MapPin size={12} />
                        {job.location}
                      </span>
                    </div>

                    <h4
                      className="font-extrabold text-2xl text-[#0A1F5C] uppercase leading-tight group-hover:text-[#CC1B1B] transition-colors mb-1"
                      style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                    >
                      {job.title}
                    </h4>

                    {/* 1. Added mt-auto here, changed gap-2 to justify-between, and adjusted margin-bottom to mb-4 */}
                    <div className="mt-auto text-gray-400 text-xs font-semibold flex items-center justify-between mb-4 uppercase w-full">
                      <span className="flex items-center gap-1">
                        <Users size={15} />
                        {job.noOfPersonNeeded} Vacancy{" "}
                        {job.noOfPersonNeeded !== 1 ? "" : "Vacancies"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={15} />
                        {job.dateOfPublication}
                      </span>
                    </div>

                    <button
                      onClick={() => openApply(job)}
                      // 2. Removed mt-auto from the button since the div above handles it now
                      className="w-full bg-[#0A1F5C] text-[#FFD000] font-bold text-[15px] tracking-[2px] uppercase py-3 rounded transition-all duration-200 hover:bg-[#CC1B1B] hover:text-white cursor-pointer flex items-center justify-center gap-2"
                      style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                    >
                      View Details
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </main>
        </>
      )}

      {/* JOB DETAILS MODAL */}
      {selectedJob && !isAdmin && !isApplying && !showSuccess && (
        <JobDetailsModal
          job={selectedJob}
          onClose={closeModal}
          onApply={() => setIsApplying(true)}
        />
      )}

      {/* NEW APPLICATION FORM MODAL */}
      {selectedJob && !isAdmin && isApplying && !showSuccess && (
        <ApplicationModal
        job={selectedJob}
        currentUser={currentUser}
        onClose={closeModal}
        onSubmit={async (collectedData) => {
          try {
            // 1. Upload the file first (if they attached one)
            let fileUrl = "";
            if (collectedData.workData.workExpFile) {
              fileUrl = await uploadApplicantDocument(
                collectedData.workData.workExpFile,
              );
            }

            // 2. Filter out blank experiences to prevent [""] bugs
            const validExperiences = collectedData.workData.experiences.filter(
              (exp) => exp.work_employer_name.trim() !== "" || exp.work_position.trim() !== ""
            );

            // 3. Map the valid data and join it into a single clean string
            const finalWorkEmployer = validExperiences.map(exp => exp.work_employer_name).filter(Boolean).join(" | ") || null;
            const finalWorkPosition = validExperiences.map(exp => exp.work_position).filter(Boolean).join(" | ") || null;
            const finalWorkDates = validExperiences.map(exp => exp.work_dates).filter(Boolean).join(" | ") || null;


            const app = {
              jobId: selectedJob.id,
              jobTitle: selectedJob.title,
              location: selectedJob.location,
              category: selectedJob.category,
              applicant_email: currentUser.email,
              applicant_name:
                `${collectedData.formData.firstName} ${collectedData.formData.mi} ${collectedData.formData.lastName}`.trim(),
              applicant_age: collectedData.formData.age,
              applicant_address: collectedData.formData.address,
              applicant_status: collectedData.formData.status,
              applicant_sex: collectedData.formData.sex,
              applicant_contact: collectedData.formData.contact,
              edu_school: collectedData.eduData.school,
              edu_course: collectedData.eduData.course,
              edu_year: collectedData.eduData.year,
              edu_honors: collectedData.eduData.honors,
              eligibility: collectedData.eduData.eligibility,
              edu_grad_school: collectedData.eduData.gradSchool,
              edu_grad_year: collectedData.eduData.gradYear,
              unitEarn: collectedData.eduData.unitEarn,
              work_skills: collectedData.workData.work_skills,
              work_trainings: collectedData.workData.work_trainings,
              work_position: finalWorkPosition,
              work_dates: finalWorkDates,
              work_employer_name: finalWorkEmployer,
              worksheet_file: fileUrl,
            };
            
            console.log("Final application data to submit:", app);
            await submitApplication(app);
            await loadMyApplications(currentUser.email);

            // Show Success Modal instead of JS Alert!
            setIsApplying(false);
            setShowSuccess(true);
          } catch (e) {
            console.error("Failed to submit application:", e);
            alert("Submission failed. Please try again.");
          }
        }}
      />
      )}

      {/* NEW SUCCESS MODAL */}
      {showSuccess && (
        <SuccessModal
          onClose={() => {
            setShowSuccess(false);
            closeModal();
          }}
          onGoToDashboard={() => {
            setShowSuccess(false);
            closeModal();
            setPage("tracker"); // Sends them directly to TrackerPage
          }}
        />
      )}
    </div>
  );
}
