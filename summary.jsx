/* Summary view — all user-entered notes, with save + email actions */
const { useState: useStateSum, useMemo: useMemoSum } = React;

function buildSummaryData(phases, schedules, statuses, notes) {
  const sections = [];
  for (const phase of phases) {
    const items = [];
    for (const task of phaseTasks(phase)) {
      const key = `${phase.id}::${task.name}`;
      const note = (notes[key] || '').trim();
      if (!note) continue;
      const span = getScheduleFor(schedules, phase.id, task.name);
      items.push({
        key, name: task.name, by: task.by, tool: task.tool,
        status: statuses[key] || 'not_started',
        span, note,
      });
    }
    if (items.length) sections.push({ phase, items });
  }
  return sections;
}

function buildEmailBody(profile, sections) {
  const lines = [];
  lines.push(`Onboarding Notes Summary`);
  lines.push(`========================`);
  lines.push('');
  if (profile.name) lines.push(`Name: ${profile.name}`);
  if (profile.startDate) lines.push(`Start date: ${profile.startDate}`);
  if (profile.manager) lines.push(`Manager: ${profile.manager}`);
  if (profile.mentor) lines.push(`Mentor: ${profile.mentor}`);
  if (profile.buddy) lines.push(`Buddy: ${profile.buddy}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  if (!sections.length) {
    lines.push('No notes entered yet.');
    return lines.join('\n');
  }
  for (const sec of sections) {
    lines.push(`-- ${sec.phase.title} --`);
    for (const it of sec.items) {
      const status = STATUS_BY_ID[it.status]?.label || it.status;
      const wk = it.span[0] === it.span[1] ? `Week ${it.span[0]}` : `Weeks ${it.span[0]}–${it.span[1]}`;
      lines.push('');
      lines.push(`• ${it.name}  [${status}] (${wk})`);
      if (it.by || it.tool) lines.push(`  ${[it.by, it.tool].filter(Boolean).join(' · ')}`);
      lines.push(`  Notes: ${it.note.replace(/\n/g, '\n         ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function SummaryButton({ onClick, count }) {
  return (
    <button onClick={onClick}
            style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h10M3 12h7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      Notes summary
      {count > 0 && (
        <span style={{
          background: '#fff', color: T.primary, padding: '1px 7px',
          borderRadius: 999, fontSize: 10.5, fontWeight: 600, letterSpacing: 0,
        }}>{count}</span>
      )}
    </button>
  );
}

function SummaryModal({ profile, phases, schedules, statuses, notes, onClose }) {
  const sections = useMemoSum(() => buildSummaryData(phases, schedules, statuses, notes), [phases, schedules, statuses, notes]);
  const totalNotes = sections.reduce((a, s) => a + s.items.length, 0);

  function handleSave() {
    const body = buildEmailBody(profile, sections);
    const stamp = new Date().toISOString().slice(0, 10);
    const safeName = (profile.name || 'onboarding').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    downloadText(`${safeName}-notes-${stamp}.txt`, body);
  }

  function handleEmail() {
    const who = profile.name ? ` — ${profile.name}` : '';
    const subject = `Onboarding Notes Summary${who}`;
    const body = buildEmailBody(profile, sections);
    // mailto length limits vary; keep but warn
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  return (
    <div style={summaryBackdrop} onClick={onClose}>
      <div style={summaryModal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          background: T.primary, color: '#fff', padding: '24px 30px 22px',
          borderTopLeftRadius: 14, borderTopRightRadius: 14, position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 500,
                            letterSpacing: '0.18em', textTransform: 'uppercase',
                            color: '#8fb5e0', marginBottom: 6 }}>
                For your manager
              </div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, margin: 0,
                           letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Notes summary
              </h2>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#c8d9ee',
                            fontWeight: 300, marginTop: 6 }}>
                {totalNotes === 0
                  ? 'You haven\'t added any notes yet.'
                  : `${totalNotes} ${totalNotes === 1 ? 'note' : 'notes'} across ${sections.length} ${sections.length === 1 ? 'phase' : 'phases'}`}
              </div>
            </div>
            <button onClick={onClose}
                    style={{ background: 'transparent', border: 'none', color: '#fff',
                             fontSize: 24, cursor: 'pointer', padding: 4, opacity: 0.7 }}>×</button>
          </div>
        </div>

        {/* Action bar */}
        <div style={{
          display: 'flex', gap: 8, padding: '12px 30px', borderBottom: `1px solid ${T.line}`,
          background: T.paperWarm,
        }}>
          <ActionIcon onClick={handleSave} disabled={totalNotes === 0} label="Save as .txt">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save
          </ActionIcon>
          <ActionIcon onClick={handleEmail} disabled={totalNotes === 0} label="Open in email client" primary>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2.5 4.5L8 9l5.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Email to manager
          </ActionIcon>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 30px 26px', overflowY: 'auto', flex: 1 }}>
          {totalNotes === 0 ? (
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: T.inkMute, fontWeight: 300,
              textAlign: 'center', padding: '40px 0', fontStyle: 'italic', textWrap: 'pretty',
            }}>
              Open any task and write something in the "My notes" box. Your entries will collect here for easy sharing with your manager.
            </div>
          ) : (
            <>
              {profile.name && (
                <div style={{
                  background: '#f0f3fa', borderRadius: 8, padding: '12px 14px', marginBottom: 18,
                  fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: T.inkSoft, fontWeight: 300,
                  display: 'flex', flexWrap: 'wrap', gap: 14,
                }}>
                  <Meta label="Name">{profile.name}</Meta>
                  {profile.startDate && <Meta label="Start">{profile.startDate}</Meta>}
                  {profile.manager && <Meta label="Manager">{profile.manager}</Meta>}
                  {profile.mentor && <Meta label="Mentor">{profile.mentor}</Meta>}
                  {profile.buddy && <Meta label="Buddy">{profile.buddy}</Meta>}
                </div>
              )}
              {sections.map(sec => (
                <div key={sec.phase.id} style={{ marginBottom: 22 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                    paddingBottom: 8, borderBottom: `1px solid ${T.line}`,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2,
                                  background: PHASE_COLORS[sec.phase.id] || T.primary }} />
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 500,
                                  color: T.ink, letterSpacing: '-0.01em', flex: 1 }}>
                      {sec.phase.title}
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.inkMute, fontWeight: 400 }}>
                      {sec.items.length} {sec.items.length === 1 ? 'note' : 'notes'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sec.items.map(it => (
                      <div key={it.key} style={{
                        background: '#fff', border: `1px solid ${T.line}`,
                        borderLeft: `3px solid ${PHASE_COLORS[sec.phase.id] || T.primary}`,
                        borderRadius: 6, padding: '12px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: T.ink, flex: 1, minWidth: 0 }}>
                            {it.name}
                          </div>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, fontWeight: 500,
                                         letterSpacing: '0.08em', textTransform: 'uppercase',
                                         color: T.inkMute, background: T.lineSoft, padding: '2px 7px', borderRadius: 3 }}>
                            {it.span[0] === it.span[1] ? `Wk ${it.span[0]}` : `Wks ${it.span[0]}–${it.span[1]}`}
                          </span>
                          <StatusPill statusId={it.status} size="sm" />
                        </div>
                        <div style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.55,
                          color: T.inkSoft, fontWeight: 300, whiteSpace: 'pre-wrap', textWrap: 'pretty',
                        }}>{it.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: T.primary, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: T.ink, fontWeight: 400 }}>{children}</div>
    </div>
  );
}

function ActionIcon({ onClick, disabled, primary, label, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: disabled ? '#eee' : (primary ? T.accent : '#fff'),
              color: disabled ? '#aaa' : (primary ? '#fff' : T.primary),
              border: `1.5px solid ${disabled ? '#ddd' : (primary ? T.accent : T.primary)}`,
              borderRadius: 6, padding: '7px 13px', cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.03em', transition: 'transform 0.1s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
      {children}
    </button>
  );
}

const summaryBackdrop = {
  position: 'fixed', inset: 0, background: 'rgba(15,32,43,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  padding: 24, animation: 'fadeUp 0.18s ease',
};
const summaryModal = {
  background: '#fff', borderRadius: 14, width: '100%', maxWidth: 720,
  maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  boxShadow: '0 24px 60px rgba(15,40,71,0.3)',
};

Object.assign(window, { SummaryButton, SummaryModal, buildSummaryData });
