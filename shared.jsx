/* ProfileBlock — shared between views */
const { useState: useStateProf } = React;

function ProfileBlock({ profile, setProfile, day }) {
  const fields = [
    { key: 'name',      label: 'Your name',   placeholder: 'Alex Rivera' },
    { key: 'startDate', label: 'Start date',  placeholder: '', type: 'date' },
    { key: 'manager',   label: 'Manager',     placeholder: 'e.g. J. Carter' },
    { key: 'mentor',    label: 'Mentor',      placeholder: 'Senior CSM' },
    { key: 'buddy',     label: 'Buddy',       placeholder: 'Peer CSM' },
  ];
  return (
    <div style={{
      background: '#f0f3fa', border: `1px solid ${T.line}`, borderRadius: 10,
      padding: '22px 26px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 500,
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: T.primary }}>Your profile</div>
        {day !== null && day > 0 && (
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 500,
            color: '#fff', background: T.primary, padding: '4px 11px', borderRadius: 999,
            letterSpacing: '0.02em',
          }}>
            Day {day} of 90
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {fields.map(f => (
          <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 500,
                           color: T.primary, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {f.label}
            </span>
            <input
              type={f.type || 'text'}
              value={profile[f.key] || ''}
              placeholder={f.placeholder}
              onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 300,
                color: T.ink, padding: '8px 12px', border: `1.5px solid #d3d9e3`,
                borderRadius: 6, background: '#fff', outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accent}14`; }}
              onBlur={e => { e.target.style.borderColor = '#d3d9e3'; e.target.style.boxShadow = 'none'; }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function daysSince(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate + 'T00:00:00');
  if (isNaN(start)) return null;
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000);
  return diff + 1;
}

function phaseProgress(phase, statuses) {
  const tasks = phaseTasks(phase);
  if (!tasks.length) return 0;
  let total = 0;
  for (const t of tasks) {
    const key = `${phase.id}::${t.name}`;
    const s = STATUS_BY_ID[statuses[key]] || STATUS_BY_ID.not_started;
    total += s.weight;
  }
  return total / tasks.length;
}

function phaseCompleted(phase, statuses) {
  const tasks = phaseTasks(phase);
  let n = 0;
  for (const t of tasks) {
    const key = `${phase.id}::${t.name}`;
    if (statuses[key] === 'assessment') n++;
  }
  return { done: n, total: tasks.length };
}

Object.assign(window, { ProfileBlock, daysSince, phaseProgress, phaseCompleted });
