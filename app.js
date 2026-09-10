import { createIcons, icons } from 'lucide';
import confetti from 'canvas-confetti';
import { JalaliCalendar } from './modules/jalaliCalendar.js';
import { SoundEngine } from './modules/soundEngine.js';
import { INITIAL_STATE } from './modules/initialState.js';

/**
 * =========================================================================
 * ZENITH APPLICATION ENGINE & PERSISTENCE
 * Depends on: modules/jalaliCalendar.js, modules/soundEngine.js,
 *             modules/initialState.js, lucide, canvas-confetti
 * =========================================================================
 */
export class ZenithApp {
  constructor() {
    this.state = this.loadState();
    this.initTheme();
    this.renderAll();
    this.setupEventListeners();
    createIcons({ icons });
  }

  loadState() {
    try {
      const saved = localStorage.getItem('zenith_pwa_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage error, using defaults', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  saveState() {
    try {
      localStorage.setItem('zenith_pwa_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
  }

  initTheme() {
    const theme = this.state.theme;
    const html = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  setTheme(mode) {
    this.state.theme = mode;
    this.saveState();
    this.initTheme();
    this.renderSettings();
    this.toast(`Theme set to ${mode.toUpperCase()}`);
  }

  setCalendarMode(mode) {
    this.state.calendarMode = mode;
    this.saveState();
    this.renderHeaderDate();
    this.renderPlanner();
    this.renderSettings();
    this.toast(`Calendar set to ${mode}`);
  }

  toggleSound(checked) {
    this.state.soundEnabled = checked;
    SoundEngine.enabled = checked;
    this.saveState();
  }

  toggleCelebrations(checked) {
    this.state.celebrationsEnabled = checked;
    this.saveState();
  }

  toggleConsequences(checked) {
    this.state.consequencesEnabled = checked;
    this.saveState();
  }

  switchTab(tabId) {
    ['home', 'planner', 'habits', 'progress', 'settings'].forEach(id => {
      const view = document.getElementById(`view-${id}`);
      const tabBtn = document.getElementById(`tab-${id}`);
      if (view) view.classList.toggle('hidden', id !== tabId);
      if (tabBtn) {
        if (id === tabId) {
          tabBtn.className = 'flex flex-col items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold transition-all';
        } else {
          tabBtn.className = 'flex flex-col items-center gap-1 text-slate-400 dark:text-zenith-darkMuted hover:text-slate-600 dark:hover:text-white transition-all';
        }
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    createIcons({ icons });
  }

  renderAll() {
    this.renderHeaderDate();
    this.renderHome();
    this.renderPlanner();
    this.renderHabits();
    this.renderProgress();
    this.renderSettings();
  }

  renderHeaderDate() {
    const now = new Date(this.state.selectedDate || new Date());
    const hour = now.getHours();
    const greetingEl = document.getElementById('header-greeting');
    if (greetingEl) {
      if (hour < 12) greetingEl.textContent = 'GOOD MORNING';
      else if (hour < 18) greetingEl.textContent = 'GOOD AFTERNOON';
      else greetingEl.textContent = 'GOOD EVENING';
    }

    const dualDateEl = document.getElementById('header-dual-date');
    if (dualDateEl) {
      dualDateEl.textContent = JalaliCalendar.formatDualDate(now, this.state.calendarMode);
    }
  }

  renderHome() {
    // Calculate dynamic completion
    const completedTasks = this.state.tasks.filter(t => t.completed).length;
    const totalTasks = this.state.tasks.length || 1;
    const percent = Math.round((completedTasks / totalTasks) * 100);

    // Daily Score: 80 base + habits + tasks
    const completedHabits = this.state.habits.filter(h => h.completed).length;
    const score = Math.min(100, Math.round(50 + (percent * 0.3) + (completedHabits * 5)));

    document.getElementById('home-score-val').textContent = score;
    document.getElementById('home-progress-percent').textContent = `${percent}%`;

    // SVG Circle Offset (251.2 is 2*pi*r with r=40)
    const offset = 251.2 - (251.2 * (percent / 100));
    document.getElementById('home-progress-circle').style.strokeDashoffset = offset;

    // Metrics
    document.getElementById('metric-tasks').textContent = `${completedTasks}/${this.state.tasks.length}`;
    document.getElementById('metric-habits').textContent = `${completedHabits}/${this.state.habits.length}`;
    document.getElementById('metric-routines').textContent = `1/${this.state.routines.length}`;
    document.getElementById('metric-streak').textContent = `${this.state.streak}d`;

    // Water
    document.getElementById('water-pill').textContent = `${this.state.waterGlasses}/${this.state.waterTarget}`;
    document.getElementById('water-count-label').textContent = `${this.state.waterGlasses} of ${this.state.waterTarget} glasses consumed`;

    // Agenda Items
    const agendaContainer = document.getElementById('home-agenda-list');
    agendaContainer.innerHTML = '';

    if (this.state.tasks.length === 0) {
      agendaContainer.innerHTML = `
        <div class="p-6 text-center rounded-3xl bg-white dark:bg-[#15241D] border border-dashed border-slate-300 dark:border-[#23382D]">
          <div class="text-3xl mb-1">🎯</div>
          <div class="text-sm font-bold text-slate-800 dark:text-white">No tasks yet</div>
          <div class="text-xs text-slate-500">Add your first task and start reaching your Zenith.</div>
        </div>`;
    } else {
      this.state.tasks.forEach(task => {
        const el = document.createElement('div');
        el.className = `p-3.5 rounded-2xl bg-white dark:bg-[#15241D] border border-slate-200/70 dark:border-[#23382D] shadow-sm flex items-center justify-between transition-all ${task.completed ? 'opacity-60' : ''}`;
        el.innerHTML = `
          <div class="flex items-center gap-3">
            <button onclick="app.toggleTask('${task.id}')" class="w-7 h-7 rounded-xl flex items-center justify-center border ${task.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'} transition-all">
              ✓
            </button>
            <div>
              <div class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}">
                <span>${task.emoji}</span>
                <span>${task.title}</span>
              </div>
              <div class="text-[11px] text-slate-500 dark:text-zenith-darkMuted flex items-center gap-2 mt-0.5">
                <span>${task.time}</span>
                <span>•</span>
                <span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-[#23382D] font-medium">${task.category}</span>
              </div>
            </div>
          </div>
          <button onclick="app.deleteTask('${task.id}')" class="p-2 text-slate-400 hover:text-rose-500">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        `;
        agendaContainer.appendChild(el);
      });
    }

    // Active Routines Grid
    const routinesGrid = document.getElementById('home-routines-grid');
    routinesGrid.innerHTML = '';
    this.state.routines.forEach(r => {
      const card = document.createElement('div');
      card.className = 'p-4 rounded-3xl bg-white dark:bg-[#15241D] border border-slate-200/70 dark:border-[#23382D] shadow-sm flex flex-col justify-between space-y-3';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-2xl">${r.emoji}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">${r.steps.length} steps</span>
        </div>
        <div>
          <div class="text-xs font-bold text-slate-900 dark:text-white">${r.name}</div>
          <div class="text-[10px] text-slate-500 dark:text-zenith-darkMuted">Scheduled ${r.time}</div>
        </div>
        <button onclick="app.startRoutine('${r.id}')" class="w-full py-2 rounded-xl bg-slate-100 dark:bg-[#23382D] hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-xs font-bold text-slate-800 dark:text-white transition-all flex items-center justify-center gap-1">
          Start Routine →
        </button>
      `;
      routinesGrid.appendChild(card);
    });

    createIcons({ icons });
  }

  renderPlanner() {
    const now = new Date(this.state.selectedDate || new Date());
    const greg = JalaliCalendar.formatDualDate(now, 'gregorian');
    const jalali = JalaliCalendar.formatDualDate(now, 'persian');

    document.getElementById('planner-gregorian-label').textContent = greg;
    document.getElementById('planner-jalali-label').textContent = jalali;

    const timelineContainer = document.getElementById('planner-timeline');
    timelineContainer.innerHTML = '';

    this.state.tasks.forEach(task => {
      const item = document.createElement('div');
      item.className = 'relative flex items-start gap-4 pl-3';
      item.innerHTML = `
        <div class="w-9 h-9 rounded-2xl bg-white dark:bg-[#15241D] border border-slate-200 dark:border-[#23382D] flex items-center justify-center text-sm shadow-sm z-10 shrink-0">
          ${task.emoji}
        </div>
        <div class="flex-1 p-3.5 rounded-2xl bg-white dark:bg-[#15241D] border border-slate-200/70 dark:border-[#23382D] shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white ${task.completed ? 'line-through text-slate-400' : ''}">${task.title}</span>
            <span class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">${task.time}</span>
          </div>
          <div class="text-[10px] text-slate-500 dark:text-zenith-darkMuted mt-1 flex items-center justify-between">
            <span>Duration: ${task.duration}</span>
            <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#23382D] text-slate-700 dark:text-slate-300 font-semibold">${task.priority}</span>
          </div>
        </div>
      `;
      timelineContainer.appendChild(item);
    });
  }

  renderHabits() {
    const habitsContainer = document.getElementById('habits-container');
    habitsContainer.innerHTML = '';

    this.state.habits.forEach(habit => {
      const percent = Math.min(100, Math.round((habit.current / habit.target) * 100));
      const card = document.createElement('div');
      card.className = 'p-4 rounded-3xl bg-white dark:bg-[#15241D] border border-slate-200/70 dark:border-[#23382D] shadow-sm space-y-3';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-2xl w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#23382D] flex items-center justify-center">${habit.emoji}</div>
            <div>
              <div class="text-sm font-bold text-slate-900 dark:text-white">${habit.name}</div>
              <div class="text-xs text-slate-500 dark:text-zenith-darkMuted">Target: ${habit.target} ${habit.unit} / day</div>
            </div>
          </div>
          <span class="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">🔥 ${habit.streak}d streak</span>
        </div>

        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Progress</span>
            <span>${habit.current} / ${habit.target} (${percent}%)</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-[#23382D] overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button onclick="app.incrementHabit('${habit.id}', -1)" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#23382D] text-xs font-bold text-slate-800 dark:text-white active:scale-95">−</button>
          <button onclick="app.incrementHabit('${habit.id}', 1)" class="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 active:scale-95">Log Progress +</button>
        </div>
      `;
      habitsContainer.appendChild(card);
    });
  }

  renderProgress() {
    // Render 7-day bar chart
    const barContainer = document.getElementById('weekly-chart-bars');
    barContainer.innerHTML = '';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [70, 85, 90, 60, 100, 80, 72];

    days.forEach((day, i) => {
      const val = values[i];
      const col = document.createElement('div');
      col.className = 'flex-1 flex flex-col items-center gap-1.5 h-full justify-end';
      col.innerHTML = `
        <div class="w-full bg-slate-100 dark:bg-[#23382D] rounded-t-lg relative flex items-end justify-center overflow-hidden" style="height: 100px;">
          <div class="w-full bg-emerald-500 rounded-t-lg transition-all duration-700" style="height: ${val}%;"></div>
        </div>
        <span class="text-[10px] font-semibold text-slate-500 dark:text-zenith-darkMuted">${day}</span>
      `;
      barContainer.appendChild(col);
    });

    // Heatmap Grid (30 intensity squares)
    const heatmap = document.getElementById('heatmap-grid');
    heatmap.innerHTML = '';
    for (let d = 1; d <= 30; d++) {
      const cell = document.createElement('div');
      const intensity = (d % 5 === 0) ? 'bg-emerald-700' : (d % 3 === 0) ? 'bg-emerald-500' : (d % 2 === 0) ? 'bg-emerald-300 dark:bg-emerald-800' : 'bg-slate-200 dark:bg-[#23382D]';
      cell.className = `aspect-square rounded-lg ${intensity} flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300`;
      cell.textContent = d;
      heatmap.appendChild(cell);
    }

    // Achievements
    const badgesContainer = document.getElementById('achievements-list');
    badgesContainer.innerHTML = `
      <div class="p-3 rounded-2xl bg-white dark:bg-[#15241D] border border-slate-200/70 dark:border-[#23382D] flex items-center gap-2.5">
        <span class="text-2xl">🏆</span>
        <div>
          <div class="text-xs font-bold text-slate-900 dark:text-white">First Habit Done</div>
          <div class="text-[10px] text-emerald-600 dark:text-emerald-400">Unlocked • Level 1</div>
        </div>
      </div>
      <div class="p-3 rounded-2xl bg-white dark:bg-[#15241D] border border-slate-200/70 dark:border-[#23382D] flex items-center gap-2.5">
        <span class="text-2xl">🔥</span>
        <div>
          <div class="text-xs font-bold text-slate-900 dark:text-white">14-Day Streak</div>
          <div class="text-[10px] text-amber-500">Active Champion</div>
        </div>
      </div>
    `;
  }

  renderSettings() {
    const theme = this.state.theme;
    ['light', 'dark', 'system'].forEach(t => {
      const btn = document.getElementById(`theme-btn-${t}`);
      if (btn) {
        btn.className = (theme === t)
          ? 'py-2 px-3 rounded-2xl border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex flex-col items-center gap-1.5'
          : 'py-2 px-3 rounded-2xl border border-slate-200 dark:border-[#23382D] text-xs font-bold text-slate-700 dark:text-slate-300 flex flex-col items-center gap-1.5';
      }
    });

    const calMode = this.state.calendarMode;
    ['gregorian', 'persian', 'both'].forEach(c => {
      const btn = document.getElementById(`cal-btn-${c}`);
      if (btn) {
        btn.className = (calMode === c)
          ? 'py-2 text-xs font-bold rounded-2xl border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
          : 'py-2 text-xs font-bold rounded-2xl border border-slate-200 dark:border-[#23382D] text-slate-700 dark:text-slate-300';
      }
    });
  }

  // Actions & Handlers
  toggleTask(id) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveState();
      this.renderAll();

      if (task.completed) {
        SoundEngine.playSuccess();
        if (this.state.celebrationsEnabled) {
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
        }
        this.toast(`Completed: ${task.title}! 🔥`);
      } else {
        if (this.state.consequencesEnabled) {
          SoundEngine.playWarning();
          this.toast('Task uncompleted. You can easily recover!');
        }
      }
    }
  }

  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.saveState();
    this.renderAll();
    this.toast('Task removed from agenda');
  }

  incrementHabit(id, delta) {
    const habit = this.state.habits.find(h => h.id === id);
    if (habit) {
      habit.current = Math.max(0, habit.current + delta);
      if (habit.current >= habit.target && !habit.completed) {
        habit.completed = true;
        habit.streak += 1;
        SoundEngine.playSuccess();
        if (this.state.celebrationsEnabled) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
        this.toast(`Goal reached for ${habit.name}! 🎉`);
      } else if (habit.current < habit.target) {
        habit.completed = false;
      }
      this.saveState();
      this.renderAll();
    }
  }

  updateWater(delta) {
    this.state.waterGlasses = Math.max(0, this.state.waterGlasses + delta);
    this.saveState();
    this.renderHome();
    if (delta > 0) {
      SoundEngine.playSuccess();
      this.toast('Hydrated! +1 glass logged 💧');
    }
  }

  changePlannerDate(days) {
    const d = new Date(this.state.selectedDate || new Date());
    d.setDate(d.getDate() + days);
    this.state.selectedDate = d.toISOString();
    this.saveState();
    this.renderHeaderDate();
    this.renderPlanner();
  }

  // Routine Execution Engine
  startRoutine(routineId) {
    const routine = this.state.routines.find(r => r.id === routineId);
    if (!routine || !routine.steps.length) return;

    this.state.activeRoutineId = routineId;
    this.state.currentRoutineStepIdx = 0;
    this.openRoutineExecutionUI(routine);
  }

  openRoutineExecutionUI(routine) {
    const modal = document.getElementById('routine-modal');
    modal.classList.remove('hidden');
    document.getElementById('exec-routine-title').textContent = routine.name;
    this.loadRoutineStep(routine, this.state.currentRoutineStepIdx);
  }

  loadRoutineStep(routine, idx) {
    const step = routine.steps[idx];
    document.getElementById('exec-step-number').textContent = `Step ${idx + 1} of ${routine.steps.length}`;
    document.getElementById('exec-step-title').textContent = step.title;
    document.getElementById('exec-step-emoji').textContent = step.emoji || '✨';
    document.getElementById('exec-step-notes').textContent = step.notes || 'Stay present and focused.';

    // Setup timer
    clearInterval(this.state.timerInterval);
    this.state.timerSecondsLeft = step.duration || 120;
    this.updateTimerDisplay();

    this.state.timerInterval = setInterval(() => {
      if (this.state.timerSecondsLeft > 0) {
        this.state.timerSecondsLeft--;
        this.updateTimerDisplay();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const m = Math.floor(this.state.timerSecondsLeft / 60).toString().padStart(2, '0');
    const s = (this.state.timerSecondsLeft % 60).toString().padStart(2, '0');
    document.getElementById('exec-timer-display').textContent = `${m}:${s}`;
  }

  completeCurrentRoutineStep() {
    const routine = this.state.routines.find(r => r.id === this.state.activeRoutineId);
    if (!routine) return;

    SoundEngine.playSuccess();

    if (this.state.currentRoutineStepIdx < routine.steps.length - 1) {
      this.state.currentRoutineStepIdx++;
      this.loadRoutineStep(routine, this.state.currentRoutineStepIdx);
      this.toast('Step completed! Next step ready.');
    } else {
      // Completed entire routine!
      clearInterval(this.state.timerInterval);
      document.getElementById('routine-modal').classList.add('hidden');
      if (this.state.celebrationsEnabled) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      }
      this.toast('🎉 Routine complete! You showed up for yourself today.');
      this.state.activeRoutineId = null;
    }
  }

  prevRoutineStep() {
    if (this.state.currentRoutineStepIdx > 0) {
      this.state.currentRoutineStepIdx--;
      const routine = this.state.routines.find(r => r.id === this.state.activeRoutineId);
      this.loadRoutineStep(routine, this.state.currentRoutineStepIdx);
    }
  }

  skipRoutineStep() {
    this.completeCurrentRoutineStep();
  }

  closeRoutineExecution() {
    clearInterval(this.state.timerInterval);
    document.getElementById('routine-modal').classList.add('hidden');
    this.state.activeRoutineId = null;
  }

  openRoutineBuilder() {
    this.openCreateModal('routine');
  }

  // Modal bottom sheet
  openCreateModal(type) {
    this.currentCreateType = type;
    const modal = document.getElementById('modal-create-sheet');
    const titleEl = document.getElementById('modal-create-title');
    const fields = document.getElementById('modal-create-fields');
    modal.classList.remove('hidden');

    if (type === 'task') {
      titleEl.textContent = 'Create New Task';
      fields.innerHTML = `
        <div>
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Emoji & Title</label>
          <div class="flex gap-2 mt-1">
            <input id="input-task-emoji" type="text" value="🎯" class="w-12 text-center text-lg p-2 rounded-xl bg-slate-100 dark:bg-[#0D1813] border border-slate-300 dark:border-[#23382D]" />
            <input id="input-task-title" type="text" placeholder="Task title..." class="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D]" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
            <select id="input-task-category" class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D] mt-1">
              <option>Work</option><option>Study</option><option>Health</option><option>Wellness</option><option>Personal</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Priority</label>
            <select id="input-task-priority" class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D] mt-1">
              <option>Low</option><option>Medium</option><option selected>High</option><option>Critical</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Scheduled Time</label>
          <input id="input-task-time" type="time" value="10:00" class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D] mt-1" />
        </div>
      `;
    } else if (type === 'habit') {
      titleEl.textContent = 'Create New Habit';
      fields.innerHTML = `
        <div>
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Habit Name & Emoji</label>
          <div class="flex gap-2 mt-1">
            <input id="input-habit-emoji" type="text" value="🏃" class="w-12 text-center text-lg p-2 rounded-xl bg-slate-100 dark:bg-[#0D1813] border border-slate-300 dark:border-[#23382D]" />
            <input id="input-habit-name" type="text" placeholder="e.g. Read 30 mins" class="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D]" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Daily Target</label>
            <input id="input-habit-target" type="number" value="1" min="1" class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D] mt-1" />
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Unit</label>
            <input id="input-habit-unit" type="text" value="times" class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D] mt-1" />
          </div>
        </div>
      `;
    } else if (type === 'routine') {
      titleEl.textContent = 'Create Custom Routine';
      fields.innerHTML = `
        <div>
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Routine Name & Emoji</label>
          <div class="flex gap-2 mt-1">
            <input id="input-routine-emoji" type="text" value="⚡" class="w-12 text-center text-lg p-2 rounded-xl bg-slate-100 dark:bg-[#0D1813] border border-slate-300 dark:border-[#23382D]" />
            <input id="input-routine-name" type="text" placeholder="e.g. Afternoon Focus" class="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D]" />
          </div>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Start Time</label>
          <input id="input-routine-time" type="time" value="14:00" class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0D1813] text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-[#23382D] mt-1" />
        </div>
      `;
    }
  }

  closeCreateModal() {
    document.getElementById('modal-create-sheet').classList.add('hidden');
  }

  submitCreatedItem() {
    if (this.currentCreateType === 'task') {
      const title = document.getElementById('input-task-title').value.trim();
      if (!title) return alert('Please enter a task title');
      const emoji = document.getElementById('input-task-emoji').value.trim() || '🎯';
      const category = document.getElementById('input-task-category').value;
      const priority = document.getElementById('input-task-priority').value;
      const time = document.getElementById('input-task-time').value;

      this.state.tasks.push({
        id: `task_${Date.now()}`,
        title,
        emoji,
        category,
        priority,
        time,
        duration: '30m',
        completed: false
      });
    } else if (this.currentCreateType === 'habit') {
      const name = document.getElementById('input-habit-name').value.trim();
      if (!name) return alert('Please enter a habit name');
      const emoji = document.getElementById('input-habit-emoji').value.trim() || '🔥';
      const target = parseInt(document.getElementById('input-habit-target').value, 10) || 1;
      const unit = document.getElementById('input-habit-unit').value.trim() || 'times';

      this.state.habits.push({
        id: `habit_${Date.now()}`,
        name,
        emoji,
        target,
        unit,
        current: 0,
        streak: 0,
        completed: false
      });
    } else if (this.currentCreateType === 'routine') {
      const name = document.getElementById('input-routine-name').value.trim();
      if (!name) return alert('Please enter a routine name');
      const emoji = document.getElementById('input-routine-emoji').value.trim() || '⚡';
      const time = document.getElementById('input-routine-time').value;

      this.state.routines.push({
        id: `routine_${Date.now()}`,
        name,
        emoji,
        time,
        steps: [
          { title: 'Focus Breathwork', emoji: '🧘', duration: 180, notes: 'Clear mind and center attention' },
          { title: 'Execute Key Priority', emoji: '⚡', duration: 900, notes: 'Zero distractions' }
        ]
      });
    }

    this.saveState();
    this.closeCreateModal();
    this.renderAll();
    SoundEngine.playSuccess();
    this.toast('Saved to Zenith! 🚀');
  }

  toggleCreateMenu() {
    this.openCreateModal('task');
  }

  // Notifications
  requestNotificationPermission() {
    if (!('Notification' in window)) {
      this.toast('Notifications not supported in this browser context');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        this.toast('Zenith notifications active! 🔔');
        new Notification('Zenith Reminders', {
          body: 'Daily routine & habit reminders configured.',
          icon: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=128'
        });
      } else {
        this.toast('Notification permissions denied.');
      }
    });
  }

  // Export / Import
  exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `zenith_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    this.toast('Backup file downloaded');
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.tasks && parsed.habits) {
          this.state = parsed;
          this.saveState();
          this.initTheme();
          this.renderAll();
          this.toast('Zenith backup successfully restored!');
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        alert('Invalid backup file. Please select a valid Zenith JSON export.');
      }
    };
    reader.readAsText(file);
  }

  resetSampleData() {
    if (confirm('Reset Zenith to initial pristine sample state?')) {
      this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
      this.saveState();
      this.initTheme();
      this.renderAll();
      this.toast('Reset to default sample data.');
    }
  }

  toast(msg) {
    const toastEl = document.getElementById('zenith-toast');
    toastEl.textContent = msg;
    toastEl.classList.remove('opacity-0', 'pointer-events-none');
    toastEl.classList.add('opacity-100');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toastEl.classList.remove('opacity-100');
      toastEl.classList.add('opacity-0', 'pointer-events-none');
    }, 2200);
  }

  setupEventListeners() {
    // Handle iOS PWA Standalone Mode Check
    window.addEventListener('load', () => {
      if (window.navigator.standalone) {
        console.log('Zenith running in standalone iPhone PWA mode');
      }
    });
  }
}
