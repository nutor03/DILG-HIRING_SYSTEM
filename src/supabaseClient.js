// ─── supabaseClient.js ────────────────────────────────────────────────────────
// SETUP: Replace the two values below with your Supabase project credentials.
// Find them in: Supabase Dashboard → Project Settings → API
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rziapvlbbxjryuimqolo.supabase.co"; 
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aWFwdmxiYnhqcnl1aW1xb2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjM5MjgsImV4cCI6MjA4ODMzOTkyOH0.GoCLLjqwPV40h_nF9j54g38Zr280jQqqKv1a_owlhwo"; // ← replace

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── FRIENDLY ERROR HELPER ────────────────────────────────────────────────────
function friendlyError(error) {
  const msg = error?.message || "";

  if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
    return new Error("Cannot connect to the server. Please check your internet or Supabase URL.");
  }
  if (msg.toLowerCase().includes("invalid login credentials")) {
    return new Error("Incorrect email or password. Please try again.");
  }
  if (msg.toLowerCase().includes("user already registered") || msg.toLowerCase().includes("already been registered")) {
    return new Error("An account with this email already exists. Please sign in instead.");
  }
  if (msg.toLowerCase().includes("email not confirmed")) {
    return new Error("Please confirm your email before logging in.");
  }
  if (msg.toLowerCase().includes("password should be")) {
    return new Error("Password must be at least 6 characters.");
  }
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

  if (data.user && !data.session) {
    throw new Error("Account created! Please check your email to confirm your account before signing in.");
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

function buildUserObject(user, meta) {
  return {
    id: user.id,
    email: user.email,
    firstName: meta.firstName || meta.first_name || "admin",
    lastName: meta.lastName || meta.last_name || "",
    role: user.email === "admin@gmail.com" ? "admin" : "user",
  };
}

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export const fetchJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false }); // <--- Add this line!
    // Note: If you don't have a 'created_at' column, you can use 'id' instead.
    if(error){console.log(error)}
  return data;
};

export const saveJob = async (jobData) => {
  const {
    id, title, location, category, about, responsibilities, requirements, active, 
    itemNumber, dateOfPublication, salaryGrade, noOfPersonNeeded, placeOfAssignment, education, trainingRequirements, experience, eligibility, 
    monthlySalary, docsReq
  } = jobData;

  // Bundle everything into one object targeted at your single jobs table
  const payload = {
    title, 
    location, 
    category, 
    about, 
    responsibilities, 
    requirements, 
    active: active !== false,
    coreComp: jobData.coreComp || null,
    leadershipComp: jobData.leadershipComp || null,
    functionalComp: jobData.functionalComp || null,
    itemNumber: itemNumber || null,
    dateOfPublication: dateOfPublication || null,
    salaryGrade: salaryGrade || null,
    noOfPersonNeeded: noOfPersonNeeded || null,
    placeOfAssignment: placeOfAssignment || null,
    education: education || null,
    trainingRequirements: trainingRequirements || null,
    experience: experience || null,
    eligibility: eligibility || null,
    monthlySalary: monthlySalary || null,
    docsReq: docsReq || null
  };

  try {
    if (id) {
      // --- EDIT EXISTING JOB ---
      const { data, error } = await supabase
        .from('jobs')
        .update(payload)
        .eq('id', id)
        .select()
        .single(); 

      if (error) throw error;
      return data;
    } else {
      // --- INSERT NEW JOB ---
      const { data, error } = await supabase
        .from('jobs')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error(" Supabase Save Error:", error);
    
    if (error.code === 'PGRST116') {
       alert("Edit blocked! Please check your Supabase Row Level Security (RLS) policies.");
    } else {
       alert("Failed to save job. Check console for details.");
    }
    throw error;
  }
};


export async function deleteJob(id) {
  // Simplified! Only needs to delete from the main jobs table now
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
      location: app.location,
      category: app.category,
      status: "Submitted",
      applicant_email: app.applicant_email,
      applicant_name: app.applicant_name,
      worksheet_file: app.worksheet_file || null,
      applicant_age: app.applicant_age ? Number(app.applicant_age) : null,
      applicant_address: app.applicant_address,
      applicant_status: app.applicant_status,
      applicant_sex: app.applicant_sex,
      applicant_contact: app.applicant_contact,
      edu_school: app.edu_school,
      edu_course: app.edu_course,
      edu_year: app.edu_year,
      edu_honors: app.edu_honors,
      eligibility: app.eligibility,
      edu_grad_school: app.edu_grad_school,
      edu_grad_year: app.edu_grad_year,
      unitEarn: app.unitEarn,
      work_skills: app.work_skills,
      work_position: app.work_position,
      work_dates: app.work_dates,
      work_employer_name: app.work_employer_name,

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

export async function updateApplicationSchedule(id, dateString) {
  const { data, error } = await supabase
    .from("applications")
    .update({ 
      status: "Interview Scheduled", 
      interview_date: dateString 
    })
    .eq("id", id)
    .select();

  if (error) throw friendlyError(error);
  return data;
}

export async function deleteApplication(id) {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw friendlyError(error);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function normalizeApp(row, workExperiences = []) {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    location: row.location,
    type: row.type,
    status: row.status,
    applicantEmail: row.applicant_email,
    applicantName: row.applicant_name,
    applicantAge: row.applicant_age,
    applicantAddress: row.applicant_address,
    applicantStatus: row.applicant_status,
    applicantSex: row.applicant_sex,
    applicantContact: row.applicant_contact,
    eduSchool: row.edu_school,
    eduCourse: row.edu_course,
    eduYear: row.edu_year,
    eduHonors: row.edu_honors,
    eduGradSchool: row.edu_grad_school,
    eduGradYear: row.edu_grad_year,
    unitEarn: row.unitEarn,
    eligibility: row.eligibility,
    workPosition: row.work_position,
    workDates: row.work_dates,
    workEmployerName: row.work_employer_name,
    workTrainings: row.work_trainings,
    workSkills: row.work_skills,
    workExperiences: workExperiences, // Array of work experiences
    fileName: row.worksheet_file,
    interviewDate: row.interview_date, 
    appliedAt: row.applied_at
      ? new Date(row.applied_at).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
  };
}

export const uploadApplicantDocument = async (file) => {
  if (!file) return null;
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;



  const { data: publicUrlData } = supabase.storage
    .from('applicant_docs')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};