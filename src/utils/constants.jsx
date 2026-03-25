import {
  User,
  GraduationCap,
  Briefcase,
  FolderOpen,
  CheckCircle,
  ClipboardList,
  Loader2,
  Calendar,
  UserCheck,
  XCircle,
} from "lucide-react";

export const STEP_LABELS = ["Personal", "Education", "Experience", "Documents", "Review"];
export const STEP_ICONS = [User, GraduationCap, Briefcase, FolderOpen, CheckCircle];
export const hideScrollbarCls = "scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export const STATUS_CONFIG = {
  Submitted: { color: "#6366F1", bg: "#EEF2FF", icon: ClipboardList, label: "Submitted" },
  "Under Review": { color: "#F59E0B", bg: "#FFFBEB", icon: Loader2, label: "Under Review" },
  "Interview Scheduled": { color: "#3B82F6", bg: "#EFF6FF", icon: Calendar, label: "Interview Scheduled" },
  "Approved / Hired": { color: "#10B981", bg: "#ECFDF5", icon: UserCheck, label: "Approved / Hired" },
  Rejected: { color: "#EF4444", bg: "#FEF2F2", icon: XCircle, label: "Rejected" },
};

export const ALL_STATUSES = Object.keys(STATUS_CONFIG);

export const inputCls =
  "w-full px-4 py-3 border-2 border-gray-200 rounded bg-white font-sans text-[#0A1F5C] text-[15px] outline-none transition-all focus:border-[#FFD000] focus:ring-2 focus:ring-[#FFD000]/20";
export const labelCls =
  "block text-[11px] font-bold tracking-widest uppercase text-[#0A1F5C] mb-1.5";

export function validateEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function validatePassword(p) {
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    number: /[0-9]/.test(p),
  };
}