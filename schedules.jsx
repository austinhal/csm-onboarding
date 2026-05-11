/* Task week schedules: phaseId::taskName -> [startWeek, endWeek], 1-indexed across 13 weeks */
const DEFAULT_SCHEDULES = {
  // Phase 1 — Orientation (all week 1)
  'orientation::HR Orientation': [1, 1],
  'orientation::Team Introductions': [1, 1],
  'orientation::Welcome Lunch': [1, 1],
  'orientation::Workspace Setup': [1, 1],
  'orientation::Hardware Pickup': [1, 1],
  'orientation::Computer Setup': [1, 1],
  'orientation::Cell Phone': [1, 1],
  'orientation::Desk Phone': [1, 1],
  'orientation::Login Credentials': [1, 1],
  'orientation::Email Setup': [1, 1],
  'orientation::Voicemail Setup': [1, 1],
  'orientation::Software Setup (SSO)': [1, 1],
  'orientation::Okta App Assignments': [1, 1],
  'orientation::Oracle Fusion (Goals/PTO)': [1, 1],
  'orientation::Oracle Fusion (Expenses)': [1, 1],
  'orientation::Xactware Classroom Access': [1, 1],
  'orientation::ServiceNow Access': [1, 1],
  'orientation::Phone App Setup': [1, 1],

  // Phase 2 — Product Training (Weeks 1–4)
  'product::Xactimate Standard Training': [1, 2],
  'product::XactAnalysis Standard Training': [2, 3],
  'product::XactAnalysis Mastery Training': [3, 3],
  'product::XactAnalysis Insights Training': [3, 3],
  'product::XactContents': [4, 4],
  'product::Benchmark Reports': [4, 4],
  'product::ClaimXperience Standard Training': [3, 3],
  'product::XactXpert': [4, 4],
  'product::EDI Implementation Training': [4, 4],

  // Phase 3 — Process & Workflow (Weeks 2–8)
  'process::Keycode Manager Training': [2, 2],
  'process::Salesforce Training': [2, 2],
  'process::Zuora Training': [3, 3],
  'process::ContentsTrack Admin': [3, 3],
  'process::Xactimate Admin Tool': [4, 4],
  'process::XactAnalysis Admin Training': [4, 4],
  'process::Submitting XA Config Changes': [5, 5],
  'process::Submitting Dataset Requests': [5, 5],
  'process::Submitting Data Updates': [5, 5],
  'process::Submitting ProductBoard Ideas': [6, 6],
  'process::Submitting Dev Requests': [6, 6],
  'process::Submitting Ad-hoc Reports': [6, 6],
  'process::Jira Search & Tracking': [7, 7],
  'process::Stewardship Meeting Roles': [7, 7],
  'process::Problem Management Training': [8, 8],
  'process::Confluence Training': [8, 8],

  // Phase 4 — Mentor (Ongoing)
  'mentor::Weeks 1–2: Alignment': [1, 2],
  'mentor::Weeks 3–4: Meeting Prep': [3, 4],
  'mentor::Days 30–60: Account Transition': [5, 8],
  'mentor::Days 60–90: Independence': [9, 13],

  // Phase 4 — Buddy (Ongoing)
  'mentor::Weeks 1–2: Daily Check-ins': [1, 2],
  'mentor::Weeks 3–4: Ongoing Support': [3, 4],
  'mentor::Days 30–60: Shadow & Prep': [5, 8],
  'mentor::Days 60–90: Transition': [9, 13],

  // Phase 5 — Practical (Days 1–90)
  'practical::Days 1–30: Foundation': [1, 4],
  'practical::Days 30–60: Application': [5, 8],
  'practical::Days 60–90: Mastery': [9, 13],
};

const TOTAL_WEEKS = 13;

Object.assign(window, { DEFAULT_SCHEDULES, TOTAL_WEEKS });
