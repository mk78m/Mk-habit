/**
 * =========================================================================
 * ZENITH — DEFAULT / SAMPLE APPLICATION STATE
 * =========================================================================
 */
export const INITIAL_STATE = {
  theme: 'system',
  calendarMode: 'both',
  soundEnabled: true,
  celebrationsEnabled: true,
  consequencesEnabled: true,
  waterGlasses: 5,
  waterTarget: 8,
  streak: 14,
  selectedDate: new Date().toISOString(),
  tasks: [
    { id: 'task_1', title: 'Morning Workout & Stretch', category: 'Health', time: '07:30', duration: '45m', priority: 'High', completed: true, emoji: '🏃' },
    { id: 'task_2', title: 'Deep Work: Architecture Blueprint', category: 'Work', time: '09:00', duration: '2h', priority: 'Critical', completed: true, emoji: '💼' },
    { id: 'task_3', title: 'Study TypeScript Design Patterns', category: 'Study', time: '14:30', duration: '1h', priority: 'Medium', completed: true, emoji: '📚' },
    { id: 'task_4', title: 'Read 20 Pages of Philosophy', category: 'Personal', time: '18:00', duration: '30m', priority: 'Low', completed: false, emoji: '📖' },
    { id: 'task_5', title: 'Evening Reflection & Stargazing', category: 'Wellness', time: '21:30', duration: '20m', priority: 'Medium', completed: false, emoji: '🌙' }
  ],
  habits: [
    { id: 'habit_1', name: 'Hydration Target', emoji: '💧', current: 5, target: 8, unit: 'glasses', streak: 14, completed: false },
    { id: 'habit_2', name: 'Mindful Meditation', emoji: '🧘', current: 15, target: 15, unit: 'mins', streak: 9, completed: true },
    { id: 'habit_3', name: 'Active Exercise', emoji: '🏃', current: 45, target: 45, unit: 'mins', streak: 18, completed: true },
    { id: 'habit_4', name: 'Night Journaling', emoji: '✍️', current: 0, target: 1, unit: 'session', streak: 6, completed: false }
  ],
  routines: [
    {
      id: 'routine_1',
      name: 'Morning Routine ☀️',
      emoji: '☀️',
      time: '07:00',
      steps: [
        { title: 'Gentle Awakening & Stretch', emoji: '🛌', duration: 180, notes: 'Breathe deeply and mobilize spine' },
        { title: 'Drink Large Glass of Water', emoji: '💧', duration: 120, notes: 'Rehydrate bodily functions' },
        { title: 'Brushing Teeth & Cold Wash', emoji: '🪥', duration: 180, notes: 'Cleanse and refresh' },
        { title: 'Mindful Breathwork', emoji: '🧘', duration: 300, notes: '10 deep box breaths' },
        { title: 'Review Daily Agenda', emoji: '🎯', duration: 180, notes: 'Align daily top 3 priorities' }
      ]
    },
    {
      id: 'routine_2',
      name: 'Night Shutdown 🌙',
      emoji: '🌙',
      time: '21:30',
      steps: [
        { title: 'Digital Screen Disconnect', emoji: '📵', duration: 60, notes: 'Place phone on charger away from bed' },
        { title: 'Gratitude Reflection', emoji: '✍️', duration: 300, notes: 'Record 3 highlights from today' },
        { title: 'Herbal Tea & Reading', emoji: '☕', duration: 600, notes: 'Warm peppermint tea' }
      ]
    }
  ],
  activeRoutineId: null,
  currentRoutineStepIdx: 0,
  timerInterval: null,
  timerSecondsLeft: 0
};
