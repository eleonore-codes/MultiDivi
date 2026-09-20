// Adjustable teaching assumptions, not diagnostic norms. Reward rules are separate.
export const CONFIG = Object.freeze({
  SCHEMA_VERSION: 2, GENERAL_SESSION_MINUTES: 3, FOCUS_SESSION_MINUTES: 2,
  DEV_GENERAL_MS: 30000, DEV_FOCUS_MS: 20000, CHECKPOINT_MS: 4000,
  MAX_RESULT: 9999, MAX_DIGITS: 4, DOUBLE_TAP_MS: 90, INTERRUPTION_MS: 60000,
  RECENT_WINDOW: 12, MASTERY_MIN_OBSERVATIONS: 6, SUFFICIENT_OBSERVATIONS: 3,
  AUTOMATIZATION_ACCURACY: .9, SECURE_ACCURACY: .8, FAST_STREAK: 3,
  FAST_RESPONSE_MS: {1:3000,2:4000,3:5000,4:7000}, STABILITY_RATIO: 2,
  STRATEGY_MIN_OBSERVATIONS: 4, STRATEGY_ACCURACY: .9,
  QUALIFYING_SUCCESS_ACCURACY: .90,
  MIN_GENERAL_ATTEMPTS_FOR_SUCCESS: 12, MIN_FOCUS_ATTEMPTS_FOR_SUCCESS: 8,
  ADVANCED_SUCCESS_ACCURACY: .8, ADVANCED_MIN_TASKS: {a:2,b:1},
  ADVANCED_MIN_STEPS: {a:8,b:4}, DRILL_MIN_ATTEMPTS: {a:8,b:6},
  LEVEL_2_REQUIRED_SUCCESSES: 5,
  SPACING_TASKS: 4, FOCUS_FAMILIES: 8, FOCUS_SHARE: .72, EASY_SHARE: .15, COVERAGE_SHARE: .2,
  PRIORITY: {unseen:3,uncertain:10,slow:7,secure:2,automated:.6},
  SPACED_MAX_BONUS: 3, SPACED_DAYS: 3,
  RANGES: {level4:[11,29,2,9],level5:[11,39,11,19],level6:[11,19,11,29]},
  UNLOCK: {
    2:{prerequisite:1,successes:5},
    3:{prerequisite:1,successes:8,observations:180,coverage:.15},
    4:{prerequisite:3,successes:6,observations:120,coverage:.2},
    5:{prerequisite:4,successes:6,observations:120,coverage:.15},
    6:{prerequisite:5,successes:4,observations:20,strategyCompetence:.8,minStrategyTasks:10}
  }
});
export const LEVEL_NAMES={1:'Kleines Einmaleins',2:'Division mit Rest',3:'Zehnervielfache',4:'Größere Zahlen',5:'Malnehmen mit Rechenbrett',6:'Teilen in Schritten'};
export const TEXT={correct:'✓ Richtig',wrong:'✕ Noch nicht',done:'Für heute geschafft. Bis zum nächsten Training!',finish:'Fertig'};
export const durations=(dev=false)=>({a:dev?CONFIG.DEV_GENERAL_MS:CONFIG.GENERAL_SESSION_MINUTES*60000,b:dev?CONFIG.DEV_FOCUS_MS:CONFIG.FOCUS_SESSION_MINUTES*60000});
