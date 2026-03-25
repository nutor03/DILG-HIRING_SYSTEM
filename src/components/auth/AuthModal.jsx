import React, { useState } from "react";
import { X, LogIn, AlertCircle, Mail, Lock, EyeOff, Eye, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { signIn, signUp } from "../../supabaseClient";
import { inputCls, labelCls, validateEmail, validatePassword } from "../../utils/constants";

export default function AuthModal({ mode, onClose, onLogin, switchMode }) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pwRules = validatePassword(password);
  const pwValid = Object.values(pwRules).every(Boolean);

  const handleSubmit = async () => {
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (!isLogin && !pwValid) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (!isLogin && (!firstName.trim() || !lastName.trim())) {
      setError("Please enter your full name.");
      return;
    }
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
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-[#0A1F5C]/80 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden border-t-[6px] border-[#FFD000] relative"
        style={{ boxShadow: "0 40px 80px rgba(10,31,92,0.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-[#CC1B1B] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
        <div className="bg-[#0A1F5C] px-8 pt-8 pb-6">
          <div className="w-12 h-12 bg-[#FFD000] rounded-xl flex items-center justify-center mb-4">
            <LogIn size={22} className="text-[#0A1F5C]" />
          </div>
          <h2
            className="font-black text-[28px] text-white uppercase leading-none"
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-white/50 text-[13px] mt-1">
            {isLogin
              ? "Sign in to continue your application"
              : "Register to start applying for roles"}
          </p>
        </div>
        <div className="px-8 py-7">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-[13px] font-semibold">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelCls}>
                  First Name <span className="text-[#CC1B1B]">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Last Name <span className="text-[#CC1B1B]">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className={labelCls}>
              Email Address <span className="text-[#CC1B1B]">*</span>
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className={`${inputCls} pl-10`}
                type="email"
                placeholder="email@gov.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>
          <div className="mb-5">
            <label className={labelCls}>
              Password <span className="text-[#CC1B1B]">*</span>
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className={`${inputCls} pl-10 pr-11`}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A1F5C] cursor-pointer bg-transparent border-0"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {!isLogin && password.length > 0 && (
            <div className="mb-5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 space-y-1.5">
              {[
                [pwRules.length, "At least 8 characters"],
                [pwRules.upper, "One uppercase letter"],
                [pwRules.number, "One number"],
              ].map(([ok, label]) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 text-[12px] font-semibold ${ok ? "text-green-600" : "text-gray-400"}`}
                >
                  <CheckCircle
                    size={13}
                    className={ok ? "text-green-500" : "text-gray-300"}
                  />
                  {label}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#CC1B1B] text-white font-black text-[17px] tracking-[2px] uppercase py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0A1F5C] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              boxShadow: "0 4px 20px rgba(204,27,27,0.25)",
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <ArrowRight size={18} />
                {isLogin ? "Sign In" : "Create Account"}
              </>
            )}
          </button>
          <p className="text-center text-[13px] text-gray-500 mt-5">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => switchMode(isLogin ? "register" : "login")}
              className="text-[#CC1B1B] font-bold underline bg-transparent border-0 cursor-pointer hover:text-[#0A1F5C] transition-colors"
            >
              {isLogin ? "Register here" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}