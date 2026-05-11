/* Data helpers for editing phases + schedules */

function findTaskLocation(phases, phaseId, taskName) {
  for (const phase of phases) {
    if (phase.id !== phaseId) continue;
    if (phase.sections) {
      for (let si = 0; si < phase.sections.length; si++) {
        const sec = phase.sections[si];
        const ti = sec.tasks.findIndex(t => t.name === taskName);
        if (ti >= 0) return { phase, sectionIndex: si, sectionLabel: sec.label, taskIndex: ti, task: sec.tasks[ti] };
      }
    } else {
      const ti = phase.tasks.findIndex(t => t.name === taskName);
      if (ti >= 0) return { phase, taskIndex: ti, task: phase.tasks[ti] };
    }
  }
  return null;
}

function getScheduleFor(schedules, phaseId, taskName) {
  return schedules[`${phaseId}::${taskName}`] || [1, 1];
}

function updateTask(phases, phaseId, oldName, newTask, newSectionLabel) {
  return phases.map(p => {
    if (p.id !== phaseId) return p;
    if (p.sections) {
      // Possibly moving section
      let removed = null;
      const sectionsAfterRemove = p.sections.map(sec => {
        const idx = sec.tasks.findIndex(t => t.name === oldName);
        if (idx >= 0) { removed = sec.tasks[idx]; return { ...sec, tasks: sec.tasks.filter((_, i) => i !== idx) }; }
        return sec;
      });
      const targetLabel = newSectionLabel || (removed ? p.sections.find(s => s.tasks.some(t => t.name === oldName))?.label : p.sections[0].label);
      return {
        ...p,
        sections: sectionsAfterRemove.map(sec => sec.label === targetLabel ? { ...sec, tasks: [...sec.tasks, newTask] } : sec),
      };
    } else {
      return { ...p, tasks: p.tasks.map(t => t.name === oldName ? newTask : t) };
    }
  });
}

function addTask(phases, phaseId, sectionLabel, newTask) {
  return phases.map(p => {
    if (p.id !== phaseId) return p;
    if (p.sections) {
      return { ...p, sections: p.sections.map(sec => sec.label === sectionLabel ? { ...sec, tasks: [...sec.tasks, newTask] } : sec) };
    }
    return { ...p, tasks: [...p.tasks, newTask] };
  });
}

function deleteTask(phases, phaseId, taskName) {
  return phases.map(p => {
    if (p.id !== phaseId) return p;
    if (p.sections) {
      return { ...p, sections: p.sections.map(sec => ({ ...sec, tasks: sec.tasks.filter(t => t.name !== taskName) })) };
    }
    return { ...p, tasks: p.tasks.filter(t => t.name !== taskName) };
  });
}

function migrateScheduleKey(schedules, phaseId, oldName, newName, newSpan) {
  const out = { ...schedules };
  delete out[`${phaseId}::${oldName}`];
  out[`${phaseId}::${newName}`] = newSpan;
  return out;
}

function removeScheduleKey(schedules, phaseId, taskName) {
  const out = { ...schedules };
  delete out[`${phaseId}::${taskName}`];
  return out;
}

Object.assign(window, { findTaskLocation, getScheduleFor, updateTask, addTask, deleteTask, migrateScheduleKey, removeScheduleKey });
