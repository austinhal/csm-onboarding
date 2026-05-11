/* Root app + storage */
const { useState: useStateRoot, useEffect: useEffectRoot, useCallback: useCallbackRoot, useMemo: useMemoRoot } = React;

const STORAGE_KEY = 'v-onb-v6-cal';

function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw); }
  catch (e) { return null; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

function App() {
  const initial = loadState() || {};
  const [profile, setProfile] = useStateRoot(initial.p || { name: '', startDate: '', manager: '', mentor: '', buddy: '' });
  const [statuses, setStatuses] = useStateRoot(initial.s || {});
  const [notes, setNotes] = useStateRoot(initial.n || {});
  const [welcomed, setWelcomed] = useStateRoot(!!initial.w);
  const [expanded, setExpanded] = useStateRoot(null);
  const [savedFlash, setSavedFlash] = useStateRoot(false);

  // Editable content
  const [phases, setPhases] = useStateRoot(initial.phases || DEFAULT_PHASES);
  const [schedules, setSchedules] = useStateRoot(initial.schedules || DEFAULT_SCHEDULES);

  // Collapsible week state
  const [collapsedArr, setCollapsedArr] = useStateRoot(initial.cw || null);
  const collapsedWeeks = useMemoRoot(() => new Set(collapsedArr || []), [collapsedArr]);

  // Initialize collapsed: collapse all except current week (computed from start date)
  useEffectRoot(() => {
    if (collapsedArr !== null) return;
    const dayN = profile.startDate ? Math.floor((new Date() - new Date(profile.startDate + 'T00:00:00')) / 86400000) + 1 : null;
    const currentWeek = (dayN && dayN > 0 && dayN <= TOTAL_WEEKS * 7) ? Math.ceil(dayN / 7) : 1;
    const initialCollapsed = [];
    for (let w = 1; w <= TOTAL_WEEKS; w++) if (w !== currentWeek) initialCollapsed.push(w);
    setCollapsedArr(initialCollapsed);
  }, []);

  // Admin
  const [adminMode, setAdminMode] = useStateRoot(false);
  const [editorState, setEditorState] = useStateRoot(null); // null | { isNew, initial }

  useEffectRoot(() => {
    const h = setTimeout(() => {
      saveState({ p: profile, s: statuses, n: notes, w: welcomed, phases, schedules, cw: collapsedArr });
      setSavedFlash(true);
      const t = setTimeout(() => setSavedFlash(false), 900);
      return () => clearTimeout(t);
    }, 250);
    return () => clearTimeout(h);
  }, [profile, statuses, notes, welcomed, phases, schedules, collapsedArr]);

  const setStatus = useCallbackRoot((key, s) => setStatuses(prev => ({ ...prev, [key]: s })), []);
  const setNote = useCallbackRoot((key, n) => setNotes(prev => ({ ...prev, [key]: n })), []);

  const toggleWeek = useCallbackRoot((w) => {
    setCollapsedArr(prev => {
      const set = new Set(prev || []);
      if (set.has(w)) set.delete(w); else set.add(w);
      return Array.from(set).sort((a, b) => a - b);
    });
  }, []);
  const expandAll = useCallbackRoot(() => setCollapsedArr([]), []);
  const collapseAll = useCallbackRoot(() => setCollapsedArr(Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1)), []);

  // Open editor for an existing task
  const openEditTask = useCallbackRoot((item) => {
    const span = getScheduleFor(schedules, item.phase.id, item.task.name);
    const loc = findTaskLocation(phases, item.phase.id, item.task.name);
    setEditorState({
      isNew: false,
      initial: {
        phaseId: item.phase.id,
        sectionLabel: loc?.sectionLabel || null,
        task: { ...item.task },
        span,
      },
    });
  }, [phases, schedules]);

  // Open editor for a new task in a specific week
  const openAddToWeek = useCallbackRoot((weekNum) => {
    setEditorState({
      isNew: true,
      initial: {
        phaseId: phases[0].id,
        sectionLabel: null,
        task: { name: '', by: '', tool: '', desc: '' },
        span: [weekNum, weekNum],
      },
    });
  }, [phases]);

  // Open editor for a new task without a preferred week (admin menu)
  const openAdd = useCallbackRoot(() => openAddToWeek(1), [openAddToWeek]);

  const handleSave = useCallbackRoot((data) => {
    const { phaseId, sectionLabel, task, span, oldName, oldPhaseId } = data;
    const newKey = `${phaseId}::${task.name}`;

    if (editorState.isNew) {
      setPhases(prev => addTask(prev, phaseId, sectionLabel, task));
      setSchedules(prev => ({ ...prev, [newKey]: span }));
    } else {
      // Edit existing — handle rename and phase moves
      const oldKey = `${oldPhaseId}::${oldName}`;
      // Remove from old phase if moved
      let nextPhases = phases;
      if (oldPhaseId !== phaseId) {
        nextPhases = deleteTask(nextPhases, oldPhaseId, oldName);
        nextPhases = addTask(nextPhases, phaseId, sectionLabel, task);
      } else {
        nextPhases = updateTask(nextPhases, phaseId, oldName, task, sectionLabel);
      }
      setPhases(nextPhases);

      // Migrate schedule + statuses + notes if key changed
      if (oldKey !== newKey) {
        setSchedules(prev => {
          const out = { ...prev };
          delete out[oldKey];
          out[newKey] = span;
          return out;
        });
        setStatuses(prev => {
          if (!(oldKey in prev)) return prev;
          const out = { ...prev };
          out[newKey] = out[oldKey];
          delete out[oldKey];
          return out;
        });
        setNotes(prev => {
          if (!(oldKey in prev)) return prev;
          const out = { ...prev };
          out[newKey] = out[oldKey];
          delete out[oldKey];
          return out;
        });
      } else {
        setSchedules(prev => ({ ...prev, [newKey]: span }));
      }
    }
    setEditorState(null);
  }, [editorState, phases]);

  const handleDelete = useCallbackRoot(() => {
    if (!editorState || editorState.isNew) return;
    const { phaseId, task } = editorState.initial;
    const key = `${phaseId}::${task.name}`;
    setPhases(prev => deleteTask(prev, phaseId, task.name));
    setSchedules(prev => removeScheduleKey(prev, phaseId, task.name));
    setStatuses(prev => { const o = { ...prev }; delete o[key]; return o; });
    setNotes(prev => { const o = { ...prev }; delete o[key]; return o; });
    setEditorState(null);
  }, [editorState]);

  const resetAll = useCallbackRoot(() => {
    setPhases(DEFAULT_PHASES);
    setSchedules(DEFAULT_SCHEDULES);
  }, []);

  // Summary modal
  const [summaryOpen, setSummaryOpen] = useStateRoot(false);
  const summaryCount = useMemoRoot(() => {
    let n = 0;
    for (const phase of phases) for (const t of phaseTasks(phase)) {
      const k = `${phase.id}::${t.name}`;
      if ((notes[k] || '').trim()) n++;
    }
    return n;
  }, [phases, notes]);

  return (
    <div style={{ minHeight: '100vh', background: T.paper }}>
      <CalendarView
        phases={phases} schedules={schedules}
        profile={profile} setProfile={setProfile}
        statuses={statuses} notes={notes}
        setStatus={setStatus} setNote={setNote}
        welcomed={welcomed} setWelcomed={setWelcomed}
        expanded={expanded} setExpanded={setExpanded}
        collapsedWeeks={collapsedWeeks} toggleWeek={toggleWeek}
        expandAll={expandAll} collapseAll={collapseAll}
        adminMode={adminMode}
        onEditTask={openEditTask} onAddTaskToWeek={openAddToWeek}
        onOpenSummary={() => setSummaryOpen(true)}
        summaryCount={summaryCount}
      />

      {summaryOpen && (
        <SummaryModal
          profile={profile} phases={phases} schedules={schedules}
          statuses={statuses} notes={notes}
          onClose={() => setSummaryOpen(false)}
        />
      )}

      <AdminToggle adminMode={adminMode} setAdminMode={setAdminMode}
                   onAddTask={openAdd} onResetAll={resetAll} />

      {editorState && (
        <TaskEditor
          initial={editorState.initial}
          isNew={editorState.isNew}
          phases={phases}
          onCancel={() => setEditorState(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      <div style={{
        position: 'fixed', top: 16, right: 20, zIndex: 100,
        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: T.p5, background: T.s4Bg, padding: '5px 11px', borderRadius: 999,
        opacity: savedFlash ? 1 : 0, transform: savedFlash ? 'none' : 'translateY(-4px)',
        transition: 'opacity 0.3s, transform 0.3s', pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>●</span> Saved
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
