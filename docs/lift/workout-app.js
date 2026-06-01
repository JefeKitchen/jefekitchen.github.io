const config = window.liftWorkoutConfig;
  const workout = config.workout;
  const testRestSeconds = config.testRestSeconds || null;
  const stateKey = config.stateKey;
  const historyKey = config.historyKey;
  const timerTime = document.getElementById('timerTime');
  const currentLabel = document.getElementById('currentLabel');
  const currentTitle = document.getElementById('currentTitle');
  const currentDose = document.getElementById('currentDose');
  const exerciseList = document.getElementById('exerciseList');
  const completeWorkout = document.getElementById('completeWorkout');
  const exportWorkoutData = document.getElementById('exportWorkoutData');
  const saveNote = document.getElementById('saveNote');
  const focusScreen = document.getElementById('focusScreen');
  const focusProgress = document.getElementById('focusProgress');
  const focusGroup = document.getElementById('focusGroup');
  const focusTitle = document.getElementById('focusTitle');
  const focusSet = document.getElementById('focusSet');
  const focusTimerTime = document.getElementById('focusTimerTime');
  const focusLogSet = document.getElementById('focusLogSet');
  const focusInputs = document.getElementById('focusInputs');
  const actualReps = document.getElementById('actualReps');
  const actualWeight = document.getElementById('actualWeight');
  const weightField = document.getElementById('weightField');
  let state = loadState();
  let timerSeconds = restSeconds(workout[0]);
  let timerId = null;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(stateKey) || '{}');
      return {
        completed: saved.completed || {},
        logs: saved.logs || {},
        currentExercise: saved.currentExercise || 0,
        currentSet: saved.currentSet || 0
      };
    } catch {
      return { completed: {}, logs: {}, currentExercise: 0, currentSet: 0 };
    }
  }

  function saveState() {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(historyKey) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveHistory(history) {
    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  function keyFor(exerciseIndex, setIndex) {
    return `${exerciseIndex}-${setIndex}`;
  }

  function formatTime(total) {
    const minutes = String(Math.floor(total / 60)).padStart(2, '0');
    const seconds = String(total % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function restSeconds(exercise) {
    return testRestSeconds || exercise.rest;
  }

  function setTimer(seconds) {
    timerSeconds = seconds;
    timerTime.textContent = formatTime(timerSeconds);
    focusTimerTime.textContent = formatTime(Math.max(timerSeconds, 0));
  }

  function currentRestSeconds() {
    return restSeconds(workout[state.currentExercise] || workout[0]);
  }

  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
  }

  function startTimer(seconds) {
    stopTimer();
    setTimer(seconds);
    timerId = setInterval(() => {
      timerSeconds -= 1;
      timerTime.textContent = formatTime(Math.max(timerSeconds, 0));
      focusTimerTime.textContent = formatTime(Math.max(timerSeconds, 0));
      if (timerSeconds <= 0) {
        stopTimer();
        timerTime.textContent = '00:00';
        focusTimerTime.textContent = '00:00';
      }
    }, 1000);
  }

  function findNextOpen() {
    for (let exerciseIndex = 0; exerciseIndex < workout.length; exerciseIndex += 1) {
      for (let setIndex = 0; setIndex < workout[exerciseIndex].sets; setIndex += 1) {
        if (!state.completed[keyFor(exerciseIndex, setIndex)]) {
          return { exerciseIndex, setIndex };
        }
      }
    }
    return null;
  }

  function completedSetCount() {
    return Object.values(state.completed).filter(Boolean).length;
  }

  function totalSetCount() {
    return workout.reduce((sum, exercise) => sum + exercise.sets, 0);
  }

  function completedEntries() {
    return workout.flatMap((exercise, exerciseIndex) => {
      return Array.from({ length: exercise.sets }, (_, setIndex) => {
        const key = keyFor(exerciseIndex, setIndex);
        if (!state.completed[key]) return null;
        const log = state.logs[key] || {};
        return {
          group: exercise.group,
          name: exercise.name,
          set: setIndex + 1,
          target: exercise.reps,
          reps: log.reps || '',
          weight: log.weight || ''
        };
      }).filter(Boolean);
    });
  }

  function logText(exercise, key) {
    const entry = state.logs[key];
    if (!entry) return '';
    if (exercise.track === 'none') return '';
    const repsText = entry.reps ? `${entry.reps} reps` : '';
    const weightText = exercise.track === 'weight' && entry.weight ? ` @ ${entry.weight} lb` : '';
    return `${repsText}${weightText}`.trim();
  }

  function syncFocusInputs(current, activeExercise, activeSet) {
    const key = keyFor(activeExercise, activeSet);
    const entry = state.logs[key] || {};
    const needsInput = current && current.track !== 'none';
    const needsWeight = current && current.track === 'weight';
    focusInputs.classList.toggle('is-hidden', !needsInput);
    focusInputs.classList.toggle('reps-only', !needsWeight);
    weightField.classList.toggle('is-hidden', !needsWeight);
    actualReps.value = entry.reps || '';
    actualWeight.value = entry.weight || '';
    actualWeight.disabled = !needsWeight;
  }

  function saveWorkoutSession() {
    const entries = completedEntries();
    const history = loadHistory();
    const session = {
      id: `${Date.now()}`,
      title: config.title,
      date: new Date().toISOString(),
      completed: entries.length,
      total: totalSetCount(),
      entries
    };
    history.unshift(session);
    saveHistory(history.slice(0, 20));
    saveNote.textContent = `Saved ${session.completed}/${session.total} sets`;
  }

  function exportHistory() {
    const history = loadHistory();
    if (!history.length) {
      saveNote.textContent = 'No saved workouts yet';
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      source: config.source || 'Lift Log',
      workouts: history
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${config.exportPrefix || 'lift-workouts'}-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    saveNote.textContent = `Exported ${history.length} workout${history.length === 1 ? '' : 's'}`;
  }

  function setCurrent(exerciseIndex, setIndex) {
    state.currentExercise = exerciseIndex;
    state.currentSet = setIndex;
    saveState();
    if (!timerId) setTimer(restSeconds(workout[exerciseIndex]));
    render();
  }

  function completeSet(exerciseIndex, setIndex) {
    const key = keyFor(exerciseIndex, setIndex);
    state.completed[key] = !state.completed[key];
    if (state.completed[key]) {
      const next = findNextOpen();
      if (next) {
        state.currentExercise = next.exerciseIndex;
        state.currentSet = next.setIndex;
      }
      startTimer(restSeconds(workout[exerciseIndex]));
    }
    saveState();
    render();
  }

  function render() {
    const open = findNextOpen();
    const activeExercise = open ? state.currentExercise : null;
    const activeSet = open ? state.currentSet : null;
    const current = activeExercise === null ? null : workout[activeExercise];

    if (!current) {
      currentLabel.textContent = 'Complete';
      currentTitle.textContent = 'Workout Complete';
      currentTitle.classList.add('finished');
      currentDose.textContent = 'Nicely done';
      focusGroup.textContent = 'Complete';
      focusTitle.textContent = 'Workout Complete';
      focusTitle.classList.add('finished');
      focusSet.textContent = 'Nicely done';
      focusLogSet.disabled = true;
      focusLogSet.textContent = 'Complete';
      actualReps.value = '';
      actualWeight.value = '';
    } else {
      currentTitle.classList.remove('finished');
      focusTitle.classList.remove('finished');
      currentLabel.textContent = current.group;
      currentTitle.textContent = current.name;
      currentDose.textContent = `Set ${activeSet + 1} of ${current.sets} · ${current.reps} reps`;
      focusGroup.textContent = current.group;
      focusTitle.textContent = current.name;
      focusSet.textContent = `Set ${activeSet + 1} of ${current.sets} · ${current.reps} reps`;
      focusLogSet.disabled = false;
      focusLogSet.textContent = 'Log Set';
      syncFocusInputs(current, activeExercise, activeSet);
    }

    focusProgress.textContent = `${completedSetCount()} / ${totalSetCount()} sets`;

    exerciseList.innerHTML = workout.map((exercise, exerciseIndex) => {
      const isActive = exerciseIndex === activeExercise;
      const rows = Array.from({ length: exercise.sets }, (_, setIndex) => {
        const done = !!state.completed[keyFor(exerciseIndex, setIndex)];
        const log = logText(exercise, keyFor(exerciseIndex, setIndex));
        const active = isActive && setIndex === activeSet;
        return `
          <div class="set-row ${done ? 'is-done' : ''}" data-exercise="${exerciseIndex}" data-set="${setIndex}" role="button" tabindex="${done ? '-1' : '0'}" aria-label="${done ? `Completed ${exercise.name} set ${setIndex + 1}` : `Start ${exercise.name} set ${setIndex + 1}`}">
            <div class="set-copy">
              Set ${setIndex + 1}${active ? ' · Current' : ''}
              <span>${log || `${exercise.reps} reps · ${restSeconds(exercise)}s rest`}</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <section class="exercise ${isActive ? 'is-active' : ''}">
          <div class="exercise-head">
            <div>
              <div class="exercise-kicker">${exercise.group}</div>
              <div class="exercise-name">${exercise.name}</div>
            </div>
            <div class="exercise-dose">${exercise.sets} x ${exercise.reps}</div>
          </div>
          ${rows}
        </section>
      `;
    }).join('');

    document.querySelectorAll('.set-row').forEach(row => {
      const openSet = !row.classList.contains('is-done');
      if (!openSet) return;
      const openFocus = () => {
        setCurrent(Number(row.dataset.exercise), Number(row.dataset.set));
        enterFocusMode();
      };
      row.addEventListener('click', openFocus);
      row.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openFocus();
        }
      });
    });
  }

  function enterFocusMode() {
    document.body.classList.add('focus-active');
    focusScreen.setAttribute('aria-hidden', 'false');
    render();
  }

  function exitFocusMode() {
    document.body.classList.remove('focus-active');
    focusScreen.setAttribute('aria-hidden', 'true');
  }

  document.getElementById('exitFocus').addEventListener('click', () => {
    exitFocusMode();
  });

  focusLogSet.addEventListener('click', () => {
    const exerciseIndex = state.currentExercise;
    const setIndex = state.currentSet;
    const exercise = workout[exerciseIndex];
    if (!exercise || state.completed[keyFor(exerciseIndex, setIndex)]) return;
    if (exercise.track !== 'none') {
      state.logs[keyFor(exerciseIndex, setIndex)] = {
        reps: actualReps.value.trim(),
        weight: exercise.track === 'weight' ? actualWeight.value.trim() : ''
      };
    }
    completeSet(exerciseIndex, setIndex);
    enterFocusMode();
  });

  completeWorkout.addEventListener('click', () => {
    saveWorkoutSession();
  });

  exportWorkoutData.addEventListener('click', () => {
    exportHistory();
  });

  setTimer(restSeconds(workout[0]));
  render();
