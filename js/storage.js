/**
 * STORAGE MANAGER
 * Handles all data persistence with auto-save
 */

class StorageManager {
    constructor() {
        this.autoSaveInterval = null;
        this.setupAutoSave();
    }
    
    setupAutoSave() {
        const config = window.SYMPHONY_CONFIG;
        
        if (config.SESSION.AUTO_SAVE_INTERVAL) {
            this.autoSaveInterval = setInterval(() => {
                this.autoSave();
            }, config.SESSION.AUTO_SAVE_INTERVAL);
        }
    }
    
    autoSave() {
        if (!window.AUTH || !window.AUTH.isStudent()) return;
        
        const currentUser = window.AUTH.currentUser;
        const students = window.AUTH.getStudents();
        const student = students[currentUser];
        
        if (!student) return;
        
        window.AUTH.saveStudents(students);
        
        const session = this.getCurrentSession();
        if (session) {
            localStorage.setItem('symphonyCurrentSession', JSON.stringify(session));
        }
    }
    
    getCurrentSession() {
        const sessionStr = localStorage.getItem('symphonyCurrentSession');
        return sessionStr ? JSON.parse(sessionStr) : null;
    }
    
    saveWordProgress(wordId, data) {
        if (!window.AUTH || !window.AUTH.isStudent()) return;
        
        const students = window.AUTH.getStudents();
        const student = students[window.AUTH.currentUser];
        
        if (!student) return;
        
        if (!student.wordProgress[wordId]) {
            student.wordProgress[wordId] = {
                attempts: [],
                mastered: false,
                lastReview: null,
                scaffoldingLevels: [],
                totalAttempts: 0,
                correctAttempts: 0
            };
        }
        
        const wordProgress = student.wordProgress[wordId];
        wordProgress.attempts.push(data);
        wordProgress.totalAttempts++;
        
        if (data.correct) {
            wordProgress.correctAttempts++;
        }
        
        wordProgress.scaffoldingLevels.push(data.scaffoldingLevel);
        wordProgress.lastReview = new Date().toISOString();
        
        const recentAttempts = wordProgress.attempts.slice(-3);
        if (recentAttempts.length === 3 && recentAttempts.every(a => a.correct)) {
            if (!wordProgress.mastered) {
                wordProgress.mastered = true;
                this.handleWordMastered(wordId, student);
            }
        }
        
        window.AUTH.saveStudents(students);
    }
    
    handleWordMastered(wordId, student) {
        student.wordsMastered++;
        
        const config = window.SYMPHONY_CONFIG;
        student.points += config.POINTS.WORD_MASTERED;
        
        if (!student.wordProgress[wordId].countedAsLearned) {
            student.wordsLearned++;
            student.wordProgress[wordId].countedAsLearned = true;
        }
        
        this.checkBadges(student);
        this.checkLevelUp(student);
        
        window.AUTH.logResearchEvent('word_mastered', {
            username: student.username,
            wordId: wordId,
            totalAttempts: student.wordProgress[wordId].totalAttempts,
            scaffoldingUsed: student.wordProgress[wordId].scaffoldingLevels
        });
    }
    
    checkBadges(student) {
        const config = window.SYMPHONY_CONFIG;
        
        if (student.wordsLearned >= 1 && !student.badges.includes('first-word')) {
            student.badges.push('first-word');
            student.points += 50;
        }
        
        const currentSession = this.getCurrentSession();
        if (currentSession && currentSession.wordsLearned >= 10 && !student.badges.includes('fast-learner')) {
            student.badges.push('fast-learner');
            student.points += 100;
        }
        
        if (student.wordsLearned >= 15 && !student.badges.includes('unit-master')) {
            student.badges.push('unit-master');
            student.points += 200;
        }
    }
    
    checkLevelUp(student) {
        const config = window.SYMPHONY_CONFIG;
        const levels = config.LEVELS;
        
        let newLevel = student.level;
        
        for (const [level, data] of Object.entries(levels)) {
            const levelNum = parseInt(level);
            if (student.points >= data.pointsRequired && student.level < levelNum) {
                newLevel = levelNum;
            }
        }
        
        if (newLevel > student.level) {
            student.level = newLevel;
            
            window.AUTH.logResearchEvent('level_up', {
                username: student.username,
                newLevel: newLevel,
                levelName: levels[newLevel].name,
                points: student.points
            });
            
            return true;
        }
        
        return false;
    }
    
    getWordProgress(wordId) {
        if (!window.AUTH || !window.AUTH.isStudent()) return null;
        
        const student = window.AUTH.getCurrentUser();
        if (!student) return null;
        
        return student.wordProgress[wordId] || null;
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
}

// Create global storage instance
window.STORAGE = new StorageManager();

// Save data before page unload
window.addEventListener('beforeunload', () => {
    if (window.AUTH && window.AUTH.isStudent()) {
        window.AUTH.endSession();
        window.STORAGE.autoSave();
    }
});
