// All phase content from the design doc, verbatim.
const DEFAULT_PHASES = [
  {
    id: 'orientation',
    num: 1,
    title: 'Orientation & Setup',
    eyebrow: 'Phase 01 · Week 1',
    timeline: 'Week 1',
    description: 'Complete HR paperwork, meet your team, and get every system, credential, and device set up so you can work without friction from day one.',
    tasks: [
      { name: 'HR Orientation', by: 'HR', tool: null, desc: 'Complete all required HR paperwork, policy review, benefits enrollment, and compliance training.' },
      { name: 'Team Introductions', by: 'Manager', tool: null, desc: 'Meet your immediate CSM team and key cross-functional contacts (AEs, Sales Engineering, Product, Support).' },
      { name: 'Welcome Lunch', by: 'Manager', tool: null, desc: 'Casual lunch with other new hires and team members. No agenda, just get to know people.' },
      { name: 'Workspace Setup', by: 'Manager', tool: null, desc: 'Cube assignment, badge access, parking, or WFH expectations and remote work policies.' },
      { name: 'Hardware Pickup', by: 'Help Desk', tool: null, desc: 'Collect laptop, monitors, docking station, headset, and any other assigned hardware.' },
      { name: 'Computer Setup', by: 'Help Desk', tool: null, desc: 'Laptop configuration, domain join, VPN setup, and initial software installation.' },
      { name: 'Cell Phone', by: 'Help Desk', tool: null, desc: 'Company mobile device setup, MDM enrollment, and phone plan activation.' },
      { name: 'Desk Phone', by: 'Help Desk', tool: null, desc: 'Physical desk phone or Teams softphone configuration.' },
      { name: 'Login Credentials', by: 'Help Desk', tool: null, desc: 'Active Directory / SSO credentials created, tested, and MFA enrolled.' },
      { name: 'Email Setup', by: 'Help Desk', tool: 'Outlook', desc: 'Configure email client, set up your signature block, and join required distribution lists.' },
      { name: 'Voicemail Setup', by: 'Help Desk', tool: 'Teams', desc: 'Record your greeting and configure call forwarding rules.' },
      { name: 'Software Setup (SSO)', by: 'Help Desk', tool: 'Okta', desc: 'SSO access to all core applications through Okta single sign-on.' },
      { name: 'Okta App Assignments', by: 'Help Desk', tool: 'Okta', desc: 'Verify every required application appears in your Okta dashboard.' },
      { name: 'Oracle Fusion (Goals/PTO)', by: 'Manager', tool: 'Oracle', desc: 'Set up goals for the year, learn how to request PTO, and view pay statements.' },
      { name: 'Oracle Fusion (Expenses)', by: 'Manager', tool: 'Oracle', desc: 'Learn the expense report submission workflow for travel and business expenses.' },
      { name: 'Xactware Classroom Access', by: 'Shane Patterson', tool: 'Online', desc: "Get access to the product training platform for self-paced courses." },
      { name: 'ServiceNow Access', by: 'Help Desk', tool: 'ServiceNow', desc: 'Internal ticket system for submitting IT and support requests.' },
      { name: 'Phone App Setup', by: 'You', tool: 'Various', desc: 'Install Okta Verify, Microsoft Teams, Outlook, and other mobile apps on your phone.' },
    ],
  },
  {
    id: 'product',
    num: 2,
    title: 'Product Training',
    eyebrow: 'Phase 02 · Weeks 1–4',
    timeline: 'Weeks 1–4',
    description: 'Build fluency in the full product suite — from Xactimate and XactAnalysis to ClaimXperience and EDI — with certifications and hands-on practice.',
    tasks: [
      { name: 'Xactimate Standard Training', by: 'Self-Paced', tool: 'Xactware Classroom', desc: 'Write and manage estimates across all three Xactimate platforms.', assessment: 'Xactimate Level 1 and 2 Certifications', practice: 'Create a series of estimates from the training workbook.' },
      { name: 'XactAnalysis Standard Training', by: 'Self-Paced', tool: 'Xactware Classroom', desc: 'Search assignments, set up users, qualify XactNet Addresses, and run standard reporting.', assessment: 'XactAnalysis Certification Exam', practice: 'Complete assigned search, admin, and report tasks.' },
      { name: 'XactAnalysis Mastery Training', by: 'Live Session', tool: 'Online Live', desc: 'Set admin features and demonstrate XactAnalysis fundamentals at a deeper level.', assessment: 'Deliver a training on XA and XA Insights', practice: 'Complete admin and Insights report exercises.' },
      { name: 'XactAnalysis Insights Training', by: 'Self-Paced', tool: 'Xactware Classroom', desc: 'Run reports, liveboards, answers, and formulas in XA Insights.', assessment: 'Pass the Insights assessment', practice: 'Build Insights reports from scenario prompts.' },
      { name: 'XactContents', by: 'Self-Paced', tool: 'Xactware Classroom', desc: 'Understand the basics of XactContents for contents inventory and valuation.', assessment: 'Complete the Xactware Classroom course', practice: 'Answer scenario-based questions on XC.' },
      { name: 'Benchmark Reports', by: 'Self-Paced', tool: 'Xactware Classroom', desc: 'Understand how Benchmark Reports work and how customers use them.', assessment: 'Complete the Xactware Classroom course', practice: 'Work through Benchmark Report scenarios.' },
      { name: 'ClaimXperience Standard Training', by: 'Self-Paced', tool: 'Xactware Classroom', desc: 'Create users, demonstrate collaboration features, and understand XM8/XA integrations.', assessment: 'Demo CX user creation, video collaboration, and new user setup', practice: 'Complete assigned CX tasks.' },
      { name: 'XactXpert', by: 'Live Session', tool: 'Online/Live', desc: 'Understand XactXpert and how Profile, Instance, and Dataset rules apply to each customer.', assessment: 'Explain how Profile, Instance, and Dataset rules differ', practice: 'Complete assigned XX tasks.' },
      { name: 'EDI Implementation Training', by: 'Self-Paced', tool: 'Online Recorded', desc: 'Understand the EDI process end-to-end so you can explain it to customers.', assessment: 'Quiz', practice: 'Work through EDI scenario exercises.' },
    ],
  },
  {
    id: 'process',
    num: 3,
    title: 'Process & Workflow',
    eyebrow: 'Phase 03 · Weeks 2–8',
    timeline: 'Weeks 2–8',
    description: 'Learn the internal systems, request pipelines, and meeting cadences that turn product knowledge into day-to-day customer work.',
    tasks: [
      { name: 'Keycode Manager Training', by: 'Recorded', tool: 'KCM / Confluence', desc: 'Create new keycodes and add features/profiles to existing ones.', assessment: 'Create a new keycode and add features/profiles', practice: 'Search existing accounts, add features/profiles.' },
      { name: 'Salesforce Training', by: 'Recorded', tool: 'Salesforce', desc: 'Create accounts, subscriptions, manage licenses, and create new instances.', assessment: 'Create accounts, manage licenses and instances', practice: 'Manage licenses for Xactimate, XactAI, CX, ContentsTrack, XC.' },
      { name: 'Zuora Training', by: 'Recorded', tool: 'Zuora', desc: 'Look up invoices, find instances, and associate child accounts to parent accounts.', assessment: 'Find instances, invoices, manage parent/child relationships', practice: 'Locate invoices, run instance and rollup group reports.' },
      { name: 'ContentsTrack Admin', by: 'Live', tool: 'ContentsTrack', desc: 'Manage admin tasks: add/remove jobs, locate instances, view job details.', assessment: 'Demo adding/removing jobs from CT admin', practice: 'Locate instances and view jobs.' },
      { name: 'Xactimate Admin Tool', by: 'Live', tool: 'XM8 Admin', desc: 'Create and manage Xactimate instances, users, feature flags, and configurations.', assessment: 'Look up users, flags, instances, licenses, profiles', practice: 'Create instance in beta, add users, change admin settings.' },
      { name: 'XactAnalysis Admin Training', by: 'Recorded', tool: 'XA Admin', desc: 'Identify dataset settings, Carrier IDs, and Queue Addresses.', assessment: 'Identify Carrier ID and Queue Address for a dataset', practice: 'Find Carrier IDs, Queue Addresses, and check feature flags.' },
      { name: 'Submitting XA Config Changes', by: 'Live', tool: 'Jira', desc: 'Submit Jira tasks for XA configuration requests.', assessment: 'Demo creation of each request type', practice: 'Complete Jira configuration tasks.' },
      { name: 'Submitting Dataset Requests', by: 'Live', tool: 'Jira', desc: 'Submit Jira tasks for new dataset creation.', assessment: 'Demo creation of dataset requests', practice: 'Complete a dataset request in Jira.' },
      { name: 'Submitting Data Updates', by: 'Live', tool: 'Jira', desc: 'Submit Jira tasks for XM8 data updates.', assessment: 'Demo creation of data update requests', practice: 'Complete data update tasks in Jira.' },
      { name: 'Submitting ProductBoard Ideas', by: 'Live', tool: 'ProductBoard', desc: 'Submit product suggestions and customer feedback.', assessment: 'Demo ProductBoard submission', practice: 'Submit a sample idea.' },
      { name: 'Submitting Dev Requests', by: 'Live', tool: 'Jira', desc: 'Submit Jira tasks for development requests.', assessment: 'Demo creation of dev requests', practice: 'Complete a development request in Jira.' },
      { name: 'Submitting Ad-hoc Reports', by: 'Live', tool: 'Jira', desc: 'Submit Jira tasks for ad-hoc report requests.', assessment: 'Demo ad-hoc report request creation', practice: 'Complete an ad-hoc request in Jira.' },
      { name: 'Jira Search & Tracking', by: 'Recorded', tool: 'Jira', desc: 'Navigate Jira to search for tasks, build filters, and create dashboards.', assessment: 'Create a dashboard and perform filtered searches', practice: 'Complete search, filter, and dashboard exercises.' },
      { name: 'Stewardship Meeting Roles', by: 'Live', tool: 'Online', desc: 'Understand meeting roles: AE, CSM, Executives, Sales Enablement.', assessment: 'Demonstrate understanding of CSM meeting role', practice: 'Review the Stewardship Meeting Roles workflow.' },
      { name: 'Problem Management Training', by: 'Live', tool: 'Confluence', desc: 'Channel problem management issues to the correct teams.', assessment: 'Demo proper channeling of PM scenarios', practice: 'Work through PM scenario exercises.' },
      { name: 'Confluence Training', by: 'Live', tool: 'Confluence', desc: 'Find and update account info, locate help docs and downtime documentation.', assessment: 'Demo finding account info, guides, and downtime docs', practice: 'Search/update accounts, find how-to guides, locate RFO/RCA examples.' },
    ],
  },
  {
    id: 'mentor',
    num: 4,
    title: 'Mentor & Buddy Program',
    eyebrow: 'Phase 04 · Ongoing',
    timeline: 'Ongoing',
    description: 'Two parallel tracks: structured coaching from a senior CSM mentor, and daily peer support from a buddy. Together they carry you from shadowing to full account ownership.',
    sections: [
      {
        label: 'Mentor Track — Senior CSM',
        tasks: [
          { name: 'Weeks 1–2: Alignment', by: 'Mentor', tool: null, desc: 'Align on onboarding plan, walk through assigned accounts, get invited to all meetings.', assessment: 'All alignment objectives covered', practice: 'Review 2–3 real customer scenarios.' },
          { name: 'Weeks 3–4: Meeting Prep', by: 'Mentor', tool: null, desc: 'Walk through meeting preparation, review past customer communications.', assessment: 'Explain claim workflow and how XA & XM8 connect', practice: 'Explain workflows in XA & XM8.' },
          { name: 'Days 30–60: Account Transition', by: 'Mentor', tool: null, desc: 'Accounts assigned and transitioned. Coach on communication and customer questions.', assessment: 'Answer basic product questions, present a workflow topic, run an agenda', practice: null },
          { name: 'Days 60–90: Independence', by: 'Mentor', tool: 'Gong', desc: 'Lead weekly and monthly customer calls. Mentor reviews Gong recordings.', assessment: 'Run meetings independently', practice: null },
        ],
      },
      {
        label: 'Buddy Track — Peer CSM',
        tasks: [
          { name: 'Weeks 1–2: Daily Check-ins', by: 'Buddy', tool: null, desc: 'Daily check-ins for system access, tools, and documentation.', assessment: 'Log Salesforce entries, review Gong calls', practice: null },
          { name: 'Weeks 3–4: Ongoing Support', by: 'Buddy', tool: null, desc: 'Buddy shares good email responses, follow-up notes, and meeting agendas.', assessment: 'Walk through common daily tasks', practice: null },
          { name: 'Days 30–60: Shadow & Prep', by: 'Buddy', tool: null, desc: 'Shadow on calls, help prep meetings, practice talking points.', assessment: 'Participating on calls and beginning account takeover', practice: null },
          { name: 'Days 60–90: Transition', by: 'Buddy', tool: null, desc: 'Full account transition. Sanity checks on emails, review meeting prep.', assessment: 'Sanity check emails, review meeting prep', practice: 'Reduce touchpoints as confidence grows.' },
        ],
      },
    ],
  },
  {
    id: 'practical',
    num: 5,
    title: 'Practical Scenarios',
    eyebrow: 'Phase 05 · Days 1–90',
    timeline: 'Days 1–90',
    description: 'Apply everything you\u2019ve learned to real customer work — from diagnosing issues to leading calls and owning relationships by Day 90.',
    tasks: [
      { name: 'Days 1–30: Foundation', by: 'You', tool: null, desc: 'Learn where to find things, how to complete internal processes, and where documentation lives.', assessment: 'Can diagnose common issues, knows who to involve, answers basic product questions', practice: 'Understand problems and identify resolution paths.' },
      { name: 'Days 30–60: Application', by: 'You', tool: null, desc: 'Start understanding customer pain points. Ask deeper questions, identify inefficiencies, guide correct workflows.', assessment: 'Handle customer calls, guide configuration conversations, deliver workflow walkthroughs', practice: 'Run part of a real customer call.' },
      { name: 'Days 60–90: Mastery', by: 'You', tool: null, desc: 'Lead and advise independently. Own customer relationships, consult on workflows, manage escalations.', assessment: 'Lead customer meetings, consult on workflows, manage escalations', practice: 'Lead real customer calls.' },
    ],
  },
];

// Flatten helper — returns every task regardless of sections.
function phaseTasks(phase) {
  if (phase.sections) return phase.sections.flatMap(s => s.tasks);
  return phase.tasks;
}

Object.assign(window, { DEFAULT_PHASES, phaseTasks });
