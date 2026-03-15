// ─── supabaseClient.js ────────────────────────────────────────────────────────
// SETUP: Replace the two values below with your Supabase project credentials.
// Find them in: Supabase Dashboard → Project Settings → API
//
//   SUPABASE_URL  → "Project URL"       e.g. https://abcdefgh.supabase.co
//   SUPABASE_ANON → "anon / public" key e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6...
//
// Install the package first:  npm install @supabase/supabase-js
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rziapvlbbxjryuimqolo.supabase.co"; // ← replace
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aWFwdmxiYnhqcnl1aW1xb2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjM5MjgsImV4cCI6MjA4ODMzOTkyOH0.GoCLLjqwPV40h_nF9j54g38Zr280jQqqKv1a_owlhwo"; // ← replace

// Credentials are configured - Supabase client ready to use
// To update credentials, change SUPABASE_URL and SUPABASE_ANON above

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── FRIENDLY ERROR HELPER ────────────────────────────────────────────────────
// Converts raw Supabase/network errors into messages users can understand.
function friendlyError(error) {
  const msg = error?.message || "";

  if (
    msg.toLowerCase().includes("failed to fetch") ||
    msg.toLowerCase().includes("networkerror")
  ) {
    return new Error(
      "Cannot connect to the server. Please check:\n" +
        "1. Your internet connection\n" +
        "2. That SUPABASE_URL in supabaseClient.js is correct\n" +
        "3. Your Supabase project is not paused (check the dashboard)",
    );
  }
  if (msg.toLowerCase().includes("invalid login credentials")) {
    return new Error("Incorrect email or password. Please try again.");
  }
  if (
    msg.toLowerCase().includes("user already registered") ||
    msg.toLowerCase().includes("already been registered")
  ) {
    return new Error(
      "An account with this email already exists. Please sign in instead.",
    );
  }
  if (msg.toLowerCase().includes("email not confirmed")) {
    return new Error(
      "Please confirm your email before logging in.\n" +
        "Tip: In Supabase Dashboard → Authentication → Settings, " +
        "disable 'Enable email confirmations' during development.",
    );
  }
  if (msg.toLowerCase().includes("password should be")) {
    return new Error("Password must be at least 6 characters.");
  }
  // Fallback — return the original message
  return error;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function signUp(email, password, firstName, lastName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstName, lastName },
    },
  });
  if (error) throw friendlyError(error);

  // We throw a helpful message so the user knows what to do.
  if (data.user && !data.session) {
    throw new Error(
      "Account created! Please check your email to confirm your account before signing in.\n\n" +
        "To skip this during development: Supabase Dashboard → Authentication → Settings → " +
        "disable 'Enable email confirmations'.",
    );
  }

  return data.user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw friendlyError(error);

  const meta = data.user.user_metadata || {};
  return buildUserObject(data.user, meta);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw friendlyError(error);
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  const user = data.session.user;
  const meta = user.user_metadata || {};
  return buildUserObject(user, meta);
}

// Shared helper — builds the user shape the rest of the app uses
function buildUserObject(user, meta) {
  return {
    id: user.id,
    email: user.email,
    firstName: meta.firstName || meta.first_name || "admin",
    lastName: meta.lastName || meta.last_name || "",
    role: user.email === "admin@email.com" ? "admin" : "user",
  };
}

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export async function fetchJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw friendlyError(error);
  return data;
}

export async function saveJob(job) {
  if (job.id) {
    const { error } = await supabase
      .from("jobs")
      .update({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        about: job.about,
        active: job.active,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
      })
      .eq("id", job.id);
    if (error) throw friendlyError(error);
  } else {
    const { error } = await supabase.from("jobs").insert([
      {
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        about: job.about,
        active: job.active ?? true,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
      },
    ]);
    if (error) throw friendlyError(error);
  }
}

export async function deleteJob(id) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw friendlyError(error);
}

export async function toggleJob(id, active) {
  const { error } = await supabase.from("jobs").update({ active }).eq("id", id);
  if (error) throw friendlyError(error);
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

export async function submitApplication(app) {
  const { error } = await supabase.from("applications").insert([
    {
      job_id: app.jobId,
      job_title: app.jobTitle,
      department: app.department,
      location: app.location,
      type: app.type,
      status: "Submitted",
      applicant_email: app.applicant_email,
      applicant_name: app.applicant_name,
      applicant_address: app.applicant_address,
      applicant_status: app.applicant_status,
      applicant_sex: app.applicant_sex,
      applicant_contact: app.applicant_contact,
      edu_school: app.edu_school,
      edu_course: app.edu_course,
      edu_year: app.edu_year,
      edu_honors: app.edu_honors,
      edu_grad_school: app.edu_grad_school,
      edu_grad_year: app.edu_grad_year,
      work_trainings: app.work_trainings,
      work_skills: app.work_skills,
      work_position: app.work_position,
      work_dates: app.work_dates,
      work_employer_name: app.work_employer_name,
      file_name: app.file_name || null,
    },
  ]);
  if (error) throw friendlyError(error);
}

export async function fetchMyApplications(email) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_email", email)
    .order("applied_at", { ascending: false });
  if (error) throw friendlyError(error);
  return data.map(normalizeApp);
}

export async function fetchAllApplications() {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("applied_at", { ascending: false });
  if (error) throw friendlyError(error);
  return data.map(normalizeApp);
}

export async function updateApplicationStatus(id, status) {
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);
  if (error) throw friendlyError(error);
}

export async function deleteApplication(id) {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw friendlyError(error);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function normalizeApp(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    department: row.department,
    location: row.location,
    type: row.type,
    status: row.status,
    applicantEmail: row.applicant_email,
    applicantName: row.applicant_name,
    applicantaddress: row.applicantaddress,
    applicantstatus: row.applicantstatus,
    applicantSex: row.applicantSex,
    applicantContact: row.applicantContact,
    eduSchool: row.eduSchool,
    eduCourse: row.eduCourse,
    eduYear: row.eduYear,
    eduHonors: row.eduHonors,
    eduGradSchool: row.eduGradSchool,
    eduGradYear: row.eduGradYear,
    workTrainings: row.workTrainings,
    workSkills: row.workSkills,
    workPosition: row.workPosition,
    workDates: row.workDDates,
    workEmployerName: row.workEmployerName,
    fileName: row.file_name,
    appliedAt: row.applied_at
      ? new Date(row.applied_at).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
  };
}
