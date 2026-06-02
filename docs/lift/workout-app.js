const config = window.liftWorkoutConfig;
  const baseWorkout = config.workout;
  const testRestSeconds = config.testRestSeconds || null;
  const stateKey = config.stateKey;
  const historyKey = config.historyKey;
  const defaultBackups = {
    'Band pull-aparts': { name: 'Prone Y-T raises', group: 'Warm Up', equipment: 'floor' },
    'Push-ups': { name: 'Light cable chest press', group: 'Warm Up', equipment: 'cable stack' },
    'Dumbbell bench press': { name: 'Machine chest press', group: 'Push', equipment: 'chest press machine' },
    'Seated cable row': { name: 'Chest-supported dumbbell row', group: 'Pull', equipment: 'dumbbells + incline bench' },
    'Dumbbell shoulder press': { name: 'Machine shoulder press', group: 'Shoulders', equipment: 'shoulder press machine' },
    'Lat pulldown': { name: 'Inverted row', group: 'Back', equipment: 'smith bar or rack' },
    'Machine chest press': { name: 'Push-ups', group: 'Chest', equipment: 'bodyweight' },
    'Face pulls': { name: 'Bent-over rear delt raise', group: 'Rear Delts', equipment: 'dumbbells' },
    'Incline dumbbell curl': { name: 'Cable curl', group: 'Biceps', equipment: 'cable stack' },
    'Rope pressdown': { name: 'Close-grip push-ups', group: 'Triceps', equipment: 'bodyweight' },
    'Barbell bench press': { name: 'Dumbbell floor press', group: 'Chest', equipment: 'dumbbells + floor' },
    'Incline dumbbell press': { name: 'Machine incline press', group: 'Chest', equipment: 'incline press machine' },
    'Cable fly': { name: 'Dumbbell fly', group: 'Chest', equipment: 'dumbbells + bench' },
    'Overhead cable extension': { name: 'Dumbbell overhead extension', group: 'Triceps', equipment: 'dumbbell' },
    'Cable crunch': { name: 'Weighted sit-up', group: 'Core', equipment: 'plate or dumbbell' },
    'Hanging knee raise': { name: 'Captain chair knee raise', group: 'Core', equipment: 'captain chair' },
    'Stair stepper': { name: 'Stationary bike', group: 'Cardio', equipment: 'bike' }
  };
  const finisherPool = [
    { group: 'Core', name: 'Cable crunch', sets: 2, reps: '12-15', rest: 45, track: 'weight' },
    { group: 'Core', name: 'Hanging knee raise', sets: 2, reps: '8-12', rest: 45, track: 'none' },
    { group: 'Core', name: 'Plank circuit', sets: 2, reps: '30-45 sec', rest: 45, track: 'none' },
    { group: 'Core', name: 'Weighted sit-up', sets: 2, reps: '10-12', rest: 45, track: 'weight' },
    { group: 'Core', name: 'Ab wheel rollout', sets: 2, reps: '8-10', rest: 45, track: 'none' },
    { group: 'Core', name: 'Decline sit-up', sets: 2, reps: '10-12', rest: 45, track: 'none' },
    { group: 'Core', name: 'Leg raise', sets: 2, reps: '10-12', rest: 45, track: 'none' },
    { group: 'Cardio', name: 'Stair stepper', sets: 1, reps: '10 min', rest: 0, track: 'none', duration: 600 },
    { group: 'Cardio', name: 'Stationary bike', sets: 1, reps: '10 min', rest: 0, track: 'none', duration: 600 },
    { group: 'Cardio', name: 'Incline treadmill walk', sets: 1, reps: '10 min', rest: 0, track: 'none', duration: 600 }
  ];
  const timerTime = document.getElementById('timerTime');
  const workoutElapsed = document.getElementById('workoutElapsed');
  const currentLabel = document.getElementById('currentLabel');
  const currentTitle = document.getElementById('currentTitle');
  const currentDose = document.getElementById('currentDose');
  const exerciseList = document.getElementById('exerciseList');
  const completeWorkout = document.getElementById('completeWorkout');
  const exportWorkoutData = document.getElementById('exportWorkoutData');
  const completeEditor = document.getElementById('completeEditor');
  const durationHours = document.getElementById('durationHours');
  const durationMinutes = document.getElementById('durationMinutes');
  const saveCompleteWorkout = document.getElementById('saveCompleteWorkout');
  const cancelCompleteEdit = document.getElementById('cancelCompleteEdit');
  const saveNote = document.getElementById('saveNote');
  const focusScreen = document.getElementById('focusScreen');
  const focusProgress = document.getElementById('focusProgress');
  const focusElapsed = document.getElementById('focusElapsed');
  const focusGroup = document.getElementById('focusGroup');
  const focusTitle = document.getElementById('focusTitle');
  const focusSet = document.getElementById('focusSet');
  const focusBackup = document.getElementById('focusBackup');
  const focusSkip = document.getElementById('focusSkip');
  const focusAddSet = document.getElementById('focusAddSet');
  const focusSwitchEnder = document.getElementById('focusSwitchEnder');
  const focusTimerTime = document.getElementById('focusTimerTime');
  const focusNext = document.getElementById('focusNext');
  const focusLogSet = document.getElementById('focusLogSet');
  const focusInputs = document.getElementById('focusInputs');
  const actualReps = document.getElementById('actualReps');
  const actualWeight = document.getElementById('actualWeight');
  const weightField = document.getElementById('weightField');
  let state = loadState();
  const workout = hydrateWorkout(baseWorkout);
  let timerSeconds = restSeconds(workout[0]);
  let timerId = null;
  let timerDone = null;
  let workoutClockId = null;
  pruneState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(stateKey) || '{}');
      return {
        completed: saved.completed || {},
        logs: saved.logs || {},
        swaps: saved.swaps || {},
        skipped: saved.skipped || {},
        extraSets: saved.extraSets || {},
        dynamicEnder: saved.dynamicEnder || null,
        startedAt: saved.startedAt || null,
        completedAt: saved.completedAt || null,
        adjustedDurationSeconds: Number.isFinite(saved.adjustedDurationSeconds) ? saved.adjustedDurationSeconds : null,
        currentExercise: saved.currentExercise === null ? null : (Number.isInteger(saved.currentExercise) ? saved.currentExercise : 0),
        currentSet: saved.currentSet === null ? null : (Number.isInteger(saved.currentSet) ? saved.currentSet : 0)
      };
    } catch {
      return { completed: {}, logs: {}, swaps: {}, skipped: {}, extraSets: {}, dynamicEnder: null, startedAt: null, completedAt: null, adjustedDurationSeconds: null, currentExercise: 0, currentSet: 0 };
    }
  }

  function saveState() {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  function pruneState() {
    let changed = false;
    const keyValid = key => {
      const [exerciseIndex, setIndex] = key.split('-').map(Number);
      return Number.isInteger(exerciseIndex)
        && Number.isInteger(setIndex)
        && exerciseIndex >= 0
        && exerciseIndex < workout.length
        && setIndex >= 0
        && setIndex < exerciseSetCount(exerciseIndex);
    };
    ['completed', 'logs'].forEach(bucket => {
      Object.keys(state[bucket]).forEach(key => {
        if (!keyValid(key)) {
          delete state[bucket][key];
          changed = true;
        }
      });
    });
    ['swaps', 'skipped', 'extraSets'].forEach(bucket => {
      Object.keys(state[bucket]).forEach(key => {
        const exerciseIndex = Number(key);
        if (!Number.isInteger(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= workout.length) {
          delete state[bucket][key];
          changed = true;
        }
      });
    });
    if (state.currentExercise !== null && (!Number.isInteger(state.currentExercise) || state.currentExercise < 0 || state.currentExercise >= workout.length)) {
      const next = findNextOpen();
      state.currentExercise = next ? next.exerciseIndex : null;
      state.currentSet = next ? next.setIndex : null;
      changed = true;
    }
    if (changed) saveState();
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

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function isDynamicFinisher(exercise, index, sourceWorkout) {
    return index === sourceWorkout.length - 1 && exercise.dynamicFinisher === true;
  }

  function isEnderIndex(exerciseIndex) {
    return exerciseIndex === workout.length - 1 && !!workout[exerciseIndex]?.dynamicFinisher;
  }

  function finisherOptions(group) {
    return finisherPool.filter(option => option.group === group);
  }

  function hydrateWorkout(sourceWorkout) {
    let changed = false;
    const hydrated = sourceWorkout.map((exercise, index) => {
      if (!isDynamicFinisher(exercise, index, sourceWorkout)) return exercise;
      const savedEnder = state.dynamicEnder && finisherPool.find(option => option.name === state.dynamicEnder.name);
      if (!savedEnder) {
        state.dynamicEnder = randomFrom(finisherPool);
        changed = true;
      } else if (JSON.stringify(savedEnder) !== JSON.stringify(state.dynamicEnder)) {
        state.dynamicEnder = savedEnder;
        changed = true;
      }
      return { ...exercise, ...state.dynamicEnder };
    });
    if (changed) saveState();
    return hydrated;
  }

  function keyFor(exerciseIndex, setIndex) {
    return `${exerciseIndex}-${setIndex}`;
  }

  function formatTime(total) {
    const minutes = String(Math.floor(total / 60)).padStart(2, '0');
    const seconds = String(total % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function backupFor(exercise) {
    return exercise.backup || defaultBackups[exercise.name] || null;
  }

  function exerciseSetCount(exerciseIndex) {
    const exercise = workout[exerciseIndex];
    if (!exercise) return 0;
    return exercise.sets + (Number(state.extraSets[exerciseIndex]) || 0);
  }

  function effectiveExercise(exercise, exerciseIndex) {
    const backup = backupFor(exercise);
    if (!backup || !state.swaps[exerciseIndex]) {
      return { ...exercise, sets: exerciseSetCount(exerciseIndex) };
    }
    return {
      ...exercise,
      ...backup,
      sets: exerciseSetCount(exerciseIndex),
      backupOf: exercise.name
    };
  }

  function formatElapsed(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function elapsedSeconds() {
    if (!state.startedAt) return 0;
    if (state.completedAt && Number.isFinite(state.adjustedDurationSeconds)) {
      return state.adjustedDurationSeconds;
    }
    const end = state.completedAt ? new Date(state.completedAt).getTime() : Date.now();
    return Math.max(0, Math.floor((end - new Date(state.startedAt).getTime()) / 1000));
  }

  function updateWorkoutClock() {
    const elapsed = formatElapsed(elapsedSeconds());
    workoutElapsed.textContent = elapsed;
    focusElapsed.textContent = elapsed;
  }

  function startWorkoutClock() {
    if (!state.startedAt) {
      state.startedAt = new Date().toISOString();
      state.completedAt = null;
      saveState();
    }
    if (!workoutClockId && !state.completedAt) {
      workoutClockId = setInterval(updateWorkoutClock, 1000);
    }
    updateWorkoutClock();
  }

  function stopWorkoutClock() {
    if (workoutClockId) {
      clearInterval(workoutClockId);
      workoutClockId = null;
    }
    updateWorkoutClock();
  }

  function elapsedMinutesForEditor() {
    return Math.max(1, Math.round(elapsedSeconds() / 60));
  }

  function setDurationEditor(totalMinutes) {
    const safeMinutes = Math.max(1, Number(totalMinutes) || 1);
    durationHours.value = `${Math.floor(safeMinutes / 60)}`;
    durationMinutes.value = `${safeMinutes % 60}`;
  }

  function durationEditorMinutes() {
    const hours = Math.max(0, Number(durationHours.value || 0));
    const minutes = Math.min(59, Math.max(0, Number(durationMinutes.value || 0)));
    return Math.max(1, Math.round((hours * 60) + minutes));
  }

  function restSeconds(exercise) {
    return testRestSeconds || exercise.rest;
  }

  function targetText(exercise) {
    return exercise.duration ? exercise.reps : `${exercise.reps} reps`;
  }

  function displayTimerSeconds(exercise) {
    return exercise.duration || restSeconds(exercise);
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
    timerDone = null;
  }

  function startTimer(seconds, onDone) {
    stopTimer();
    setTimer(seconds);
    timerDone = onDone || null;
    timerId = setInterval(() => {
      timerSeconds -= 1;
      timerTime.textContent = formatTime(Math.max(timerSeconds, 0));
      focusTimerTime.textContent = formatTime(Math.max(timerSeconds, 0));
      if (timerSeconds <= 0) {
        const done = timerDone;
        stopTimer();
        timerTime.textContent = '00:00';
        focusTimerTime.textContent = '00:00';
        if (done) done();
      }
    }, 1000);
  }

  function completeSetWithoutRest(exerciseIndex, setIndex) {
    const key = keyFor(exerciseIndex, setIndex);
    delete state.skipped[exerciseIndex];
    state.completed[key] = true;
    state.currentExercise = exerciseIndex;
    state.currentSet = setIndex;
    saveState();
    advanceToNextOpen();
  }

  function startTimedSet(exerciseIndex, setIndex, exercise) {
    startTimer(exercise.duration, () => {
      completeSetWithoutRest(exerciseIndex, setIndex);
      enterFocusMode();
    });
    focusLogSet.disabled = true;
    focusLogSet.textContent = 'Timer Running';
  }

  function skipRest() {
    if (!timerId) return;
    stopTimer();
    timerTime.textContent = '00:00';
    focusTimerTime.textContent = '00:00';
    advanceToNextOpen();
    enterFocusMode();
  }

  function findNextOpen() {
    for (let exerciseIndex = 0; exerciseIndex < workout.length; exerciseIndex += 1) {
      for (let setIndex = 0; setIndex < exerciseSetCount(exerciseIndex); setIndex += 1) {
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

  function completedExerciseSetCount(exerciseIndex) {
    const exercise = workout[exerciseIndex];
    if (!exercise) return 0;
    return Array.from({ length: exerciseSetCount(exerciseIndex) }, (_, setIndex) => {
      return !!state.completed[keyFor(exerciseIndex, setIndex)];
    }).filter(Boolean).length;
  }

  function exerciseStarted(exerciseIndex) {
    return completedExerciseSetCount(exerciseIndex) > 0 && !state.skipped[exerciseIndex];
  }

  function totalSetCount() {
    return workout.reduce((sum, exercise, exerciseIndex) => sum + exerciseSetCount(exerciseIndex), 0);
  }

  function completedEntries() {
    return workout.flatMap((baseExercise, exerciseIndex) => {
      const exercise = effectiveExercise(baseExercise, exerciseIndex);
      return Array.from({ length: exerciseSetCount(exerciseIndex) }, (_, setIndex) => {
        const key = keyFor(exerciseIndex, setIndex);
        if (!state.completed[key]) return null;
        const log = state.logs[key] || {};
        return {
          group: exercise.group,
          name: exercise.name,
          set: setIndex + 1,
          target: exercise.reps,
          reps: log.reps || '',
          weight: log.weight || '',
          backupOf: exercise.backupOf || '',
          skipped: !!state.skipped[exerciseIndex]
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

  function openCompleteEditor() {
    if (!state.startedAt) {
      state.startedAt = new Date().toISOString();
      saveState();
      updateWorkoutClock();
    }
    setDurationEditor(elapsedMinutesForEditor());
    completeEditor.classList.remove('is-hidden');
    saveNote.textContent = 'Adjust if needed, then save';
    durationHours.focus();
    durationHours.select();
  }

  function closeCompleteEditor() {
    completeEditor.classList.add('is-hidden');
  }

  function saveWorkoutSession(durationOverrideSeconds = null) {
    if (!state.completedAt) {
      state.completedAt = new Date().toISOString();
      saveState();
    }
    const entries = completedEntries();
    const history = loadHistory();
    const durationSeconds = durationOverrideSeconds || elapsedSeconds();
    state.adjustedDurationSeconds = durationOverrideSeconds ? durationSeconds : null;
    saveState();
    stopWorkoutClock();
    const session = {
      id: `${Date.now()}`,
      title: config.title,
      date: new Date().toISOString(),
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      durationSeconds,
      durationAdjusted: !!durationOverrideSeconds,
      completed: entries.length,
      total: totalSetCount(),
      entries
    };
    history.unshift(session);
    saveHistory(history.slice(0, 20));
    closeCompleteEditor();
    saveNote.textContent = `Saved ${session.completed}/${session.total} sets · ${formatElapsed(durationSeconds)}`;
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
    startWorkoutClock();
    state.currentExercise = exerciseIndex;
    state.currentSet = setIndex;
    saveState();
    if (!timerId) setTimer(displayTimerSeconds(workout[exerciseIndex]));
    render();
  }

  function advanceToNextOpen() {
    const next = findNextOpen();
    if (next) {
      state.currentExercise = next.exerciseIndex;
      state.currentSet = next.setIndex;
    } else {
      state.currentExercise = null;
      state.currentSet = null;
    }
    saveState();
    render();
  }

  function completeSet(exerciseIndex, setIndex) {
    const key = keyFor(exerciseIndex, setIndex);
    delete state.skipped[exerciseIndex];
    state.completed[key] = true;
    state.currentExercise = exerciseIndex;
    state.currentSet = setIndex;
    startTimer(restSeconds(workout[exerciseIndex]), advanceToNextOpen);
    saveState();
    render();
  }

  function undoSet(exerciseIndex, setIndex) {
    stopTimer();
    delete state.skipped[exerciseIndex];
    delete state.completed[keyFor(exerciseIndex, setIndex)];
    state.currentExercise = exerciseIndex;
    state.currentSet = setIndex;
    saveState();
    setTimer(displayTimerSeconds(workout[exerciseIndex]));
    render();
  }

  function toggleBackup(exerciseIndex) {
    const exercise = workout[exerciseIndex];
    if (!backupFor(exercise)) return;
    state.swaps[exerciseIndex] = !state.swaps[exerciseIndex];
    saveState();
    render();
  }

  function skipExercise(exerciseIndex) {
    const exercise = workout[exerciseIndex];
    if (!exercise || exerciseStarted(exerciseIndex) || state.skipped[exerciseIndex]) return;
    stopTimer();
    state.skipped[exerciseIndex] = true;
    Array.from({ length: exerciseSetCount(exerciseIndex) }, (_, setIndex) => {
      const key = keyFor(exerciseIndex, setIndex);
      state.completed[key] = true;
      delete state.logs[key];
    });
    advanceToNextOpen();
  }

  function unskipExercise(exerciseIndex) {
    const exercise = workout[exerciseIndex];
    if (!exercise || !state.skipped[exerciseIndex]) return;
    stopTimer();
    delete state.skipped[exerciseIndex];
    Array.from({ length: exerciseSetCount(exerciseIndex) }, (_, setIndex) => {
      delete state.completed[keyFor(exerciseIndex, setIndex)];
    });
    state.currentExercise = exerciseIndex;
    state.currentSet = 0;
    saveState();
    setTimer(displayTimerSeconds(workout[exerciseIndex]));
    render();
  }

  function addSet(exerciseIndex) {
    const nextSet = exerciseSetCount(exerciseIndex);
    state.extraSets[exerciseIndex] = (Number(state.extraSets[exerciseIndex]) || 0) + 1;
    delete state.skipped[exerciseIndex];
    state.currentExercise = exerciseIndex;
    state.currentSet = nextSet;
    stopTimer();
    saveState();
    setTimer(restSeconds(workout[exerciseIndex]));
    render();
  }

  function switchEnder(exerciseIndex) {
    if (!isEnderIndex(exerciseIndex) || exerciseStarted(exerciseIndex)) return;
    const current = workout[exerciseIndex];
    const nextGroup = current.group === 'Cardio' ? 'Core' : 'Cardio';
    const nextEnder = randomFrom(finisherOptions(nextGroup));
    const oldSetCount = exerciseSetCount(exerciseIndex);
    state.dynamicEnder = nextEnder;
    workout[exerciseIndex] = { ...baseWorkout[exerciseIndex], ...nextEnder };
    delete state.skipped[exerciseIndex];
    delete state.extraSets[exerciseIndex];
    const cleanupSetCount = Math.max(oldSetCount, exerciseSetCount(exerciseIndex));
    Array.from({ length: cleanupSetCount }, (_, setIndex) => {
      const key = keyFor(exerciseIndex, setIndex);
      delete state.completed[key];
      delete state.logs[key];
    });
    state.currentExercise = exerciseIndex;
    state.currentSet = 0;
    stopTimer();
    saveState();
    setTimer(displayTimerSeconds(workout[exerciseIndex]));
    render();
  }

  function render() {
    const open = findNextOpen();
    const currentExists = !!workout[state.currentExercise];
    const activeExercise = open || currentExists ? state.currentExercise : null;
    const activeSet = open || currentExists ? state.currentSet : null;
    const current = activeExercise === null ? null : effectiveExercise(workout[activeExercise], activeExercise);
    const currentComplete = activeExercise !== null && !!state.completed[keyFor(activeExercise, activeSet)];
    const currentSkipped = activeExercise !== null && !!state.skipped[activeExercise];

    if (!current) {
      currentLabel.textContent = 'Complete';
      currentTitle.textContent = 'Workout Complete';
      currentTitle.classList.add('finished');
      currentDose.textContent = 'Nicely done';
      focusGroup.textContent = 'Complete';
      focusTitle.textContent = 'Workout Complete';
      focusTitle.classList.add('finished');
      focusSet.textContent = 'Nicely done';
      focusLogSet.disabled = false;
      focusLogSet.textContent = 'Complete Workout';
      focusNext.classList.add('is-hidden');
      focusBackup.classList.add('is-hidden');
      focusSkip.classList.add('is-hidden');
      focusAddSet.classList.add('is-hidden');
      focusSwitchEnder.classList.add('is-hidden');
      actualReps.value = '';
      actualWeight.value = '';
    } else {
      currentTitle.classList.remove('finished');
      focusTitle.classList.remove('finished');
      currentLabel.textContent = current.group;
      currentTitle.textContent = current.name;
      currentDose.textContent = `Set ${activeSet + 1} of ${current.sets} · ${targetText(current)}`;
      focusGroup.textContent = current.group;
      focusTitle.textContent = current.name;
      focusSet.textContent = `Set ${activeSet + 1} of ${current.sets} · ${targetText(current)}`;
      focusLogSet.disabled = !!timerId && !!current.duration && !currentComplete;
      focusLogSet.textContent = currentSkipped ? 'Unskip Exercise' : (currentComplete ? 'Undo Set' : (current.duration ? 'Start Timer' : 'Log Set'));
      focusNext.classList.toggle('is-hidden', !timerId || !currentComplete || currentSkipped);
      const planned = workout[activeExercise];
      const backup = backupFor(planned);
      const started = exerciseStarted(activeExercise);
      const lastSet = activeSet === current.sets - 1;
      const ender = isEnderIndex(activeExercise);
      focusBackup.classList.toggle('is-hidden', !backup || currentComplete || started || currentSkipped);
      focusSkip.classList.toggle('is-hidden', currentComplete || started || currentSkipped);
      focusAddSet.classList.toggle('is-hidden', !lastSet || !currentComplete || currentSkipped || !!current.duration);
      focusSwitchEnder.classList.toggle('is-hidden', !ender || currentComplete || started || currentSkipped);
      if (ender && !currentComplete && !started && !currentSkipped) {
        focusSwitchEnder.textContent = current.group === 'Cardio' ? 'Switch to Abs' : 'Switch to Cardio';
      }
      if (backup && !currentComplete && !started && !currentSkipped) {
        focusBackup.textContent = state.swaps[activeExercise]
          ? `Use planned: ${planned.name}`
          : `Backup: ${backup.name}`;
      }
      syncFocusInputs(current, activeExercise, activeSet);
    }

    focusProgress.textContent = `${completedSetCount()} / ${totalSetCount()} sets`;
    updateWorkoutClock();

    exerciseList.innerHTML = workout.map((baseExercise, exerciseIndex) => {
      const exercise = effectiveExercise(baseExercise, exerciseIndex);
      const isActive = exerciseIndex === activeExercise;
      const addedSets = Number(state.extraSets[exerciseIndex]) || 0;
      const rows = Array.from({ length: exercise.sets }, (_, setIndex) => {
        const done = !!state.completed[keyFor(exerciseIndex, setIndex)];
        const log = logText(exercise, keyFor(exerciseIndex, setIndex));
        const active = isActive && setIndex === activeSet;
        const skipped = !!state.skipped[exerciseIndex];
        return `
          <div class="set-row ${done ? 'is-done' : ''}" data-exercise="${exerciseIndex}" data-set="${setIndex}" role="button" tabindex="0" aria-label="${done ? `Open completed ${exercise.name} set ${setIndex + 1}` : `Start ${exercise.name} set ${setIndex + 1}`}">
            <div class="set-copy">
              Set ${setIndex + 1}${setIndex >= baseExercise.sets ? ' · Added' : ''}${active ? ' · Current' : ''}
              <span>${skipped ? 'Skipped' : (log || `${targetText(exercise)}${exercise.duration ? '' : ` · ${restSeconds(exercise)}s rest`}`)}${exercise.backupOf ? ` · backup for ${exercise.backupOf}` : ''}</span>
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
            <div class="exercise-dose">${baseExercise.sets}${addedSets ? ` + ${addedSets}` : ''} x ${exercise.reps}</div>
          </div>
          ${rows}
        </section>
      `;
    }).join('');

    document.querySelectorAll('.set-row').forEach(row => {
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
    if (exerciseIndex === null) {
      exitFocusMode();
      return;
    }
    const exercise = effectiveExercise(workout[exerciseIndex], exerciseIndex);
    if (!exercise) return;
    if (state.skipped[exerciseIndex]) {
      unskipExercise(exerciseIndex);
      return;
    }
    if (state.completed[keyFor(exerciseIndex, setIndex)]) {
      undoSet(exerciseIndex, setIndex);
      return;
    }
    if (exercise.duration) {
      startTimedSet(exerciseIndex, setIndex, exercise);
      return;
    }
    if (exercise.track !== 'none') {
      state.logs[keyFor(exerciseIndex, setIndex)] = {
        reps: actualReps.value.trim(),
        weight: exercise.track === 'weight' ? actualWeight.value.trim() : ''
      };
    }
    completeSet(exerciseIndex, setIndex);
    enterFocusMode();
  });

  focusNext.addEventListener('click', () => {
    skipRest();
  });

  completeWorkout.addEventListener('click', () => {
    openCompleteEditor();
  });

  saveCompleteWorkout.addEventListener('click', () => {
    saveWorkoutSession(Math.round(durationEditorMinutes() * 60));
  });

  cancelCompleteEdit.addEventListener('click', () => {
    closeCompleteEditor();
    saveNote.textContent = '';
  });

  exportWorkoutData.addEventListener('click', () => {
    exportHistory();
  });

  focusBackup.addEventListener('click', () => {
    if (state.currentExercise !== null) toggleBackup(state.currentExercise);
  });

  focusSkip.addEventListener('click', () => {
    if (state.currentExercise !== null) skipExercise(state.currentExercise);
  });

  focusAddSet.addEventListener('click', () => {
    if (state.currentExercise !== null) addSet(state.currentExercise);
  });

  focusSwitchEnder.addEventListener('click', () => {
    if (state.currentExercise !== null) switchEnder(state.currentExercise);
  });

  setTimer(displayTimerSeconds(workout[state.currentExercise] || workout[0]));
  if (state.startedAt && !state.completedAt) startWorkoutClock();
  updateWorkoutClock();
  render();
