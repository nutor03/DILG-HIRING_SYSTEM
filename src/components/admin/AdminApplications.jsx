import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import {
  Download,
  Search,
  Users,
  Loader2,
  Building2,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Table,
} from "lucide-react";
import {
  fetchAllApplications,
  updateApplicationStatus,
  deleteApplication,
  updateApplicationSchedule,
} from "../../supabaseClient";
import {
  ALL_STATUSES,
  STATUS_CONFIG,
} from "../../utils/constants";

// FIXED HELPER: Takes the applicant name and formats it cleanly!
const getCleanFileName = (fileName, applicantName) => {
  if (!fileName) return "Document.pdf";
  if (fileName.startsWith("http")) {
    // If they have a name, replace spaces with underscores. Otherwise fallback to "Applicant"
    const safeName = applicantName ? applicantName.replace(/\s+/g, '_') : "Applicant";
    return `DILG_APPLICATIONLETTER_${safeName}.pdf`;
  }
  return fileName;
};

function ApplicantModal({
  app,
  onClose,
  onStatusChange,
  onDelete,
  onSchedule,
  onDownload,
}) {
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["Submitted"];

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-[12px] font-extrabold tracking-widest uppercase text-[#0A1F5C] border-b-2 border-[#FFD000] pb-2 mb-4">
        <span className="w-1 h-4 bg-[#CC1B1B] rounded-sm flex-shrink-0 block" />
        {title}
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }) => (
    <div>
      <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">
        {label}
      </p>
      <p className="text-[14px] font-semibold text-[#0A1F5C]">{value || "—"}</p>
    </div>
  );

  const handleSetSchedule = () => {
    if (!interviewDate) return;
    if (onSchedule) onSchedule(app.id, interviewDate, app);
    setShowDatePicker(false);
  };

  // 1st Call Site: Pass both the fileName and the applicantName
  const cleanName = getCleanFileName(app.fileName, app.applicantName);

  return (
    <>
      <div
        className="fixed inset-0 z-[350] bg-[#0A1F5C]/80 backdrop-blur-sm flex items-center justify-center p-5"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-t-[6px] border-[#FFD000]"
          style={{ boxShadow: "0 40px 80px rgba(10,31,92,0.3)" }}
        >
          <div className="bg-[#0A1F5C] px-8 py-6 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[#FFD000]/60 text-[11px] font-bold tracking-[3px] uppercase mb-1">
                  {app.jobTitle} {app.category ? `• ${app.category}` : ""}
                </p>
                <h2
                  className="font-black text-[26px] text-white uppercase leading-none"
                  style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                >
                  {app.applicantName || "Unknown"}
                </h2>
                <p className="text-white/50 text-[13px] mt-1">
                  {app.applicantEmail} · Applied {app.appliedAt}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/10 hover:bg-[#CC1B1B] text-white rounded-full flex items-center justify-center cursor-pointer border-0 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4 flex-wrap w-full">
              <span
                className="text-[13px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                <cfg.icon size={14} />
                {app.status}
              </span>

              <select
                value={
                  ["Approved / Hired", "Rejected"].includes(app.status)
                    ? app.status
                    : ""
                }
                onChange={(e) => onStatusChange(e.target.value)}
                className="text-[12px] font-bold px-3 py-1.5 rounded-lg border-2 cursor-pointer outline-none bg-white text-[#0A1F5C] border-gray-200"
              >
                {!["Approved / Hired", "Rejected"].includes(app.status) && (
                  <option value="" disabled>
                    Update Status...
                  </option>
                )}
                <option value="Approved / Hired">Approved / Hired</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                onClick={() => setShowDatePicker(true)}
                className="text-[12px] font-bold px-4 py-1.5 rounded-lg border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white cursor-pointer transition-colors flex items-center gap-2 ml-auto"
              >
                <Calendar size={14} />
                Schedule Interview
              </button>
            </div>

            {app.interviewDate && (
              <div className="mt-4 bg-white/10 rounded-lg px-4 py-3 flex items-center gap-3 border border-white/20">
                <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-white">
                  <Clock size={14} />
                </div>
                <div>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                    Interview Scheduled For
                  </p>
                  <p className="text-white font-semibold text-[14px]">
                    {new Date(app.interviewDate).toLocaleString("en-PH", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <Section title="Personal Information">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Full Name" value={app.applicantName} />
                <Field label="Age" value={app.applicantAge} />
                <Field label="Sex" value={app.applicantSex} />
                <Field label="Civil Status" value={app.applicantStatus} />
                <Field label="Contact" value={app.applicantContact} />
                <Field label="Email" value={app.applicantEmail} />
                <div className="col-span-2 md:col-span-3">
                  <Field label="Address" value={app.applicantAddress} />
                </div>
              </div>
            </Section>
            <Section title="Education">
              <div className="grid grid-cols-2 gap-4">
                <Field label="School / University" value={app.eduSchool} />
                <Field label="Degree / Course" value={app.eduCourse} />
                <Field label="Year Graduated" value={app.eduYear} />
                <Field label="Academic Honors" value={app.eduHonors} />
                {app.eduGradSchool && (
                  <>
                    <Field label="Graduate School" value={app.eduGradSchool} />
                    <Field label="Grad Year" value={app.eduGradYear} />
                  </>
                )}
              </div>
            </Section>
            <Section title="Work Experience">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Position" value={app.workPosition} />
                <Field label="Inclusive Dates" value={app.workDates} />
                <Field
                  label="Employer Last Name"
                  value={app.workEmployerName}
                />
                <Field
                  label="Employer First Name"
                  value={app.workEmployerFirstName}
                />
              </div>
              <Field label="Relevant Trainings" value={app.workTrainings} />
              <div className="mt-3">
                <Field label="Skills" value={app.workSkills} />
              </div>
            </Section>
            
            {app.fileName && (
              <Section title="Uploaded Document">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onDownload(app.fileUrl || app.fileName, cleanName);
                  }}
                  className="flex items-center text-left w-full gap-3 p-3 bg-[#FFF8D6] border border-[#FFD000] rounded-lg hover:bg-[#FFD000]/20 transition-all cursor-pointer group"
                >
                  <FileText size={22} className="text-[#0A1F5C] flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#0A1F5C] underline truncate" title={cleanName}>
                      {cleanName}
                    </p>
                    <p className="text-[11px] uppercase font-bold tracking-wider text-gray-500 mt-0.5">
                      Click to securely download
                    </p>
                  </div>
                </button>
              </Section>
            )}
          </div>

          <div className="flex-shrink-0 px-8 py-4 border-t-2 border-gray-100 flex justify-between items-center">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 rounded-lg font-bold text-[13px] uppercase cursor-pointer hover:bg-red-500 hover:text-white transition-all border-2 border-red-200"
            >
              <Trash2 size={14} />
              Delete Application
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showDatePicker && (
        <div className="fixed inset-0 z-[400] bg-black/60 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm border-t-4 border-[#3B82F6]">
            <h3
              className="font-black text-[20px] text-[#0A1F5C] uppercase mb-4"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              Set Interview Schedule
            </h3>
            <div className="mb-6">
              <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
                Select Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#3B82F6]"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 font-bold text-[13px] uppercase rounded-lg cursor-pointer hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSetSchedule}
                className="px-4 py-2 bg-[#3B82F6] text-white font-bold text-[13px] uppercase rounded-lg cursor-pointer hover:bg-blue-600 flex items-center gap-2"
              >
                <Calendar size={14} />
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DeptSection({ dept, apps, onView, onDelete, onStatusChange, onDownload }) {
  const dc = { bg: "#F3F4F6", text: "#374151" };
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden mb-8">
      <div
        className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-100"
        style={{ background: dc.bg }}
      >
        <div className="flex items-center gap-3">
          <Building2 size={18} style={{ color: dc.text }} />
          <h2
            className="font-black text-[20px] uppercase"
            style={{
              color: dc.text,
              fontFamily: "'Barlow Condensed',sans-serif",
            }}
          >
            {dept}
          </h2>
          <span
            className="font-black text-[13px] px-2.5 py-0.5 rounded-full text-white"
            style={{ background: dc.text }}
          >
            {apps.length}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_STATUSES.map((s) => {
            const count = apps.filter((a) => a.status === s).length;
            if (!count) return null;
            const cfg = STATUS_CONFIG[s];
            return (
              <span
                key={s}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                {cfg.label}: {count}
              </span>
            );
          })}
        </div>
      </div>
      {apps.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-400 text-[13px] font-semibold">
          No applications for this position.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {apps.map((app) => {
            
            return (
              <div
                key={app.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors flex-wrap"
              >
                <div className="w-10 h-10 bg-[#0A1F5C] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FFD000] font-black text-[14px]">
                    {(app.applicantName || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-[#0A1F5C]">
                    {app.applicantName || "Unknown Applicant"}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {app.applicantEmail} · <span className="font-bold text-[#0A1F5C] ml-1">{app.jobTitle}</span> 
                    {app.category && <span className="font-bold text-[#CC1B1B] ml-1">({app.category})</span>} · <span className="text-gray-500">{app.appliedAt}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  
                  <button
                    onClick={() => onView(app)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#EEF2FF] text-[#6366F1] rounded-lg text-[11px] font-bold uppercase cursor-pointer hover:bg-[#6366F1] hover:text-white transition-all border-2 border-[#6366F1]/20"
                  >
                    <Eye size={12} />
                    View
                  </button>
                  <button
                    onClick={() => onDelete(app.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-400 rounded-lg text-[11px] font-bold uppercase cursor-pointer hover:bg-red-500 hover:text-white transition-all border-2 border-red-200"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminApplications({ jobs }) {
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePosition, setActivePosition] = useState("All");
  
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [viewApp, setViewApp] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isTableView, setIsTableView] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchAllApplications()
      .then(setAllApps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const enhancedApps = allApps.map(a => {
    const parentJob = jobs.find(j => j.id === a.jobId) || {};
    return { ...a, category: a.category || parentJob.category || "" };
  });

  const positions = ["All", ...new Set(enhancedApps.map((a) => a.jobTitle))];

  const filtered = enhancedApps.filter((a) => {
    const matchPosition = activePosition === "All" || a.jobTitle === activePosition;
    const matchCategory = categoryFilter === "All" || a.category === categoryFilter;
    const matchSearch = !searchQ || a.applicantName?.toLowerCase().includes(searchQ.toLowerCase()) || a.jobTitle?.toLowerCase().includes(searchQ.toLowerCase()) || a.applicantEmail?.toLowerCase().includes(searchQ.toLowerCase());
    return matchPosition && matchCategory && matchSearch;
  });

  const byPosition = positions.filter((p) => p !== "All").reduce((acc, p) => {
    acc[p] = filtered.filter((a) => a.jobTitle === p);
    return acc;
  }, {});

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setAllApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
      if (viewApp && viewApp.id === appId) setViewApp({ ...viewApp, status: newStatus });
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (appId) => {
    try {
      await deleteApplication(appId);
      setAllApps((prev) => prev.filter((a) => a.id !== appId));
      setDeleteConfirm(null);
      if (viewApp?.id === appId) setViewApp(null);
    } catch (e) { console.error(e); }
  };

  const handleViewApplication = (app) => {
    if (app.status === "Submitted") {
      setViewApp({ ...app, status: "Under Review" });
      handleStatusChange(app.id, "Under Review");
    } else {
      setViewApp(app);
    }
  };

  const handleScheduleInterview = async (appId, dateString, appData) => {
    try {
      await updateApplicationSchedule(appId, dateString);
      const formattedDate = new Date(dateString).toLocaleString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      await emailjs.send('service_ri46s4j', 'template_s6snbrn', { to_email: appData.applicantEmail, to_name: appData.applicantName, job_title: appData.jobTitle, interview_date: formattedDate }, 'nJqou_X7K0KLsw_4p');
      setAllApps((prev) => prev.map((a) => a.id === appId ? { ...a, status: "Interview Scheduled", interviewDate: dateString } : a));
      if (viewApp && viewApp.id === appId) setViewApp({ ...viewApp, status: "Interview Scheduled", interviewDate: dateString });
      alert("Interview scheduled and email notification sent successfully!");
    } catch (e) {
      console.error("Scheduling error:", e);
      alert("Failed to schedule interview or send email. Please check your console.");
    }
  };

  const forceDownload = async (fileUrl, originalName) => {
    if (!fileUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = originalName; 
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(fileUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Applicant Name", "Email", "Contact", "Age", "Sex", "Civil Status", "Address",
      "Job Title", "Job Category", "Location", "Status", "Applied Date", "Interview Date",
      "School/University", "Degree/Course", "Year Graduated", "Academic Honors",
      "Graduate School", "Grad School Year",
      "Work Position", "Work Dates", "Employer Name", "Trainings", "Skills",
      "File Name", "File Link"
    ];

    const rows = [
      headers,
      ...filtered.map((a) => [
        a.applicantName || "",
        a.applicantEmail || "",
        a.applicantContact || "",
        a.applicantAge || "",
        a.applicantSex || "",
        a.applicantStatus || "",
        a.applicantAddress || "",
        a.jobTitle || "",
        a.category || "",
        a.location || "",
        a.status || "",
        a.appliedAt || "",
        a.interviewDate ? new Date(a.interviewDate).toLocaleString() : "",
        a.eduSchool || "",
        a.eduCourse || "",
        a.eduYear || "",
        a.eduHonors || "",
        a.eduGradSchool || "",
        a.eduGradYear || "",
        a.workPosition || "",
        a.workDates || "",
        a.workEmployerName || "",
        a.workTrainings || "",
        a.workSkills || "",
        
        // 2nd Call Site: Updated to pass the applicant name!
        getCleanFileName(a.fileName, a.applicantName) || "",
        
        a.fileUrl || ""
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DILG_Applicant_Data_Export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {isDownloading && (
        <div className="fixed inset-0 z-[500] bg-white/70 backdrop-blur-sm flex items-center justify-center">
           <div className="bg-[#0A1F5C] px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border-2 border-[#FFD000]">
             <Loader2 size={24} className="text-[#FFD000] animate-spin" />
             <span className="text-white font-bold tracking-wider uppercase text-sm">Downloading File...</span>
           </div>
        </div>
      )}

      <div className="bg-[#0A1F5C] px-8 py-8 border-b-4 border-[#FFD000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#FFD000]/60 text-[12px] font-bold tracking-[3px] uppercase mb-1">Admin</p>
            <h1 className="font-black text-[38px] text-white uppercase leading-none" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>Applications</h1>
            <p className="text-white/40 text-[13px] mt-1">{allApps.length} total · categorized by position</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-[#FFD000] text-[#0A1F5C] font-black text-[14px] tracking-[2px] uppercase px-6 py-3 rounded-lg hover:bg-white transition-all cursor-pointer" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
            <Download size={16} /> Export Full Data CSV
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 py-8">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">Search</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Name, email or job..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="w-full pl-9 px-4 py-2.5 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000]" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">Category</label>
            <select className="px-4 py-2.5 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Plantilla">Plantilla</option>
              <option value="Contract of Service">Contract of Service</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-transparent mb-1.5 cursor-default select-none">View</label>
            <button onClick={() => setIsTableView(!isTableView)} className={`px-5 py-2.5 border-2 rounded font-bold text-[13px] tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${isTableView ? "bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]" : "bg-white text-[#0A1F5C] border-gray-200 hover:border-[#FFD000]"}`}>
              <Table size={16} /> {isTableView ? "Board View" : "Table View"}
            </button>
          </div>
          <div className="text-[13px] font-semibold text-gray-400 self-center pt-5">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {!isTableView && (
          <div className="flex flex-wrap gap-2 mb-6">
            {positions.map((p) => {
              const count = p === "All" ? filtered.length : filtered.filter((a) => a.jobTitle === p).length;
              return (
                <button key={p} onClick={() => setActivePosition(p)} className={`px-4 py-2 rounded-lg text-[12px] font-bold tracking-[1px] uppercase transition-all cursor-pointer border-2 flex items-center gap-1.5 ${activePosition === p ? "bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]" : "bg-white text-gray-500 border-gray-200 hover:border-[#FFD000]"}`}>
                  {p} <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${activePosition === p ? "bg-[#FFD000] text-[#0A1F5C]" : "bg-gray-100 text-gray-500"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400"><Loader2 size={28} className="animate-spin" /><span className="font-semibold">Loading applications...</span></div>
        ) : allApps.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-gray-100"><Users size={48} className="text-gray-200 mx-auto mb-4" /><p className="font-black text-[22px] text-gray-300 uppercase" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>No Applications Yet</p></div>
        ) : isTableView ? (
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#0A1F5C] text-[#FFD000]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider sticky left-0 bg-[#0A1F5C] z-10">Action</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Job Title</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Job Category</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Date Applied</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Applicant Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Age/Sex/Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Education</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Recent Experience</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Application Letter</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Worksheet Requirements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] text-gray-700">
                {filtered.map(app => {
                  // 3rd Call Site: Updated to pass the applicant name!
                  const cleanName = getCleanFileName(app.fileName, app.applicantName);
                  
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-gray-50 border-r border-gray-100 flex items-center gap-2">
                        <button onClick={() => handleViewApplication(app)} className="p-1.5 bg-[#EEF2FF] text-[#6366F1] rounded hover:bg-[#6366F1] hover:text-white transition-colors"><Eye size={14} /></button>
                        <button onClick={() => setDeleteConfirm(app.id)} className="p-1.5 bg-red-50 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                      </td>
                      <td className="px-4 py-3">
                        <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)} className="text-[11px] font-bold px-2 py-1 rounded border border-gray-200 outline-none">
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0A1F5C]">{app.jobTitle}</td>
                      <td className="px-4 py-3 text-gray-500">{app.category ? <span className="bg-[#EEF2FF] px-2 py-1 rounded text-[11px] font-bold tracking-wider uppercase text-[#0A1F5C] border border-[#0A1F5C]/10">{app.category}</span> : "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{app.appliedAt}</td>
                      <td className="px-4 py-3 font-bold">{app.applicantName}</td>
                      <td className="px-4 py-3">{app.applicantEmail}</td>
                      <td className="px-4 py-3">{app.applicantContact}</td>
                      <td className="px-4 py-3">{app.applicantAge} • {app.applicantSex?.charAt(0)} • {app.applicantStatus}</td>
                      <td className="px-4 py-3 truncate max-w-[200px]" title={app.applicantAddress}>{app.applicantAddress}</td>
                      <td className="px-4 py-3">{app.eduCourse} ({app.eduYear})</td>
                      <td className="px-4 py-3">{app.workPosition}</td>
                      <td className="px-4 py-3">
                        {app.fileName ? (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              forceDownload(app.fileUrl || app.fileName, cleanName);
                            }}
                            className="flex items-center gap-1 text-[#3B82F6] hover:text-blue-700 font-semibold cursor-pointer underline bg-transparent border-0 p-0 text-left max-w-[150px]"
                            title={cleanName}
                          >
                            <FileText size={14} className="shrink-0" /> 
                            <span className="truncate">{cleanName}</span>
                          </button>
                        ) : (
                          <span className="text-gray-300">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(byPosition).filter(([, apps]) => apps.length > 0).map(([position, apps]) => (
              <DeptSection key={position} dept={position} apps={apps} onView={handleViewApplication} onDelete={setDeleteConfirm} onStatusChange={handleStatusChange} onDownload={forceDownload} />
            ))}
          </div>
        )}
      </div>

      {viewApp && <ApplicantModal app={viewApp} onClose={() => setViewApp(null)} onStatusChange={(s) => handleStatusChange(viewApp.id, s)} onDelete={() => setDeleteConfirm(viewApp.id)} onSchedule={handleScheduleInterview} onDownload={forceDownload} />}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border-t-4 border-red-500">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={28} className="text-red-500" /></div>
            <h3 className="font-black text-[22px] text-[#0A1F5C] uppercase mb-2" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>Delete Application?</h3>
            <p className="text-gray-500 text-[14px] mb-6">This will permanently remove this application record.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-6 py-2.5 bg-red-500 text-white font-bold text-[14px] uppercase rounded-lg cursor-pointer hover:bg-red-600 transition-all flex items-center gap-2"><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}