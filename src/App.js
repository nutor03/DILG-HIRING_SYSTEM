import { useState } from 'react';
import './App.css';

function App() {
  const jobs = [
    { 
      id: 1, 
      title: "Frontend Developer", 
      department: "Engineering", 
      location: "Remote", 
      type: "Full-time",
      about: "We are looking for a skilled React developer to build modern, responsive user interfaces.",
      responsibilities: ["Develop new user-facing features.", "Build reusable code and libraries.", "Optimize applications for maximum speed."],
      requirements: ["3+ years of React experience.", "Strong proficiency in JavaScript and Tailwind CSS.", "Experience with Git."]
    },
    { 
      id: 2, 
      title: "HR Specialist", 
      department: "Human Resources", 
      location: "New York, NY", 
      type: "Contract",
      about: "Join our HR team to help recruit, onboard, and support our amazing employees.",
      responsibilities: ["Manage the full cycle recruitment process.", "Maintain applicant tracking systems.", "Assist with employee onboarding."],
      requirements: ["Bachelor's degree in HR or related field.", "Excellent communication skills.", "Experience with modern HR software."]
    },
    { 
      id: 3, 
      title: "UX Designer", 
      department: "Design", 
      location: "San Francisco, CA", 
      type: "Full-time",
      about: "Help us design intuitive and beautiful digital experiences for our users.",
      responsibilities: ["Create wireframes and interactive prototypes.", "Conduct user research and testing.", "Collaborate with frontend developers."],
      requirements: ["Portfolio demonstrating UX/UI process.", "Proficiency in Figma.", "Understanding of web accessibility standards."]
    },
  ];

  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedJob, setSelectedJob] = useState(null);
  
  // NEW STATE: Tracks if we are looking at the form (true) or the job details (false)
  const [isApplying, setIsApplying] = useState(false);

  const filteredJobs = jobs.filter((job) => {
    if (selectedDepartment === "All Departments") return true;
    return job.department === selectedDepartment;
  });

  // Helper function to completely close the modal and reset everything
  const closeModal = () => {
    setSelectedJob(null);
    setIsApplying(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans relative">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 shadow-sm z-10">
        <h1 className="text-2xl font-black text-blue-900 tracking-tight">DILG-CARAGA</h1>
        <a href="#jobs" className="bg-red-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm">
          View Open Roles
        </a>
      </nav>

      {/* HERO SECTION */}
      <header className="header bg-blue-900 text-white py-24 px-8 text-center flex flex-col items-center justify-center border-b-4 border-yellow-400">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6">DILG-CARAGA</h2>
        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          We are looking for passionate people to join our team. Discover your next career move today.
        </p>
        <a href="#jobs" className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition-colors shadow-lg">
          View Open Roles
        </a>
      </header>

      {/* THE JOB BOARD & FILTERS */}
      <main id="jobs" className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-6xl mx-auto p-8">
          
          <div className="flex flex-col items-center justify-center text-center w-full mb-8">
            <h3 className="text-3xl font-bold text-blue-900 mb-2">Open Roles</h3>
            <p className="text-slate-600">Find the perfect fit for your skills.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 w-full">
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-full md:w-80"
            />
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white w-full md:w-auto cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>
          
          {/* JOB CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length === 0 ? (
              <p className="text-slate-500 col-span-3 text-center py-10">No jobs found in this department.</p>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-red-500 transition-all group">
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold tracking-wide border border-yellow-200">
                      {job.department}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">📍 {job.location}</span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-blue-900 group-hover:text-red-600 transition-colors">{job.title}</h4>
                  <p className="text-slate-500 mt-2 font-medium">{job.type}</p>
                  
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setIsApplying(false); // Always start on the details tab
                    }}
                    className="mt-6 w-full bg-blue-800 text-white font-bold py-2.5 rounded-lg hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
                  >
                    View Details
                  </button>
                  
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      {/* THE DUAL-VIEW MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border-t-8 border-yellow-400 scrollbar-hide">
            
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full p-2 font-bold transition-colors z-10 cursor-pointer"
            >
              ✕
            </button>

            {/* CONDITIONAL RENDER: Show Details OR Form */}
            {!isApplying ? (
              
              /* --- VIEW 1: JOB DETAILS --- */
              <div className="p-8">
                <span className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-2 block">{selectedJob.department}</span>
                <h2 className="text-3xl font-black text-blue-900 mb-2">{selectedJob.title}</h2>
                <p className="text-slate-500 font-medium mb-8">📍 {selectedJob.location} • 🕒 {selectedJob.type}</p>

                <div className="space-y-6 text-slate-700">
                  <section>
                    <h3 className="text-xl font-bold text-blue-900 mb-2 border-b border-slate-200 pb-2">About the Role</h3>
                    <p className="leading-relaxed">{selectedJob.about}</p>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold text-blue-900 mb-2 border-b border-slate-200 pb-2">What You'll Do</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedJob.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold text-blue-900 mb-2 border-b border-slate-200 pb-2">What You Need</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedJob.requirements.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </section>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-200">
                  <button 
                    onClick={() => setIsApplying(true)} // Switches to the Form view
                    className="w-full bg-red-600 text-white text-lg font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                  >
                    Apply for this Role
                  </button>
                </div>
              </div>

            ) : (

              /* --- VIEW 2: APPLICATION FORM --- */
              <div className="p-8">
                
                {/* Back Button */}
                <button 
                  onClick={() => setIsApplying(false)} // Switches back to Details view
                  className="text-blue-600 font-bold hover:underline mb-6 flex items-center gap-2 cursor-pointer"
                >
                  ← Back to Details
                </button>

                <h2 className="text-2xl font-black text-blue-900 mb-1">Apply for {selectedJob.title}</h2>
                <p className="text-slate-500 mb-8">Fill out the information below to submit your application.</p>

                {/* Form Fields */}
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Grid for First/Last Name side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="Juan" required/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="Dela Cruz" required/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="juan@example.com" required/>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">LinkedIn or Portfolio URL</label>
                    <input type="url" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="https://linkedin.com/in/..." />
                  </div>

                  {/* Drag and Drop Resume Field */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Resume / CV <span className="text-red-500">*</span></label>
                    <div className="border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl p-8 text-center cursor-pointer">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-blue-900 font-bold mb-1">Click to upload or drag and drop</p>
                      <p className="text-blue-600 text-sm">PDF, DOCX, or RTF (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Final Submit Button */}
                  <div className="pt-6 border-t border-slate-200 mt-8">
                    <button type="submit" className="w-full bg-blue-900 text-yellow-400 text-lg font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg cursor-pointer">
                      Send Application
                    </button>
                  </div>

                </form>
              </div>

            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default App;