/* Admin mode: toggle button + task editor modal */
const { useState: useStateAdm, useEffect: useEffectAdm } = React;

function AdminToggle({ adminMode, setAdminMode, onAddTask, onResetAll }) {
  const [open, setOpen] = useStateAdm(false);
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 90, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {adminMode && open && (
        <div style={{
          background: '#fff', border: `1px solid ${T.line}`, borderRadius: 10,
          padding: '12px 14px', boxShadow: '0 8px 28px rgba(15,40,71,0.18)',
          fontFamily: 'Inter, sans-serif', fontSize: 12.5, minWidth: 220,
        }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: T.primary, marginBottom: 10 }}>Admin</div>
          <button onClick={() => onAddTask()} style={adminBtnStyle(T.accent)}>+ New task</button>
          <button onClick={() => { if (confirm('Reset all content to defaults? This will erase any admin edits.')) onResetAll(); }}
                  style={adminBtnStyle('#c2582a', true)}>Reset content to defaults</button>
          <div style={{ fontSize: 10.5, color: T.inkMute, marginTop: 8, lineHeight: 1.4 }}>
            Hover any task to edit or delete. User progress (status, notes) is unaffected.
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {adminMode && (
          <button onClick={() => setOpen(o => !o)}
                  style={{
                    background: '#fff', color: T.primary, border: `1.5px solid ${T.primary}`,
                    borderRadius: 999, padding: '8px 14px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{open ? 'Close' : 'Menu'}</button>
        )}
        <button onClick={() => { setAdminMode(!adminMode); setOpen(false); }}
                style={{
                  background: adminMode ? T.primary : '#fff',
                  color: adminMode ? '#fff' : T.primary,
                  border: `1.5px solid ${T.primary}`,
                  borderRadius: 999, padding: '8px 16px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  boxShadow: '0 4px 14px rgba(15,40,71,0.15)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
          <span style={{ fontSize: 9 }}>{adminMode ? '●' : '○'}</span> Admin
        </button>
      </div>
    </div>
  );
}

function adminBtnStyle(color, ghost = false) {
  return {
    display: 'block', width: '100%', textAlign: 'left',
    background: ghost ? 'transparent' : color, color: ghost ? color : '#fff',
    border: ghost ? `1px solid ${color}` : 'none',
    borderRadius: 6, padding: '7px 10px', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
    marginBottom: 6,
  };
}

function TaskEditor({ initial, phases, isNew, onSave, onCancel, onDelete }) {
  const [phaseId, setPhaseId] = useStateAdm(initial.phaseId || 'orientation');
  const [sectionLabel, setSectionLabel] = useStateAdm(initial.sectionLabel || '');
  const [name, setName] = useStateAdm(initial.task.name || '');
  const [by, setBy] = useStateAdm(initial.task.by || '');
  const [tool, setTool] = useStateAdm(initial.task.tool || '');
  const [desc, setDesc] = useStateAdm(initial.task.desc || '');
  const [assessment, setAssessment] = useStateAdm(initial.task.assessment || '');
  const [practice, setPractice] = useStateAdm(initial.task.practice || '');
  const [weekStart, setWeekStart] = useStateAdm(initial.span?.[0] || 1);
  const [weekEnd, setWeekEnd] = useStateAdm(initial.span?.[1] || 1);
  const [err, setErr] = useStateAdm('');

  const currentPhase = phases.find(p => p.id === phaseId);
  const sectionOptions = currentPhase?.sections?.map(s => s.label) || [];

  useEffectAdm(() => {
    // when phase changes, reset section if not valid
    if (currentPhase?.sections && !sectionOptions.includes(sectionLabel)) {
      setSectionLabel(sectionOptions[0] || '');
    }
    if (!currentPhase?.sections) setSectionLabel('');
  }, [phaseId]);

  function save() {
    if (!name.trim()) { setErr('Name is required'); return; }
    if (Number(weekStart) > Number(weekEnd)) { setErr('Start week must be ≤ end week'); return; }
    const task = {
      name: name.trim(),
      by: by.trim() || null,
      tool: tool.trim() || null,
      desc: desc.trim(),
    };
    if (assessment.trim()) task.assessment = assessment.trim();
    if (practice.trim()) task.practice = practice.trim();
    onSave({
      phaseId,
      sectionLabel: sectionLabel || null,
      task,
      span: [Number(weekStart), Number(weekEnd)],
      oldName: initial.task.name,
      oldPhaseId: initial.phaseId,
    });
  }

  return (
    <div style={modalBackdropStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, margin: 0,
                       letterSpacing: '-0.02em', color: T.ink }}>
            {isNew ? 'New task' : 'Edit task'}
          </h2>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', fontSize: 22, color: T.inkMute, cursor: 'pointer' }}>×</button>
        </div>

        <Field label="Task name">
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Salesforce Training" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Phase">
            <select value={phaseId} onChange={e => setPhaseId(e.target.value)} style={inputStyle}>
              {phases.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </Field>
          {sectionOptions.length > 0 && (
            <Field label="Section">
              <select value={sectionLabel} onChange={e => setSectionLabel(e.target.value)} style={inputStyle}>
                {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Delivered by">
            <input value={by} onChange={e => setBy(e.target.value)} style={inputStyle} placeholder="HR / Manager / Self-Paced…" />
          </Field>
          <Field label="Tool / platform">
            <input value={tool} onChange={e => setTool(e.target.value)} style={inputStyle} placeholder="Salesforce / Jira / Okta…" />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Start week">
            <input type="number" min="1" max={TOTAL_WEEKS} value={weekStart}
                   onChange={e => setWeekStart(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="End week">
            <input type="number" min="1" max={TOTAL_WEEKS} value={weekEnd}
                   onChange={e => setWeekEnd(e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <Field label="Description">
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="What does this task involve?" />
        </Field>

        <Field label="Assessment (optional)">
          <textarea value={assessment} onChange={e => setAssessment(e.target.value)} rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="How is this measured?" />
        </Field>

        <Field label="Practice (optional)">
          <textarea value={practice} onChange={e => setPractice(e.target.value)} rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Hands-on practice exercise" />
        </Field>

        {err && <div style={{ color: '#c2582a', fontSize: 12, marginBottom: 10 }}>{err}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 18 }}>
          <div>
            {!isNew && (
              <button onClick={() => { if (confirm(`Delete "${initial.task.name}"? This will remove user status & notes for it.`)) onDelete(); }}
                      style={{
                        background: '#fff', color: '#c2582a', border: `1px solid #c2582a`,
                        borderRadius: 6, padding: '9px 16px', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 500,
                      }}>Delete task</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onCancel} style={{
              background: '#fff', color: T.inkSoft, border: `1px solid ${T.line}`,
              borderRadius: 6, padding: '9px 16px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 500,
            }}>Cancel</button>
            <button onClick={save} style={{
              background: T.primary, color: '#fff', border: 'none',
              borderRadius: 6, padding: '9px 18px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600,
            }}>{isNew ? 'Create task' : 'Save changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 600,
                     letterSpacing: '0.1em', textTransform: 'uppercase', color: T.primary }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400,
  color: T.ink, padding: '9px 12px', border: `1.5px solid #d3d9e3`,
  borderRadius: 6, background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box',
};

const modalBackdropStyle = {
  position: 'fixed', inset: 0, background: 'rgba(15,32,43,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  padding: '24px', animation: 'fadeUp 0.18s ease',
};

const modalStyle = {
  background: '#fff', borderRadius: 14, padding: '28px 30px',
  maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 24px 60px rgba(15,40,71,0.3)',
};

Object.assign(window, { AdminToggle, TaskEditor });
