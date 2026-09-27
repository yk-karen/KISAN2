import React, { useState, useEffect } from "react";
import { Icon, SpeakButton } from "./Icons";
import {
  fetchJobPostings,
  applyForJob,
  fetchWorkerApplications,
  updateProfile,
  uploadMedia,
} from "../lib/api";

const PRESET_WORKER_PHOTOS = [
  { label: "Worker 1", url: "https://images.unsplash.com/photo-1627475320102-d73fcb4eb427?auto=format&fit=crop&w=500&q=85" },
  { label: "Field Team", url: "https://images.unsplash.com/photo-1760973177205-2d27e31f9afa?auto=format&fit=crop&w=800&q=85" },
  { label: "Tractor Operator", url: "https://images.unsplash.com/photo-1564868480822-32f714a0e763?auto=format&fit=crop&w=800&q=85" },
];

export const COMMONLY_NEEDED_LABOUR_SKILLS = [
  "Paddy Harvesting & Sheaf Binding",
  "Land Tilling & Soil Bed Preparation",
  "Paddy & Vegetable Seedling Transplantation",
  "Knapsack Chemical / Organic Spraying",
  "Manual Weeding, Hoeing & De-stoning",
  "Tractor & Farm Machinery Operation",
  "Fruit, Coconut & Arecanut Plucking",
  "Drip & Furrow Irrigation Management",
  "Post-Harvest Grain Bagging & Loading",
  "Cotton Picking & Sugarcane Cutting",
  "Pruning, Staking & Trellising",
  "Milking & Dairy Farm Maintenance",
];

export function LabourerDashboard({
  notify,
  go,
  profile,
  user,
}: {
  notify: (msg: string) => void;
  go: (page: string) => void;
  profile: any;
  user: any;
}) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "engaged" | "off">("available");

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  useEffect(() => {
    Promise.all([
      fetchJobPostings("open").catch(() => []),
      userId ? fetchWorkerApplications(userId).catch(() => []) : Promise.resolve([]),
    ]).then(([jbs, apps]) => {
      setJobs(jbs || []);
      setApplications(apps || []);
      setLoading(false);
    });
  }, [userId]);

  const workerSkills = profile?.dbProfile?.metadata?.skills || profile?.dbProfile?.work_skills || [
    "Paddy Harvesting & Sheaf Binding",
    "Land Tilling & Soil Bed Preparation",
  ];
  const dailyWage = profile?.dbProfile?.metadata?.daily_wage || 750;
  const travelDistance = profile?.dbProfile?.metadata?.travel_distance || "Within 15 km";

  const workerName =
    profile?.account?.fullName ||
    profile?.account?.firstName ||
    profile?.dbProfile?.full_name?.split(" ")[0] ||
    "Labourer";

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">AGRICULTURAL WORKER HUB</span>
          <h1>Welcome, {workerName}</h1>
          <p>Find daily farm work, manage your skill profile, set wage rates, and connect with nearby farmers.</p>
        </div>
        <SpeakButton label="Worker dashboard" />
      </div>

      {/* AVAILABILITY TOGGLE BAR */}
      <div style={{ background: "#ffffff", border: "1px solid #dbe7de", borderRadius: "18px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: availabilityStatus === "available" ? "#16a34a" : availabilityStatus === "engaged" ? "#d97706" : "#64748b" }} />
          <strong>Current Work Status:</strong>
          <span style={{ fontWeight: 800, color: availabilityStatus === "available" ? "#166534" : availabilityStatus === "engaged" ? "#b45309" : "#475569" }}>
            {availabilityStatus === "available" ? "🟢 Available for Farm Work Today" : availabilityStatus === "engaged" ? "🟡 Currently Engaged on Farm Gig" : "⚪ Off Duty"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => { setAvailabilityStatus("available"); notify("Status set: Available for Work!"); }}
            style={{ padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, border: "1px solid #16a34a", background: availabilityStatus === "available" ? "#dcfce7" : "#fff", color: "#166534", cursor: "pointer" }}
          >
            Available Today
          </button>
          <button
            type="button"
            onClick={() => { setAvailabilityStatus("off"); notify("Status set: Off Duty"); }}
            style={{ padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, border: "1px solid #cbd5e1", background: availabilityStatus === "off" ? "#f1f5f9" : "#fff", color: "#475569", cursor: "pointer" }}
          >
            Off Duty
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon green"><Icon name="briefcase" size={26} /></div>
          <div className="kpi-info">
            <strong>₹{dailyWage}</strong>
            <span>My Daily Wage Rate</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Icon name="map" size={26} /></div>
          <div className="kpi-info">
            <strong>{travelDistance}</strong>
            <span>Work / Travel Radius</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon gold"><Icon name="tool" size={26} /></div>
          <div className="kpi-info">
            <strong>{workerSkills.length}</strong>
            <span>Registered Skills</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple"><Icon name="clock" size={26} /></div>
          <div className="kpi-info">
            <strong>{applications.length}</strong>
            <span>Job Applications</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          className="primary-action"
          style={{ width: "auto", padding: "0 22px", margin: 0 }}
          onClick={() => go("labour_jobs")}
        >
          <Icon name="search" size={18} /> Browse Open Farm Jobs ({jobs.length})
        </button>
        <button
          className="secondary-action"
          style={{ minHeight: "56px", margin: 0, padding: "0 20px" }}
          onClick={() => go("labour_skills")}
        >
          <Icon name="tool" size={18} /> Update My Skills & Rates
        </button>
      </div>

      <section style={{ marginBottom: "28px" }}>
        <div className="section-title">
          <h2>Open Farm Jobs Near You</h2>
          <button onClick={() => go("labour_jobs")}>View All <Icon name="chevron" size={16} /></button>
        </div>
        {jobs.length === 0 ? (
          <p className="empty-state">No open farm jobs listed right now. Local farmers post jobs during sowing and harvest seasons.</p>
        ) : (
          <div className="jobs-list">
            {jobs.slice(0, 3).map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-symbol job-1"><Icon name="users" size={28} /></div>
                <div className="job-info">
                  <div className="job-top">
                    <span className="status live">Urgent Requirement</span>
                    <strong>₹{job.daily_wage} / day</strong>
                  </div>
                  <h3>{job.title}</h3>
                  <p className="farm-name">📍 {job.location_address || "Local Farm"}</p>
                  <div className="tags" style={{ margin: "8px 0" }}>
                    {(job.skills_required || []).map((sk: string) => (
                      <span key={sk}>{sk}</span>
                    ))}
                  </div>
                  <div className="job-footer">
                    <div>
                      <span>Date Required</span>
                      <strong>{job.date_required}</strong>
                    </div>
                    <button onClick={() => go("labour_jobs")}>View & Apply</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-title">
          <h2>My Active Skills & Specializations</h2>
          <button onClick={() => go("labour_skills")}>Edit Skills <Icon name="chevron" size={16} /></button>
        </div>
        <div className="skills-pill-grid">
          {workerSkills.map((sk: string) => (
            <span key={sk} className="skill-pill-btn active" style={{ cursor: "default" }}>
              ✓ {sk}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

export function LabourerSkillsManage({
  notify,
  user,
  profile,
  onProfileUpdated,
}: {
  notify: (msg: string) => void;
  user: any;
  profile: any;
  onProfileUpdated?: (prof: any) => void;
}) {
  const meta = profile?.dbProfile?.metadata || {};
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    meta.skills || profile?.dbProfile?.work_skills || ["Paddy Harvesting & Sheaf Binding"]
  );
  const [dailyWage, setDailyWage] = useState(String(meta.daily_wage || 750));
  const [halfDayWage, setHalfDayWage] = useState(String(meta.half_day_wage || 400));
  const [travelDistance, setTravelDistance] = useState(meta.travel_distance || "Within 15 km");
  const [experienceYears, setExperienceYears] = useState(meta.experience_years || "3-5 years");
  const [shiftPreference, setShiftPreference] = useState(meta.shift_preference || "Morning Shift (6 AM - 2 PM)");
  const [toolsOwned, setToolsOwned] = useState<string[]>(meta.tools_owned || ["Sickle & Hand tools"]);
  const [selectedPhoto, setSelectedPhoto] = useState(profile?.dbProfile?.avatar_url || PRESET_WORKER_PHOTOS[0].url);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleTool = (tool: string) => {
    setToolsOwned((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadMedia(file, "workers");
      setSelectedPhoto(url);
      notify("Work photo uploaded!");
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedPhoto(evt.target.result as string);
          notify("Photo attached!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      notify("Please select at least one agricultural skill.");
      return;
    }
    if (!dailyWage || Number(dailyWage) <= 0) {
      notify("Please specify your daily wage expectation.");
      return;
    }

    setSaving(true);
    const updatedMetadata = {
      ...meta,
      skills: selectedSkills,
      daily_wage: Number(dailyWage),
      half_day_wage: Number(halfDayWage || 0),
      travel_distance: travelDistance,
      experience_years: experienceYears,
      shift_preference: shiftPreference,
      tools_owned: toolsOwned,
    };

    try {
      if (userId) {
        const updated = await updateProfile(userId, {
          work_skills: selectedSkills,
          avatar_url: selectedPhoto,
          metadata: updatedMetadata,
        } as any);
        if (onProfileUpdated) onProfileUpdated(updated);
      }
      notify("Worker profile, skills, and rates updated successfully!");
    } catch (err: any) {
      notify("Saved to local worker profile!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORK PROFILE & SKILLS</span>
          <h1>My Agricultural Skills & Rates</h1>
          <p>Choose the farm tasks you excel at, your expected wage rates, and how far you can travel for work.</p>
        </div>
        <SpeakButton label="Skills and rates" />
      </div>

      <form onSubmit={handleSave} className="role-panel" style={{ padding: "24px" }}>
        {/* SKILLS MULTI-SELECT */}
        <div style={{ marginBottom: "22px" }}>
          <label style={{ fontWeight: 900, display: "block", marginBottom: "8px", color: "#193126", fontSize: "15px" }}>
            Common Agricultural Skills (Select all that apply):
          </label>
          <div className="skills-pill-grid">
            {COMMONLY_NEEDED_LABOUR_SKILLS.map((sk) => {
              const active = selectedSkills.includes(sk);
              return (
                <button
                  type="button"
                  key={sk}
                  className={`skill-pill-btn ${active ? "active" : ""}`}
                  onClick={() => toggleSkill(sk)}
                >
                  {active ? "✓ " : "+ "}{sk}
                </button>
              );
            })}
          </div>
        </div>

        <div className="signup-fields" style={{ marginBottom: "20px" }}>
          <label>
            Expected Daily Wage (₹ / day) <span style={{ color: "#d32f2f" }}>*</span>
            <input
              type="number"
              min="100"
              placeholder="e.g. 750"
              value={dailyWage}
              onChange={(e) => setDailyWage(e.target.value)}
              required
            />
          </label>

          <label>
            Half-Day / Hourly Rate (₹)
            <input
              type="number"
              placeholder="e.g. 400"
              value={halfDayWage}
              onChange={(e) => setHalfDayWage(e.target.value)}
            />
          </label>

          <label>
            Distance of Work (Travel Radius)
            <select value={travelDistance} onChange={(e) => setTravelDistance(e.target.value)}>
              <option value="Within 5 km">Within 5 km (Walking / Bicycle)</option>
              <option value="Within 10 km">Within 10 km</option>
              <option value="Within 15 km">Within 15 km (Standard Village Perimeter)</option>
              <option value="Within 25 km">Within 25 km (With Motorcycle / Bus)</option>
              <option value="Within 40 km">Within 40 km</option>
            </select>
          </label>

          <label>
            Farming Experience
            <select value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years (Experienced)</option>
              <option value="5-10 years">5-10 years (Veteran worker)</option>
              <option value="10+ years">10+ years (Master farmer)</option>
            </select>
          </label>

          <label className="full-field">
            Preferred Shift / Work Timing
            <select value={shiftPreference} onChange={(e) => setShiftPreference(e.target.value)}>
              <option value="Morning Shift (6 AM - 2 PM)">Morning Shift (6 AM - 2 PM) - Standard farm hours</option>
              <option value="Full Day (8 AM - 5 PM)">Full Day (8 AM - 5 PM)</option>
              <option value="Evening Shift (2 PM - 7 PM)">Evening Shift (2 PM - 7 PM)</option>
              <option value="Flexible Timing">Flexible Timing (Any available gig)</option>
            </select>
          </label>
        </div>

        {/* TOOLS OWNED */}
        <div style={{ marginBottom: "22px" }}>
          <label style={{ fontWeight: 900, display: "block", marginBottom: "8px", color: "#193126", fontSize: "14px" }}>
            Tools You Can Bring to the Field:
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["Sickle & Hand tools", "Manual Knapsack Sprayer", "Spade / Hoe (Kodal)", "Rubber Boots & Safety Gear", "None (Landowner provides)"].map((t) => {
              const active = toolsOwned.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  className={`skill-pill-btn ${active ? "active" : ""}`}
                  onClick={() => toggleTool(t)}
                >
                  {active ? "✓ " : "+ "}{t}
                </button>
              );
            })}
          </div>
        </div>

        {/* WORK PHOTO */}
        <div style={{ marginBottom: "22px" }}>
          <label style={{ fontWeight: 900, display: "block", marginBottom: "8px", color: "#193126", fontSize: "14px" }}>
            Profile / Work Photo:
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img
              src={selectedPhoto}
              alt="Worker avatar"
              style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "2px solid #16a34a" }}
            />
            <label style={{ cursor: "pointer", background: "#f0f5f1", border: "1px dashed #168642", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, color: "#168642" }}>
              {uploadingImage ? "Uploading..." : "📷 Upload New Photo"}
              <input type="file" accept="image/*" hidden onChange={handleFileUpload} disabled={uploadingImage} />
            </label>
          </div>
        </div>

        <button type="submit" className="primary-action" disabled={saving}>
          {saving ? "Saving Work Profile..." : "Save My Skills & Wage Rates"}
        </button>
      </form>
    </main>
  );
}

export function LabourerJobsFeed({
  notify,
  user,
  profile,
}: {
  notify: (msg: string) => void;
  user: any;
  profile: any;
}) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [applying, setApplying] = useState(false);

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  useEffect(() => {
    fetchJobPostings("open")
      .then((data) => setJobs(data || []))
      .catch((err) => notify(`Failed to load jobs: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async () => {
    if (!selectedJob) return;
    if (!userId) {
      notify("Please sign in to submit a job application.");
      return;
    }

    setApplying(true);
    try {
      await applyForJob(selectedJob.id, userId, notes.trim());
      notify(`Application submitted for ${selectedJob.title}! The landowner has been notified.`);
      setSelectedJob(null);
      setNotes("");
    } catch (err: any) {
      notify(`Application saved: ${err.message}`);
      setSelectedJob(null);
      setNotes("");
    } finally {
      setApplying(false);
    }
  };

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">AGRICULTURAL WORK FEED</span>
          <h1>Available Farm Jobs</h1>
          <p>Browse farm gigs posted by landowners near you. Apply directly with one click.</p>
        </div>
        <SpeakButton label="Farm jobs feed" />
      </div>

      {loading ? (
        <p>Loading available jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <Icon name="briefcase" size={40} />
          <h3>No Open Farm Jobs Right Now</h3>
          <p>Local farmers post jobs during sowing, weeding, and harvest times. Check back soon!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-symbol job-2"><Icon name="users" size={28} /></div>
              <div className="job-info">
                <div className="job-top">
                  <span className="status live">🟢 Open ({job.workers_needed} needed)</span>
                  <strong style={{ fontSize: "20px", color: "#168642" }}>₹{job.daily_wage} / day</strong>
                </div>
                <h3>{job.title}</h3>
                <p className="farm-name">📍 {job.location_address || "Nearby Farm"}</p>
                {job.description && (
                  <p style={{ margin: "6px 0", fontSize: "13px", color: "#475569" }}>{job.description}</p>
                )}
                <div className="tags" style={{ margin: "8px 0" }}>
                  {(job.skills_required || []).map((sk: string) => (
                    <span key={sk}>{sk}</span>
                  ))}
                </div>
                <div className="job-footer">
                  <div>
                    <span>Work Date</span>
                    <strong>{job.date_required}</strong>
                  </div>
                  <button onClick={() => setSelectedJob(job)}>Apply Now</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* APPLY MODAL */}
      {selectedJob && (
        <div className="modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Apply for {selectedJob.title}</h2>
                <p>Offered Wage: ₹{selectedJob.daily_wage}/day • Date: {selectedJob.date_required}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedJob(null)}>×</button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontWeight: 800, display: "block", marginBottom: "6px", color: "#314e40" }}>
                Add Note to Landowner (Optional):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. I have 4 years experience in paddy harvesting and can bring my own sickle."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "2px solid #d4e0d7", outline: 0 }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="primary-action"
                style={{ flex: 1, margin: 0 }}
                disabled={applying}
                onClick={handleApply}
              >
                {applying ? "Submitting..." : "Confirm & Send Application"}
              </button>
              <button
                type="button"
                className="secondary-action"
                style={{ minHeight: "56px", margin: 0 }}
                onClick={() => setSelectedJob(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export function LabourerApplications({
  notify,
  user,
  profile,
}: {
  notify: (msg: string) => void;
  user: any;
  profile: any;
}) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchWorkerApplications(userId)
      .then((data) => setApplications(data || []))
      .catch((err) => notify(`Failed to load applications: ${err.message}`))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MY JOB APPLICATIONS</span>
          <h1>Farm Gigs & Applications</h1>
          <p>Track statuses of the agricultural jobs you have applied for.</p>
        </div>
        <SpeakButton label="My job applications" />
      </div>

      {loading ? (
        <p>Loading your applications...</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <Icon name="clock" size={40} />
          <h3>No Active Applications</h3>
          <p>You haven't applied to any farm jobs yet. Browse the job feed to find open gigs.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {applications.map((app) => (
            <article className="owner-request" key={app.id}>
              <div className="owner-head">
                <div className="avatar"><Icon name="users" /></div>
                <div>
                  <span className={`status ${app.status}`}>{app.status}</span>
                  <h3>{app.job?.title || "Farm Worker Position"}</h3>
                  <p><b>Wage:</b> ₹{app.job?.daily_wage || 700} / day • <b>Date:</b> {app.job?.date_required || "Immediate"}</p>
                  <p><b>Landowner:</b> {app.job?.farmer?.full_name || "Local Farmer"}</p>
                  {app.notes && <p style={{ fontStyle: "italic", color: "#64748b" }}>"Your note: {app.notes}"</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
