/* Calendar view — primary view organizing tasks by week relative to start date */
const { useState: useStateCal, useEffect: useEffectCal, useMemo: useMemoCal, useRef: useRefCal } = React;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return `${MONTHS[d.getMonth()]} ${d.getDate()}`; }

function weekDateRange(startDateStr, weekNum) {
  if (!startDateStr) return null;
  const start = new Date(startDateStr + 'T00:00:00');
  if (isNaN(start)) return null;
  const wStart = new Date(start);
  wStart.setDate(start.getDate() + (weekNum - 1) * 7);
  const wEnd = new Date(wStart);
  wEnd.setDate(wStart.getDate() + 6);
  return { start: wStart, end: wEnd };
}

function CalendarView({ phases, schedules, profile, setProfile, statuses, notes, setStatus, setNote,
                        welcomed, setWelcomed, expanded, setExpanded,
                        collapsedWeeks, toggleWeek, expandAll, collapseAll,
                        adminMode, onEditTask, onAddTaskToWeek, onOpenSummary, summaryCount }) {

  // Filter state — local, not persisted
  const [filterPhases, setFilterPhases] = useStateCal(new Set());
  const [filterStatuses, setFilterStatuses] = useStateCal(new Set());
  const [filterBys, setFilterBys] = useStateCal(new Set());

  const allBys = useMemoCal(() => {
    const s = new Set();
    for (const phase of phases) for (const t of phaseTasks(phase)) if (t.by) s.add(t.by);
    return Array.from(s).sort();
  }, [phases]);

  const filtersActive = filterPhases.size + filterStatuses.size + filterBys.size > 0;

  function matchesFilters(item) {
    if (filterPhases.size && !filterPhases.has(item.phase.id)) return false;
    if (filterBys.size && !filterBys.has(item.task.by)) return false;
    if (filterStatuses.size) {
      const s = statuses[item.key] || 'not_started';
      if (!filterStatuses.has(s)) return false;
    }
    return true;
  }

  function toggleSet(setter, val) {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val); else next.add(val);
      return next;
    });
  }
  function clearFilters() { setFilterPhases(new Set()); setFilterStatuses(new Set()); setFilterBys(new Set()); }

  const tasksByWeek = useMemoCal(() => {
    const map = {};
    for (let w = 1; w <= TOTAL_WEEKS; w++) map[w] = [];
    for (const phase of phases) {
      for (const task of phaseTasks(phase)) {
        const key = `${phase.id}::${task.name}`;
        const [start, end] = getScheduleFor(schedules, phase.id, task.name);
        for (let w = start; w <= end; w++) {
          if (w < 1 || w > TOTAL_WEEKS) continue;
          map[w].push({
            phase, task, key,
            spanStart: start, spanEnd: end,
            isStart: w === start,
            weekIndex: w - start + 1,
            weekTotal: end - start + 1,
          });
        }
      }
    }
    const phaseOrder = Object.fromEntries(phases.map((p, i) => [p.id, i]));
    for (const w of Object.keys(map)) {
      map[w].sort((a, b) => {
        if (a.isStart !== b.isStart) return a.isStart ? -1 : 1;
        return phaseOrder[a.phase.id] - phaseOrder[b.phase.id];
      });
    }
    return map;
  }, [phases, schedules]);

  const dayN = daysSince(profile.startDate);
  const currentWeek = (dayN && dayN > 0 && dayN <= TOTAL_WEEKS * 7) ? Math.ceil(dayN / 7) : null;

  const totalTasks = phases.reduce((a, p) => a + phaseTasks(p).length, 0);
  const completedTotal = phases.reduce((a, p) => a + phaseCompleted(p, statuses).done, 0);
  const overall = phases.reduce((a, p) => a + phaseProgress(p, statuses), 0) / phases.length;

  const weekProgress = useMemoCal(() => {
    const map = {};
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const items = tasksByWeek[w].filter(it => it.isStart);
      if (!items.length) { map[w] = 0; continue; }
      let sum = 0;
      for (const it of items) {
        const s = STATUS_BY_ID[statuses[it.key]] || STATUS_BY_ID.not_started;
        sum += s.weight;
      }
      map[w] = sum / items.length;
    }
    return map;
  }, [statuses, tasksByWeek]);

  const weekRefs = useRefCal({});
  const scrollToWeek = (w) => {
    if (collapsedWeeks.has(w)) toggleWeek(w);
    setTimeout(() => {
      const el = weekRefs.current[w];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ position: 'relative', background: T.primary, color: '#fff', overflow: 'hidden' }}>
        <RingMotif size={520} color="#ffffff" style={{ top: -180, right: -180 }} />
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 32px 36px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <BrandMark light size={26} />
            <SummaryButton onClick={onOpenSummary} count={summaryCount} />
          </div>
          <div style={{ marginTop: 36, maxWidth: 620 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500,
                          letterSpacing: '0.18em', textTransform: 'uppercase',
                          color: '#8fb5e0', marginBottom: 12 }}>
              Customer Success · Property Estimating Solutions
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 44,
                          lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, color: '#fff' }}>
              Your first 90 days,<br/><em style={{ fontStyle: 'italic', fontWeight: 400 }}>scheduled.</em>
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14.5, lineHeight: 1.55,
                        color: '#c8d9ee', marginTop: 16, maxWidth: 520, fontWeight: 300 }}>
              An interactive companion for new Customer Success Managers. Set your start date,
              and every task slots into the week it belongs to.
            </p>
          </div>
        </div>
        <AccentBar height={3} />
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px' }}>
        {!welcomed && (
          <div style={{
            display: 'flex', gap: 20, background: '#fff',
            border: `1px solid ${T.line}`, borderLeft: `3px solid ${T.accent}`,
            borderRadius: 8, padding: '20px 22px', marginBottom: 28,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 500,
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            color: T.accent, marginBottom: 6 }}>How it works</div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 19,
                           color: T.ink, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                Every task has a week. Click any week to expand it.
              </h3>
              <ol style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: T.inkSoft,
                          lineHeight: 1.6, fontWeight: 300, margin: 0, paddingLeft: 18 }}>
                <li>Set your start date below — this anchors the calendar.</li>
                <li>Click any week's header to expand or collapse it.</li>
                <li>Click a task to set status and add notes — saves automatically.</li>
              </ol>
            </div>
            <button onClick={() => setWelcomed(true)}
                    style={{ background: 'transparent', border: 'none', color: T.inkMute,
                             cursor: 'pointer', fontSize: 18, padding: 4, height: 28, alignSelf: 'start' }}>×</button>
          </div>
        )}

        <ProfileBlock profile={profile} setProfile={setProfile} day={dayN} />

        <div style={{
          background: '#fff', border: `1px solid ${T.line}`, borderRadius: 10,
          padding: '20px 24px', marginTop: 20,
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          <ProgressRing value={overall} size={64} stroke={6} color={T.primary} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 500,
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                          color: T.primary, marginBottom: 4 }}>Overall</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: T.ink }}>
              {completedTotal} of {totalTasks} tasks complete
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {phases.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PHASE_COLORS[p.id] || T.primary }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.inkSoft, fontWeight: 400 }}>
                  {p.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <FilterBar
          phases={phases}
          allBys={allBys}
          filterPhases={filterPhases} togglePhase={(id) => toggleSet(setFilterPhases, id)}
          filterStatuses={filterStatuses} toggleStatus={(id) => toggleSet(setFilterStatuses, id)}
          filterBys={filterBys} toggleBy={(b) => toggleSet(setFilterBys, b)}
          filtersActive={filtersActive} onClear={clearFilters}
        />

        <WeekRibbon
          currentWeek={currentWeek}
          weekProgress={weekProgress}
          tasksByWeek={tasksByWeek}
          collapsedWeeks={collapsedWeeks}
          onJump={scrollToWeek}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
            const w = i + 1;
            return (
              <WeekSection
                key={w}
                ref={el => weekRefs.current[w] = el}
                weekNum={w}
                items={tasksByWeek[w].filter(matchesFilters)}
                allItemsCount={tasksByWeek[w].length}
                filtersActive={filtersActive}
                isCurrent={currentWeek === w}
                isPast={currentWeek != null && w < currentWeek}
                dateRange={weekDateRange(profile.startDate, w)}
                progress={weekProgress[w]}
                statuses={statuses} notes={notes}
                setStatus={setStatus} setNote={setNote}
                expanded={expanded} setExpanded={setExpanded}
                collapsed={collapsedWeeks.has(w)}
                onToggleCollapse={() => toggleWeek(w)}
                adminMode={adminMode}
                onEditTask={onEditTask}
                onAddTaskToWeek={onAddTaskToWeek}
              />
            );
          })}
        </div>

        <div style={{
          marginTop: 32, background: T.paperWarm, border: `1px solid ${T.line}`,
          borderRadius: 10, padding: '18px 22px',
        }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 500,
                        letterSpacing: '0.15em', textTransform: 'uppercase',
                        color: T.primary, marginBottom: 12 }}>Status key</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STATUSES.map(s => <StatusPill key={s.id} statusId={s.id} size="sm" />)}
          </div>
        </div>

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.line}` }}>
          <AccentBar height={2} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: 18, fontFamily: 'Inter, sans-serif', fontSize: 11.5,
                        color: T.inkMute, fontWeight: 300 }}>
            <BrandMark size={18} />
            <span>CSM Onboarding · 13-week calendar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekRibbon({ currentWeek, weekProgress, tasksByWeek, collapsedWeeks, onJump, onExpandAll, onCollapseAll }) {
  return (
    <div style={{
      marginTop: 20, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 500,
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: T.primary }}>Jump to week</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onExpandAll} style={ribbonLinkStyle}>Expand all</button>
          <span style={{ color: T.line }}>|</span>
          <button onClick={onCollapseAll} style={ribbonLinkStyle}>Collapse all</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 6 }}>
        {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
          const w = i + 1;
          const p = weekProgress[w] || 0;
          const isCurrent = currentWeek === w;
          const isCollapsed = collapsedWeeks.has(w);
          const newCount = (tasksByWeek[w] || []).filter(it => it.isStart).length;
          return (
            <button key={w} onClick={() => onJump(w)}
                    style={{
                      background: isCurrent ? T.primary : (isCollapsed ? '#f7f4eb' : '#e8efff'),
                      color: isCurrent ? '#fff' : T.inkSoft,
                      border: 'none', borderRadius: 6, padding: '8px 4px',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      transition: 'transform 0.1s, background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.05em', opacity: 0.75 }}>WK</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, lineHeight: 1 }}>{w}</span>
              <div style={{ width: '100%', height: 2.5, background: isCurrent ? 'rgba(255,255,255,0.25)' : T.lineSoft, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p * 100}%`, background: isCurrent ? '#fff' : T.accent, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: 9.5, opacity: 0.7, fontWeight: 400 }}>{newCount} new</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const ribbonLinkStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500,
  color: T.accent, letterSpacing: '0.04em', padding: 0,
};

const WeekSection = React.forwardRef(function WeekSection(
  { weekNum, items, allItemsCount, filtersActive, isCurrent, isPast, dateRange, progress, statuses, notes, setStatus, setNote,
    expanded, setExpanded, collapsed, onToggleCollapse,
    adminMode, onEditTask, onAddTaskToWeek }, ref
) {
  const startingItems = items.filter(it => it.isStart);
  const continuingItems = items.filter(it => !it.isStart);
  const dateLabel = dateRange ? `${fmtDate(dateRange.start)} – ${fmtDate(dateRange.end)}` : 'Set start date for dates';
  const dayLabel = `Days ${(weekNum - 1) * 7 + 1}–${weekNum * 7}`;

  return (
    <section ref={ref} style={{
      background: '#fff',
      border: `1px solid ${isCurrent ? T.accent : T.line}`,
      borderRadius: 12,
      overflow: 'hidden',
      scrollMarginTop: 16,
      boxShadow: isCurrent ? `0 8px 28px rgba(37, 99, 235, 0.12)` : 'none',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      opacity: isPast && collapsed ? 0.85 : 1,
    }}>
      <div onClick={onToggleCollapse}
           style={{
             background: isCurrent ? T.accent : T.paperWarm,
             color: isCurrent ? '#fff' : T.ink,
             padding: '14px 22px',
             display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', cursor: 'pointer',
             borderBottom: collapsed ? 'none' : `1px solid ${isCurrent ? T.accent : T.line}`,
             userSelect: 'none',
           }}>
        <span style={{
          fontSize: 14, opacity: 0.7, marginRight: -4,
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', display: 'inline-block', width: 14,
        }}>▾</span>
        <div style={{
          fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em',
          lineHeight: 1, color: isCurrent ? '#fff' : T.primary, minWidth: 70,
        }}>
          Wk <span style={{ fontStyle: 'italic' }}>{String(weekNum).padStart(2, '0')}</span>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14.5, fontWeight: 500, letterSpacing: '-0.005em' }}>
            {dateLabel}
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, opacity: 0.75, fontWeight: 300, marginTop: 2 }}>
            {dayLabel} · {startingItems.length} new {startingItems.length === 1 ? 'task' : 'tasks'}
            {continuingItems.length > 0 && ` · ${continuingItems.length} continuing`}
          </div>
        </div>
        {isCurrent && (
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 999,
          }}>● This week</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 70, height: 4, background: isCurrent ? 'rgba(255,255,255,0.25)' : T.lineSoft, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(progress || 0) * 100}%`,
                          background: isCurrent ? '#fff' : T.primary, transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, minWidth: 36, textAlign: 'right' }}>
            {Math.round((progress || 0) * 100)}%
          </div>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '14px 18px 18px', animation: 'fadeUp 0.2s ease' }}>
          {items.length === 0 && !adminMode && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.inkMute,
                          fontWeight: 300, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
              {filtersActive
                ? `No tasks match your filters this week${allItemsCount > 0 ? ` (${allItemsCount} hidden)` : ''}.`
                : 'No scheduled tasks this week.'}
            </div>
          )}

          {startingItems.length > 0 && (
            <>
              <SubLabel>{continuingItems.length > 0 ? 'New this week' : 'Tasks'}</SubLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: continuingItems.length > 0 ? 18 : 0 }}>
                {startingItems.map((it, i) => (
                  <CalendarTaskRow key={it.key} item={it}
                                   status={statuses[it.key] || 'not_started'}
                                   note={notes[it.key] || ''}
                                   onStatusChange={(s) => setStatus(it.key, s)}
                                   onNoteChange={(n) => setNote(it.key, n)}
                                   expanded={expanded === `${weekNum}::${it.key}`}
                                   onToggle={() => setExpanded(expanded === `${weekNum}::${it.key}` ? null : `${weekNum}::${it.key}`)}
                                   adminMode={adminMode} onEdit={() => onEditTask(it)}
                                   index={i} />
                ))}
              </div>
            </>
          )}

          {continuingItems.length > 0 && (
            <>
              <SubLabel>Continuing</SubLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {continuingItems.map((it, i) => (
                  <CalendarTaskRow key={it.key} item={it}
                                   status={statuses[it.key] || 'not_started'}
                                   note={notes[it.key] || ''}
                                   onStatusChange={(s) => setStatus(it.key, s)}
                                   onNoteChange={(n) => setNote(it.key, n)}
                                   expanded={expanded === `${weekNum}::${it.key}`}
                                   onToggle={() => setExpanded(expanded === `${weekNum}::${it.key}` ? null : `${weekNum}::${it.key}`)}
                                   adminMode={adminMode} onEdit={() => onEditTask(it)}
                                   muted index={i} />
                ))}
              </div>
            </>
          )}

          {adminMode && (
            <button onClick={() => onAddTaskToWeek(weekNum)}
                    style={{
                      width: '100%', marginTop: 12, background: 'transparent',
                      color: T.accent, border: `1.5px dashed ${T.accent}80`,
                      borderRadius: 8, padding: '10px', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>+ Add task to week {weekNum}</button>
          )}
        </div>
      )}
    </section>
  );
});

function SubLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: T.inkMute, marginBottom: 8,
    }}>{children}</div>
  );
}

function CalendarTaskRow({ item, status, note, onStatusChange, onNoteChange, expanded, onToggle, muted, index, adminMode, onEdit }) {
  const [hover, setHover] = useStateCal(false);
  const { phase, task, spanStart, spanEnd, weekIndex, weekTotal } = item;
  const color = PHASE_COLORS[phase.id] || T.primary;
  const subtitle = [task.by, task.tool].filter(Boolean).join(' · ');

  const spanLabel = weekTotal === 1 ? null
                  : weekTotal <= 4 ? `Week ${weekIndex} of ${weekTotal}`
                  : `Wks ${spanStart}–${spanEnd}`;

  return (
    <div style={{
      background: expanded ? '#fff' : (hover ? '#fbfaf5' : '#fff'),
      border: `1px solid ${T.line}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
      opacity: muted && !expanded ? 0.78 : 1,
      transition: 'background 0.15s, opacity 0.15s',
      animation: `fadeUp 0.3s ease ${index * 0.02}s both`,
      position: 'relative',
    }}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div onClick={onToggle}
           style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}>
        <StatusDot statusId={status} size={14} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: T.ink,
                          fontWeight: 500, letterSpacing: '-0.005em' }}>
              {task.name}
            </div>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 9.5, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color, background: `${color}14`, padding: '2px 7px', borderRadius: 3,
            }}>
              {phase.title.split(' ')[0]}
            </span>
            {spanLabel && (
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 9.5, fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: T.inkMute, background: T.lineSoft, padding: '2px 7px', borderRadius: 3,
              }}>{spanLabel}</span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: T.inkMute,
                          fontWeight: 300, marginTop: 3 }}>
              {subtitle}
            </div>
          )}
        </div>
        {adminMode && (
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  style={{
                    background: '#fff', color: T.primary, border: `1px solid ${T.line}`,
                    borderRadius: 5, padding: '4px 10px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>Edit</button>
        )}
        <StatusPill statusId={status} size="sm" />
        <span style={{ fontSize: 14, color: T.inkMute, marginLeft: 4,
                       transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
      </div>

      {expanded && (
        <div style={{ padding: '4px 20px 20px', animation: 'fadeUp 0.25s ease' }}>
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13.5, lineHeight: 1.6,
            color: T.inkSoft, fontWeight: 300, marginBottom: 16,
            paddingTop: 10, borderTop: `1px dashed ${T.lineSoft}`, textWrap: 'pretty',
          }}>
            {task.desc}
          </div>

          {(task.assessment || task.practice) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: task.assessment && task.practice ? '1fr 1fr' : '1fr',
              gap: 10, marginBottom: 18,
            }}>
              {task.assessment && (
                <InfoPanelCal label="Assessment" bg="#edf1f7" labelColor={T.primary}>
                  {task.assessment}
                </InfoPanelCal>
              )}
              {task.practice && (
                <InfoPanelCal label="Practice" bg="#e8f0ff" labelColor={T.accent}>
                  {task.practice}
                </InfoPanelCal>
              )}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <SubLabel>Set status</SubLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STATUSES.map(s => {
                const active = status === s.id;
                return (
                  <button key={s.id} onClick={() => onStatusChange(s.id)}
                          style={{
                            fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500,
                            padding: '5px 11px', borderRadius: 4, cursor: 'pointer',
                            background: s.bg, color: s.fg, border: 'none',
                            opacity: active ? 1 : 0.6,
                            boxShadow: active ? `inset 0 0 0 1.5px ${s.fg}` : 'none',
                            transition: 'opacity 0.15s, transform 0.1s',
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                          }}>
                    <span>{s.dot}</span> {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SubLabel>My notes</SubLabel>
            <textarea
              value={note} onChange={e => onNoteChange(e.target.value)}
              placeholder="What did you learn? Who did you meet? Any questions?"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 300,
                color: T.ink, padding: '10px 12px', border: `1.5px solid ${T.line}`,
                borderRadius: 6, resize: 'vertical', outline: 'none', background: '#fff',
                lineHeight: 1.5, transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accent}14`; }}
              onBlur={e => { e.target.style.borderColor = T.line; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoPanelCal({ label, children, bg, labelColor }) {
  return (
    <div style={{ background: bg, borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: labelColor, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, lineHeight: 1.55,
                    color: T.inkSoft, fontWeight: 300, textWrap: 'pretty' }}>
        {children}
      </div>
    </div>
  );
}

function FilterBar({ phases, allBys, filterPhases, togglePhase, filterStatuses, toggleStatus, filterBys, toggleBy, filtersActive, onClear }) {
  const [open, setOpen] = useStateCal(false);
  const count = filterPhases.size + filterStatuses.size + filterBys.size;
  return (
    <div style={{
      marginTop: 20, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 10,
      padding: open ? '14px 16px' : '10px 16px',
      transition: 'padding 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setOpen(o => !o)}
                style={{
                  background: filtersActive ? T.primary : 'transparent',
                  color: filtersActive ? '#fff' : T.primary,
                  border: `1.5px solid ${T.primary}`, borderRadius: 999,
                  padding: '5px 12px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
          <span style={{ fontSize: 11 }}>⌕</span>
          Filter {count > 0 && <span style={{ opacity: 0.85 }}>· {count}</span>}
          <span style={{ fontSize: 9, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
        </button>
        {filtersActive && (
          <button onClick={onClear} style={ribbonLinkStyle}>Clear filters</button>
        )}
        {!open && filtersActive && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.inkMute, fontWeight: 300, marginLeft: 'auto' }}>
            Showing only matching tasks
          </div>
        )}
        {!filtersActive && !open && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.inkMute, fontWeight: 300, marginLeft: 'auto' }}>
            Narrow down by phase, status, or who delivers it
          </div>
        )}
      </div>

      {open && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.2s ease' }}>
          <FilterGroup label="Phase">
            {phases.map(p => (
              <FilterChip key={p.id} active={filterPhases.has(p.id)}
                          color={PHASE_COLORS[p.id] || T.primary}
                          onClick={() => togglePhase(p.id)}>
                {p.title}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Status">
            {STATUSES.map(s => (
              <FilterChip key={s.id} active={filterStatuses.has(s.id)}
                          color={s.fg} bg={s.bg}
                          onClick={() => toggleStatus(s.id)}>
                <span style={{ marginRight: 4 }}>{s.dot}</span>{s.label}
              </FilterChip>
            ))}
          </FilterGroup>

          {allBys.length > 0 && (
            <FilterGroup label="Delivered by">
              {allBys.map(b => (
                <FilterChip key={b} active={filterBys.has(b)}
                            color={T.inkSoft} onClick={() => toggleBy(b)}>
                  {b}
                </FilterChip>
              ))}
            </FilterGroup>
          )}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: T.inkMute, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
    </div>
  );
}

function FilterChip({ active, color, bg, onClick, children }) {
  return (
    <button onClick={onClick}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 500,
              padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
              background: active ? (bg || `${color}18`) : '#fff',
              color: active ? color : T.inkSoft,
              border: `1.5px solid ${active ? color : T.line}`,
              transition: 'all 0.12s',
              display: 'inline-flex', alignItems: 'center',
            }}>
      {children}
    </button>
  );
}

Object.assign(window, { CalendarView });
