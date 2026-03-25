import React, { useState } from "react";
import { ChevronLeft, ClipboardList, Loader2, MapPin, Clock, Calendar } from "lucide-react";
import { ALL_STATUSES, STATUS_CONFIG } from "../../utils/constants";

export default function TrackerPage({ applications, loading, onBack, user }) {
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All"
      ? applications
      : applications.filter((a) => a.status === filter);
  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FFFDF0]">
      <div className="bg-[#0A1F5C] border-b-[6px] border-[#FFD000] px-6 md:px-12 py-10">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#FFD000]/60 hover:text-[#FFD000] text-[12px] font-bold tracking-[2px] uppercase mb-5 bg-transparent border-0 cursor-pointer transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Jobs
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1
                className="font-black text-[48px] text-[#FFD000] uppercase leading-none"
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                My Applications
              </h1>
              <p className="text-white/50 mt-1 text-[14px]">
                Signed in as{" "}
                <span className="text-white font-semibold">
                  {user.firstName} {user.lastName}
                </span>{" "}
                · {user.email}
              </p>
            </div>
            <div className="bg-[#FFD000] text-[#0A1F5C] px-5 py-3 rounded-lg text-center min-w-[80px]">
              <div
                className="font-black text-[32px] leading-none"
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                {applications.length}
              </div>
              <div className="text-[10px] font-bold tracking-[2px] uppercase">
                Total Applied
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {ALL_STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <div
                  key={s}
                  className="flex items-center gap-1.5 bg-white/10 text-white/80 text-[12px] font-semibold px-3 py-1.5 rounded-full"
                >
                  <Icon size={12} style={{ color: cfg.color }} />
                  {cfg.label}:{" "}
                  <span className="font-black ml-0.5 text-white">
                    {statusCounts[s]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-[12px] font-bold tracking-[1px] uppercase transition-all cursor-pointer border-2 ${filter === s ? "bg-[#0A1F5C] text-[#FFD000] border-[#0A1F5C]" : "bg-white text-gray-500 border-gray-200 hover:border-[#FFD000]"}`}
            >
              {s === "All"
                ? `All (${applications.length})`
                : `${STATUS_CONFIG[s].label} (${statusCounts[s]})`}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
            <span className="font-semibold">Loading applications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-gray-100">
            <ClipboardList size={48} className="text-gray-200 mx-auto mb-4" />
            <p
              className="font-black text-[22px] text-gray-300 uppercase"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              {applications.length === 0
                ? "No Applications Yet"
                : "No results for this filter"}
            </p>
            {applications.length === 0 && (
              <button
                onClick={onBack}
                className="mt-5 inline-flex items-center gap-2 bg-[#FFD000] text-[#0A1F5C] font-bold text-[14px] tracking-[2px] uppercase px-8 py-3 rounded-lg cursor-pointer hover:bg-[#0A1F5C] hover:text-[#FFD000] transition-all"
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                <ClipboardList size={16} />
                Browse Open Roles
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => {
              const cfg =
                STATUS_CONFIG[app.status] || STATUS_CONFIG["Submitted"];
              const StatusIcon = cfg.icon;
              const statusIdx = ALL_STATUSES.indexOf(app.status);
              return (
                <div
                  key={app.id}
                  className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden transition-all duration-200 hover:border-[#FFD000]"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = "4px 4px 0 #FFD000")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <div className="flex items-start justify-between px-6 py-5 gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-gray-400 text-[12px] flex items-center gap-1">
                          <MapPin size={11} />
                          {app.location}
                        </span>
                        <span className="text-gray-400 text-[12px] flex items-center gap-1">
                          <Clock size={11} />
                          {app.type}
                        </span>
                      </div>
                      <h3
                        className="font-extrabold text-[22px] text-[#0A1F5C] uppercase leading-tight"
                        style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                      >
                        {app.jobTitle}
                      </h3>
                      <p className="text-[12px] text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar size={11} />
                        Applied {app.appliedAt}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[13px] tracking-wide flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <StatusIcon size={15} />
                      {cfg.label}
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-1">
                    <div className="relative flex items-start justify-between">
                      <div className="absolute left-3.5 right-3.5 top-[13px] h-[3px] bg-gray-100 z-0" />
                      <div
                        className="absolute left-3.5 top-[13px] h-[3px] z-0 transition-all duration-700"
                        style={{
                          background: "#FFD000",
                          width:
                            statusIdx <= 0
                              ? "0%"
                              : `calc(${(statusIdx / (ALL_STATUSES.length - 1)) * 100}% - 0px)`,
                        }}
                      />
                      {ALL_STATUSES.map((s, i) => {
                        const sCfg = STATUS_CONFIG[s];
                        const SIcon = sCfg.icon;
                        const done = i < statusIdx;
                        const current = i === statusIdx;
                        const isRej = app.status === "Rejected" && current;
                        return (
                          <div
                            key={s}
                            className="relative z-10 flex flex-col items-center gap-2"
                            style={{ minWidth: 56 }}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isRej ? "bg-red-500 border-red-500 text-white scale-125 ring-4 ring-red-200" : current ? "bg-[#0A1F5C] border-[#0A1F5C] text-[#FFD000] scale-125 ring-4 ring-[#FFD000]/30" : done ? "bg-[#FFD000] border-[#FFD000] text-[#0A1F5C]" : "bg-white border-gray-200 text-gray-300"}`}
                            >
                              <SIcon size={13} strokeWidth={2} />
                            </div>
                            <span
                              className={`text-[9px] font-bold tracking-wider uppercase text-center leading-tight max-w-[56px] ${current ? (isRej ? "text-red-500" : "text-[#0A1F5C]") : done ? "text-gray-400" : "text-gray-300"}`}
                            >
                              {sCfg.label.replace(" / ", "/\n")}
                            </span>
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