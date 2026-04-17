import React, { useState, useEffect } from "react";
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
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  supabase,
  fetchAllApplications,
  updateApplicationStatus,
  deleteApplication,
  updateApplicationSchedule,
} from "../../supabaseClient";
import { ALL_STATUSES, STATUS_CONFIG } from "../../utils/constants";

const getCleanFileName = (fileName, applicantName) => {
  if (!fileName) return "Document.pdf";
  if (fileName.startsWith("http")) {
    const safeName = applicantName
      ? applicantName.replace(/\s+/g, "_")
      : "Applicant";
    return `DILG_APPLICATIONLETTER_${safeName}.pdf`;
  }
  return fileName;
};

// HELPER: Convert 24hr time (14:30) to 12hr time (2:30 PM)
const formatTime = (time24) => {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedH = hours % 12 || 12;
  return `${formattedH}:${m} ${ampm}`;
};

// --- DYNAMIC MODAL CONFIGURATION ---
const ACTION_MODAL_CONFIG = {
  "Approved / Hired": {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-100",
    border: "border-green-500",
    title: "Approve Applicant",
    desc: "Send an official approval and onboarding email to the applicant.",
    buttonText: "Approve & Send Email",
    buttonColor: "bg-green-500 hover:bg-green-600",
  },
  "Rejected w/ Reason": {
    icon: Mail,
    color: "text-red-500",
    bg: "bg-red-100",
    border: "border-red-500",
    title: "Reject with Reason",
    buttonText: "Reject & Send Email",
    buttonColor: "bg-red-500 hover:bg-red-600",
    hasInput: true,
    inputType: "textarea",
  },
  "Rejected w/ No Reason": {
    icon: XCircle,
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-500",
    title: "Generic Rejection",
    desc: "Send a polite, standard rejection email without specific reasons.",
    buttonText: "Reject & Send Email",
    buttonColor: "bg-gray-500 hover:bg-gray-600",
  },
  Schedule: {
    icon: Calendar,
    color: "text-[#3B82F6]",
    bg: "bg-[#EFF6FF]",
    border: "border-[#3B82F6]",
    title: "Schedule Interview",
    buttonText: "Save & Send Invitation",
    buttonColor: "bg-[#3B82F6] hover:bg-blue-600",
    hasInput: true,
    inputType: "schedule-multi", // 🚀 Updated to custom input type
  },
};

function ApplicantModal({
  app,
  onClose,
  onStatusChange,
  onDelete,
  onScheduleClick,
  onDownload,
}) {
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["Submitted"];

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

  const cleanName = getCleanFileName(app.fileName, app.applicantName);

  return (
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
                [
                  "Approved / Hired",
                  "Rejected w/ Reason",
                  "Rejected w/ No Reason",
                ].includes(app.status)
                  ? app.status
                  : ""
              }
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-[12px] font-bold px-3 py-1.5 rounded-lg border-2 cursor-pointer outline-none bg-white text-[#0A1F5C] border-gray-200"
            >
              {![
                "Approved / Hired",
                "Rejected w/ Reason",
                "Rejected w/ No Reason",
              ].includes(app.status) && (
                <option value="" disabled>
                  Update Status...
                </option>
              )}
              <option value="Approved / Hired">Approved / Hired</option>
              <option value="Rejected w/ Reason">Rejected w/ Reason</option>
              <option value="Rejected w/ No Reason">
                Rejected w/ No Reason
              </option>
            </select>
            <button
              onClick={() => onScheduleClick(app)}
              className="text-[12px] font-bold px-4 py-1.5 rounded-lg border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white cursor-pointer transition-colors flex items-center gap-2 ml-auto"
            >
              <Calendar size={14} /> Schedule Interview
            </button>
          </div>

          {app.interviewDate && (
            <div className="mt-4 bg-white/10 rounded-lg px-4 py-3 flex items-center gap-3 border border-white/20">
              <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-white flex-shrink-0">
                <Clock size={14} />
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                  Interview Scheduled For
                </p>
                <p className="text-white font-semibold text-[14px] leading-tight">
                  {/* 🚀 Graceful decoding of the multi-schedule JSON */}
                  {(() => {
                    try {
                      const parsed = JSON.parse(app.interviewDate);
                      const d = new Date(parsed.date).toLocaleDateString(
                        "en-PH",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      );
                      return (
                        <>
                          <span className="block">{d}</span>
                          <span className="text-[12px] text-[#FFD000] font-bold tracking-wide">
                            Written: {formatTime(parsed.writtenTime)}{" "}
                            &nbsp;|&nbsp; F2F: {formatTime(parsed.f2fTime)}
                          </span>
                        </>
                      );
                    } catch (e) {
                      // Fallback for older single-date entries
                      return new Date(app.interviewDate).toLocaleString(
                        "en-PH",
                        {
                          dateStyle: "full",
                          timeStyle: "short",
                        },
                      );
                    }
                  })()}
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
              <Field label="Employer Name" value={app.workEmployerName} />
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
                <FileText
                  size={22}
                  className="text-[#0A1F5C] flex-shrink-0 group-hover:scale-110 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-semibold text-[#0A1F5C] underline truncate"
                    title={cleanName}
                  >
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
            <Trash2 size={14} /> Delete Application
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
  );
}

function DeptSection({
  dept,
  apps,
  onView,
  onDelete,
  onStatusChange,
  onDownload,
}) {
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
                    {app.applicantEmail} ·{" "}
                    <span className="font-bold text-[#0A1F5C] ml-1">
                      {app.jobTitle}
                    </span>
                    {app.category && (
                      <span className="font-bold text-[#CC1B1B] ml-1">
                        ({app.category})
                      </span>
                    )}{" "}
                    · <span className="text-gray-500">{app.appliedAt}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onView(app)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#EEF2FF] text-[#6366F1] rounded-lg text-[11px] font-bold uppercase cursor-pointer hover:bg-[#6366F1] hover:text-white transition-all border-2 border-[#6366F1]/20"
                  >
                    <Eye size={12} /> View
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

  const [emailAction, setEmailAction] = useState({
    isOpen: false,
    type: "",
    app: null,
    data: "",
  });

  useEffect(() => {
    fetchAllApplications()
      .then(setAllApps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const enhancedApps = allApps.map((a) => {
    const parentJob = jobs.find((j) => j.id === a.jobId) || {};
    return { ...a, category: a.category || parentJob.category || "" };
  });

  const positions = ["All", ...new Set(enhancedApps.map((a) => a.jobTitle))];

  const filtered = enhancedApps.filter((a) => {
    const matchPosition =
      activePosition === "All" || a.jobTitle === activePosition;
    const matchCategory =
      categoryFilter === "All" || a.category === categoryFilter;
    const matchSearch =
      !searchQ ||
      a.applicantName?.toLowerCase().includes(searchQ.toLowerCase()) ||
      a.jobTitle?.toLowerCase().includes(searchQ.toLowerCase()) ||
      a.applicantEmail?.toLowerCase().includes(searchQ.toLowerCase());
    return matchPosition && matchCategory && matchSearch;
  });

  const byPosition = positions
    .filter((p) => p !== "All")
    .reduce((acc, p) => {
      acc[p] = filtered.filter((a) => a.jobTitle === p);
      return acc;
    }, {});

  const handleStatusChange = async (appId, newStatus, appData) => {
    const targetApp = appData || allApps.find((a) => a.id === appId);

    if (
      [
        "Approved / Hired",
        "Rejected w/ Reason",
        "Rejected w/ No Reason",
        "Interview Scheduled",
      ].includes(newStatus)
    ) {
      const actionType =
        newStatus === "Interview Scheduled" ? "Schedule" : newStatus;

      // 🚀 For "Schedule", initialize the object structure
      const initialData =
        actionType === "Schedule"
          ? { date: "", writtenTime: "", f2fTime: "" }
          : "";

      setEmailAction({
        isOpen: true,
        type: actionType,
        app: targetApp,
        data: initialData,
      });
      return;
    }

    try {
      await updateApplicationStatus(appId, newStatus);
      setAllApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
      );
      if (viewApp && viewApp.id === appId)
        setViewApp({ ...viewApp, status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendEmailAction = async () => {
    const { type, app, data } = emailAction;

    if (!app.applicantEmail) {
      alert(
        "Cannot send email: This applicant does not have an email address on file.",
      );
      return;
    }

    try {
      let functionName = "";
      let bodyPayload = {
        to_email: app.applicantEmail,
        to_name: app.applicantName,
        job_title: app.jobTitle?.replace(/[\r\n]+/g, " ").trim(),
      };
      let finalStatus = type;
      let finalDataToSave = data;

      if (type === "Rejected w/ Reason") {
        if (!data.trim()) return alert("Please provide a reason.");
        functionName = "send-rejection";
        bodyPayload.rejection_reason = data;
        await updateApplicationStatus(app.id, type);
      } else if (type === "Rejected w/ No Reason") {
        functionName = "send-generic-rejection";
        await updateApplicationStatus(app.id, type);
      } else if (type === "Approved / Hired") {
        functionName = "send-approval";
        await updateApplicationStatus(app.id, type);
      } else if (type === "Schedule") {
        const { date, writtenTime, f2fTime } = data;
        if (!date || !writtenTime || !f2fTime)
          return alert("Please fill out the Date and both Time fields.");

        functionName = "send-interview";

        const formattedDate = new Date(date).toLocaleString("en-PH", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Send the three distinct variables to match your new HTML template!
        bodyPayload.interview_date = formattedDate;
        bodyPayload.written_time = formatTime(writtenTime);
        bodyPayload.f2f_time = formatTime(f2fTime);

        finalStatus = "Interview Scheduled";

        finalDataToSave = JSON.stringify({ date, writtenTime, f2fTime });

        // Convert date to a valid ISO timestamp for the DB column
        const isoTimestamp = new Date(
          `${date}T${writtenTime}:00`,
        ).toISOString();
        await updateApplicationSchedule(app.id, isoTimestamp);
      }

      const { error } = await supabase.functions.invoke(functionName, {
        body: bodyPayload,
      });
      if (error) throw error;

      setAllApps((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? {
                ...a,
                status: finalStatus,
                ...(type === "Schedule" && { interviewDate: finalDataToSave }),
              }
            : a,
        ),
      );
      if (viewApp && viewApp.id === app.id)
        setViewApp((prev) => ({
          ...prev,
          status: finalStatus,
          ...(type === "Schedule" && { interviewDate: finalDataToSave }),
        }));

      setEmailAction({ isOpen: false, type: "", app: null, data: "" });
      alert(
        `${type === "Schedule" ? "Interview" : type} email sent securely via Resend!`,
      );
    } catch (error) {
      console.error("Action Error:", error);
      alert("Failed to send email. Ensure the Edge Function is deployed.");
      if (error.context) {
        const errorDetails = await error.context.json();
        console.error("Exact Edge Function Error:", errorDetails);
        alert(
          `Resend blocked this because: ${errorDetails.error || errorDetails.message}`,
        );
      }
    }
  };

  const handleDelete = async (appId) => {
    try {
      await deleteApplication(appId);
      setAllApps((prev) => prev.filter((a) => a.id !== appId));
      setDeleteConfirm(null);
      if (viewApp?.id === appId) setViewApp(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewApplication = (app) => {
    if (app.status === "Submitted") {
      setViewApp({ ...app, status: "Under Review" });
      handleStatusChange(app.id, "Under Review", app);
    } else {
      setViewApp(app);
    }
  };

  const forceDownload = async (fileUrl, originalName) => {
    if (!fileUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(fileUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Applicant Name",
      "Email",
      "Contact",
      "Age",
      "Sex",
      "Civil Status",
      "Address",
      "Job Title",
      "Job Category",
      "Location",
      "Status",
      "Applied Date",
      "Interview Schedule",
      "School/University",
      "Degree/Course",
      "Year Graduated",
      "Academic Honors",
      "Graduate School",
      "Grad School Year",
      "Unit Earned",
      "Work Position",
      "Work Dates",
      "Trainings",
      "Skills",
      "Employer Name",
    ];

    const rows = [
      headers,
      ...filtered.map((a) => {
        // Graceful decode for CSV

        return [
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
          a.eduSchool || "",
          a.eduCourse || "",
          a.eduYear || "",
          a.eduHonors || "",
          a.eduGradSchool || "",
          a.eduGradYear || "",
          a.unitEarn || "",
          a.work_position || "",
          a.work_dates || "",
          a.work_trainings || "",
          a.work_skills || "",
          a.work_employer_name || "",
        ];
      }),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
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
            <span className="text-white font-bold tracking-wider uppercase text-sm">
              Downloading File...
            </span>
          </div>
        </div>
      )}

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
              Applications
            </h1>
            <p className="text-white/40 text-[13px] mt-1">
              {allApps.length} total · categorized by position
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#FFD000] text-[#0A1F5C] font-black text-[14px] tracking-[2px] uppercase px-6 py-3 rounded-lg hover:bg-white transition-all cursor-pointer"
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            <Download size={16} /> Export Full Data CSV
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 py-8">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Name, email or job..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-9 px-4 py-2.5 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
              Category
            </label>
            <select
              className="px-4 py-2.5 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000]"
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
              <Table size={16} /> {isTableView ? "Board View" : "Table View"}
            </button>
          </div>
          <div className="text-[13px] font-semibold text-gray-400 self-center pt-5">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {!isTableView && (
          <div className="flex flex-wrap gap-2 mb-6">
            {positions.map((p) => {
              const count =
                p === "All"
                  ? filtered.length
                  : filtered.filter((a) => a.jobTitle === p).length;
              return (
                <button
                  key={p}
                  onClick={() => setActivePosition(p)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold tracking-[1px] uppercase transition-all cursor-pointer border-2 flex items-center gap-1.5 ${activePosition === p ? "bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]" : "bg-white text-gray-500 border-gray-200 hover:border-[#FFD000]"}`}
                >
                  {p}{" "}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${activePosition === p ? "bg-[#FFD000] text-[#0A1F5C]" : "bg-gray-100 text-gray-500"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
            <span className="font-semibold">Loading applications...</span>
          </div>
        ) : allApps.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-gray-100">
            <Users size={48} className="text-gray-200 mx-auto mb-4" />
            <p
              className="font-black text-[22px] text-gray-300 uppercase"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              No Applications Yet
            </p>
          </div>
        ) : isTableView ? (
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#0A1F5C] text-[#FFD000]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider sticky left-0 bg-[#0A1F5C] z-10">
                    Action
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Job Category
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Date Applied
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Applicant Name
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Sex
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Educational attainment
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Graduate Studies
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    academic honors recieved
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    Relevant training
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    skills
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    position
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    inclusive dates
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
                    employer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] text-gray-700">
                {filtered.map((app) => {
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-gray-50 border-r border-gray-100 flex items-center gap-2">
                        <button
                          onClick={() => handleViewApplication(app)}
                          className="p-1.5 bg-[#EEF2FF] text-[#6366F1] rounded hover:bg-[#6366F1] hover:text-white transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(app.id)}
                          className="p-1.5 bg-red-50 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value, app)
                          }
                          className="text-[11px] font-bold px-2 py-1 rounded border border-gray-200 outline-none"
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0A1F5C]">
                        {app.jobTitle}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {app.category ? (
                          <span className="bg-[#EEF2FF] px-2 py-1 rounded text-[11px] font-bold tracking-wider uppercase text-[#0A1F5C] border border-[#0A1F5C]/10">
                            {app.category}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {app.appliedAt}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {app.applicantName}
                      </td>
                      <td className="px-4 py-3">{app.applicantEmail}</td>
                      <td className="px-4 py-3">{app.applicantContact}</td>
                      <td className="px-4 py-3">{app.applicantAge}</td>
                      <td className="px-4 py-3">
                        {app.applicantSex?.charAt(0)}
                      </td>
                      <td className="px-4 py-3">{app.applicantStatus}</td>
                      <td
                        className="px-4 py-3 truncate max-w-[200px]"
                        title={app.applicantAddress}
                      >
                        {app.applicantAddress}
                      </td>
                      <td className="px-4 py-3">
                        {app.eduSchool} / {app.eduCourse} / {app.eduYear}
                      </td>
                      <td className="px-4 py-3">
                        {app.eduGradSchool} / {app.eduGradYear} /{" "}
                        {app.eduGradSchoolUnit}
                      </td>
                      <td className="px-4 py-3">{app.eduHonors}</td>
                      <td className="px-4 py-3">{app.work_trainings}</td>
                      <td className="px-4 py-3">{app.work_skills}</td>
                      <td className="px-4 py-3">{app.work_position}</td>
                      <td className="px-4 py-3">{app.work_dates}</td>

                      <td className="px-4 py-3">{app.work_employer_name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(byPosition)
              .filter(([, apps]) => apps.length > 0)
              .map(([position, apps]) => (
                <DeptSection
                  key={position}
                  dept={position}
                  apps={apps}
                  onView={handleViewApplication}
                  onDelete={setDeleteConfirm}
                  onStatusChange={handleStatusChange}
                  onDownload={forceDownload}
                />
              ))}
          </div>
        )}
      </div>

      {viewApp && (
        <ApplicantModal
          app={viewApp}
          onClose={() => setViewApp(null)}
          onStatusChange={(s) => handleStatusChange(viewApp.id, s, viewApp)}
          onDelete={() => setDeleteConfirm(viewApp.id)}
          onScheduleClick={(appData) =>
            setEmailAction({
              isOpen: true,
              type: "Schedule",
              app: appData,
              // 🚀 Reset the object when clicking via modal button
              data: { date: "", writtenTime: "", f2fTime: "" },
            })
          }
          onDownload={forceDownload}
        />
      )}

      {/* 🚀 THE NEW SMART MODAL WITH SPLIT TIME INPUTS */}
      {emailAction.isOpen &&
        emailAction.app &&
        (() => {
          const config = ACTION_MODAL_CONFIG[emailAction.type];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <div className="fixed inset-0 z-[400] bg-black/60 flex items-center justify-center p-5">
              <div
                className={`bg-white rounded-xl p-6 w-full max-w-md border-t-4 ${config.border} shadow-2xl`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg}`}
                  >
                    <Icon size={20} className={config.color} />
                  </div>
                  <div>
                    <h3
                      className="font-black text-[20px] text-[#0A1F5C] uppercase leading-none"
                      style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                    >
                      {config.title}
                    </h3>
                    <p className="text-[12px] text-gray-500 font-semibold mt-1">
                      {emailAction.type === "Schedule"
                        ? "Set date & times for "
                        : "Send email to "}{" "}
                      {emailAction.app.applicantName}
                    </p>
                  </div>
                </div>

                {config.hasInput ? (
                  <div className="mb-6">
                    {/* 🚀 Render MULTI-SCHEDULE Form */}
                    {config.inputType === "schedule-multi" ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
                            Date of Interview
                          </label>
                          <input
                            type="date"
                            className={`w-full px-4 py-3 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:${config.border}`}
                            value={emailAction.data?.date || ""}
                            onChange={(e) =>
                              setEmailAction({
                                ...emailAction,
                                data: {
                                  ...emailAction.data,
                                  date: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
                              Written Exam
                            </label>
                            <input
                              type="time"
                              className={`w-full px-4 py-3 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:${config.border}`}
                              value={emailAction.data?.writtenTime || ""}
                              onChange={(e) =>
                                setEmailAction({
                                  ...emailAction,
                                  data: {
                                    ...emailAction.data,
                                    writtenTime: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
                              F2F Interview
                            </label>
                            <input
                              type="time"
                              className={`w-full px-4 py-3 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:${config.border}`}
                              value={emailAction.data?.f2fTime || ""}
                              onChange={(e) =>
                                setEmailAction({
                                  ...emailAction,
                                  data: {
                                    ...emailAction.data,
                                    f2fTime: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ) : config.inputType === "textarea" ? (
                      <>
                        <label className="block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5">
                          Reason for Rejection
                        </label>
                        <textarea
                          rows="4"
                          placeholder="Type the specific reason..."
                          className={`w-full px-4 py-3 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[14px] outline-none transition-all focus:${config.border} resize-none`}
                          value={emailAction.data}
                          onChange={(e) =>
                            setEmailAction({
                              ...emailAction,
                              data: e.target.value,
                            })
                          }
                        />
                      </>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-[14px] text-gray-600 mb-6 font-medium">
                    {config.desc}
                  </p>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setEmailAction({
                        isOpen: false,
                        type: "",
                        app: null,
                        data: "",
                      })
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-600 font-bold text-[13px] uppercase rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmailAction}
                    className={`px-4 py-2 text-white font-bold text-[13px] uppercase rounded-lg cursor-pointer transition-all flex items-center gap-2 ${config.buttonColor}`}
                  >
                    <Icon size={14} /> {config.buttonText}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border-t-4 border-red-500">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3
              className="font-black text-[22px] text-[#0A1F5C] uppercase mb-2"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              Delete Application?
            </h3>
            <p className="text-gray-500 text-[14px] mb-6">
              This will permanently remove this application record.
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
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
