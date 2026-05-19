/**
 * SYMPHONY VOCABULARY LEARNING SYSTEM - CONFIGURATION
 * 
 * Research Study: AI-Enhanced Gamified Vocabulary Learning
 * Grade Level: 4
 * Theoretical Framework: CTML, SDT, ZPD, Vocabulary Learning Theory
 */

const CONFIG = {
    // SYSTEM INFORMATION
    VERSION: '1.0.0',
    STUDY_NAME: 'Symphony Vocabulary DBR Study',
    GRADE_LEVEL: 4,
    
    // CONTENT SPECIFICATIONS
    TOTAL_WORDS: 15,
    TOTAL_UNITS: 1,
    WORDS_PER_UNIT: 15,
    
    // AUTHENTICATION
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'admin123',
    
    // GAMIFICATION (SDT Implementation)
    POINTS: {
        FIRST_TRY_CORRECT: 15,
        SECOND_TRY_CORRECT: 10,
        THIRD_TRY_CORRECT: 5,
        WORD_MASTERED: 20,
        DAILY_LOGIN: 5,
        UNIT_COMPLETE: 100
    },
    
    // LEVELS (SDT Competence)
    LEVELS: {
        1: { name: 'Vocabulary Beginner', pointsRequired: 0 },
        2: { name: 'Word Explorer', pointsRequired: 200 },
        3: { name: 'Vocabulary Scholar', pointsRequired: 500 },
        4: { name: 'Word Expert', pointsRequired: 1000 },
        5: { name: 'Vocabulary Master', pointsRequired: 2000 },
        6: { name: 'Word Champion', pointsRequired: 3500 }
    },
    
    // BADGES (SDT Competence)
    BADGES: {
        FIRST_WORD: { id: 'first-word', name: 'First Word', icon: '🌟', requirement: 1 },
        FAST_LEARNER: { id: 'fast-learner', name: 'Fast Learner', icon: '⚡', requirement: 'session_10_words' },
        WEEK_WARRIOR: { id: 'week-warrior', name: 'Week Warrior', icon: '🔥', requirement: 'streak_7' },
        UNIT_MASTER: { id: 'unit-master', name: 'Unit 1 Master', icon: '🎓', requirement: 'unit_complete' },
        PERFECT_SCORE: { id: 'perfect-score', name: 'Perfect Score', icon: '💯', requirement: 'quiz_100' }
    },
    
    // ZPD ADAPTIVE SYSTEM
    ZPD: {
        INITIAL_DIFFICULTY: 2.0,
        TARGET_SUCCESS_RATE_MIN: 0.60,
        TARGET_SUCCESS_RATE_MAX: 0.75,
        DIFFICULTY_ADJUSTMENT: 0.3,
        WORDS_BEFORE_ADJUSTMENT: 10,
        MAX_DIFFICULTY: 2.5,
        MIN_DIFFICULTY: 1.5
    },
    
    // SCAFFOLDING (ZPD Implementation)
    SCAFFOLDING_LEVELS: 5,
    MASTERY_THRESHOLD: 3,
    
    // CTML SPECIFICATIONS
    CTML: {
        ENABLE_AUDIO: true,
        AUDIO_RATE: 0.8,
        SEGMENT_SIZE: 5,
        PAUSE_DURATION: 3000,
        AUTO_PLAY_AUDIO: true
    },
    
    // SESSION MANAGEMENT
    SESSION: {
        AUTO_SAVE_INTERVAL: 30000,
        SESSION_TIMEOUT: 3600000,
        MIN_SESSION_TIME: 300000
    },
    
    // RESEARCH DATA COLLECTION
    RESEARCH: {
        LOG_ALL_INTERACTIONS: true,
        ANONYMOUS_MODE: false,
        DATA_EXPORT_FORMAT: 'csv',
        INCLUDE_TIMESTAMPS: true,
        LOG_CHOICES: true
    },
    
    // STORAGE KEYS (LocalStorage)
    STORAGE_KEYS: {
        STUDENTS: 'symphonyStudents',
        CURRENT_USER: 'symphonyCurrentUser',
        USER_ROLE: 'symphonyUserRole',
        CURRENT_SESSION: 'symphonyCurrentSession',
        RESEARCH_LOG: 'symphonyResearchLog',
        SETTINGS: 'symphonySettings'
    }
};

// Make config available globally
window.SYMPHONY_CONFIG = CONFIG;
