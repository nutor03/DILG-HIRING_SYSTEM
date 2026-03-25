import React, { useState, useEffect } from "react";
import { ClipboardList, Briefcase, Users, BarChart2, ChevronRight } from "lucide-react";
import { fetchAllApplications } from "../../supabaseClient";
import { ALL_STATUSES, STATUS_CONFIG } from "../../utils/constants";

export default function AdminOverview({ jobs, onNav }) {
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllApplications()
      .then(setAllApps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((j) => j.active !== false);
  const uniqueEmails = [...new Set(allApps.map((a) => a.applicantEmail))];
  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = allApps.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1F5C] px-8 py-10 border-b-4 border-[#FFD000]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#FFD000]/60 text-[12px] font-bold tracking-[3px] uppercase mb-1">
            Admin Dashboard
          </p>
          <h1
            className="font-black text-[42px] text-white uppercase leading-none"
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            Overview
          </h1>
          <p className="text-white/40 text-[13px] mt-1">
            DILG-CARAGA Careers Management System
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Applications",
              value: allApps.length,
              icon: ClipboardList,
              color: "#6366F1",
              bg: "#EEF2FF",
            },
            {
              label: "Active Job Postings",
              value: activeJobs.length,
              icon: Briefcase,
              color: "#F59E0B",
              bg: "#FFFBEB",
            },
            {
              label: "Total Applicants",
              value: uniqueEmails.length,
              icon: Users,
              color: "#3B82F6",
              bg: "#EFF6FF",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-[#FFD000] transition-all"
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "4px 4px 0 #FFD000")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: bg }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div
                className="font-black text-[32px] text-[#0A1F5C] leading-none"
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                {loading ? "—" : value}
              </div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-100 p-6 mb-6">
          <h2
            className="font-black text-[20px] text-[#0A1F5C] uppercase mb-5 flex items-center gap-2"
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            <BarChart2 size={18} />
            Application Status Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {ALL_STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              const count = statusCounts[s];
              const pct =
                allApps.length > 0
                  ? Math.round((count / allApps.length) * 100)
                  : 0;
              return (
                <div
                  key={s}
                  className="rounded-lg p-4 text-center"
                  style={{ background: cfg.bg }}
                >
                  <Icon
                    size={20}
                    className="mx-auto mb-2"
                    style={{ color: cfg.color }}
                  />
                  <div
                    className="font-black text-[28px] leading-none"
                    style={{
                      color: cfg.color,
                      fontFamily: "'Barlow Condensed',sans-serif",
                    }}
                  >
                    {loading ? "—" : count}
                  </div>
                  <div
                    className="text-[10px] font-bold tracking-wider uppercase mt-1"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </div>
                  <div
                    className="text-[11px] font-semibold mt-1"
                    style={{ color: cfg.color, opacity: 0.7 }}
                  >
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onNav("jobs")}
            className="bg-[#0A1F5C] text-[#FFD000] rounded-xl p-6 text-left hover:bg-[#CC1B1B] transition-all cursor-pointer border-2 border-transparent hover:border-[#FFD000] group"
          >
            <Briefcase size={28} className="mb-3" />
            <div
              className="font-black text-[22px] uppercase"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              Manage Job Postings
            </div>
            <p className="text-[#FFD000]/60 text-[13px] mt-1">
              Add, edit or remove job listings
            </p>
            <ChevronRight
              size={18}
              className="mt-3 group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button
            onClick={() => onNav("applications")}
            className="bg-white text-[#0A1F5C] rounded-xl p-6 text-left hover:border-[#FFD000] transition-all cursor-pointer border-2 border-gray-200 group"
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "4px 4px 0 #FFD000")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <Users size={28} className="mb-3 text-[#6366F1]" />
            <div
              className="font-black text-[22px] uppercase"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              View Applications
            </div>
            <p className="text-gray-400 text-[13px] mt-1">
              Review and manage all applicants
            </p>
            <ChevronRight
              size={18}
              className="mt-3 group-hover:translate-x-1 transition-transform text-[#6366F1]"
            />
          </button>
        </div>
      </div>
    </div>
  );
}