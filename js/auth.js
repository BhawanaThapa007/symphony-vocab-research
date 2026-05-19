/**
 * AUTHENTICATION & SESSION MANAGEMENT
 * Handles login, logout, and user session persistence
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.loadSession();
    }
    
    loadSession() {
        this.currentUser = localStorage.getItem('symphonyCurrentUser');
        this.currentRole = localStorage.getItem('symphonyUserRole');
    }
    
    loginStudent(username) {
        if (!username || username.trim() === '') {
            throw new Error('Username is required');
        }
        
        username = username.trim();
        let students = this.getStudents();
        
        if (!students[username]) {
            students[username] = this.createNewStudent(username);
            this.saveStudents(students);
            this.logResearchEvent('student_created', {
                username: username,
                timestamp: new Date().toISOString()
            });
        } else {
            students[username].lastLogin = new Date().toISOString();
            this.updateStreak(students[username]);
            this.saveStudents(students);
            this.logResearchEvent('student_login', {
                username: username,
                timestamp: new Date().toISOString(),
                streak: students[username].streak
            });
        }
        
        this.currentUser = username;
        this.currentRole = 'student';
        localStorage.setItem('symphonyCurrentUser', username);
        localStorage.setItem('symphonyUserRole', 'student');
        
        this.startSession(students[username]);
        return students[username];
    }
    
    loginAdmin(username, password) {
        const config = window.SYMPHONY_CONFIG;
        
        if (username === config.ADMIN_USERNAME && password === config.ADMIN_PASSWORD) {
            this.currentUser = 'admin';
            this.currentRole = 'admin';
            localStorage.setItem('symphonyCurrentUser', 'admin');
            localStorage.setItem('symphonyUserRole', 'admin');
            
            this.logResearchEvent('admin_login', {
                timestamp: new Date().toISOString()
            });
            
            return true;
        }
        
        return false;
    }
    
    logout() {
        if (this.currentRole === 'student') {
            this.endSession();
        }
        
        localStorage.removeItem('symphonyCurrentUser');
        localStorage.removeItem('symphonyUserRole');
        localStorage.removeItem('symphonyCurrentSession');
        
        this.currentUser = null;
        this.currentRole = null;
    }
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    isAdmin() {
        return this.currentRole === 'admin';
    }
    
    isStudent() {
        return this.currentRole === 'student';
    }
    
    getCurrentUser() {
        if (this.isStudent()) {
            const students = this.getStudents();
            return students[this.currentUser];
        }
        return null;
    }
    
    createNewStudent(username) {
        return {
            username: username,
            createdDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            wordsLearned: 0,
            wordsMastered: 0,
            points: 0,
            level: 1,
            streak: 0,
            badges: [],
            currentUnit: 1,
            unitsCompleted: [],
            wordProgress: {},
            sessions: [],
            totalTimeMinutes: 0,
            sdtScores: [],
            currentDifficulty: 2.0,
            scaffoldingHistory: []
        };
    }
    
    updateStreak(student) {
        const today = new Date().toDateString();
        const lastLogin = new Date(student.lastLogin).toDateString();
        
        if (lastLogin === today) {
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastLogin === yesterdayStr) {
            student.streak = (student.streak || 0) + 1;
            
            if (student.streak >= 3) {
                student.points += 5;
                
                if (student.streak >= 7 && !student.badges.includes('week-warrior')) {
                    student.badges.push('week-warrior');
                    student.points += 100;
                }
            }
        } else {
            student.streak = 1;
        }
    }
    
    startSession(student) {
        const session = {
            sessionId: 'session_' + Date.now(),
            startTime: new Date().toISOString(),
            endTime: null,
            wordsAttempted: [],
            wordsLearned: 0,
            totalAttempts: 0,
            correctAttempts: 0,
            scaffoldingUsed: {},
            choicesMade: {}
        };
        
        localStorage.setItem('symphonyCurrentSession', JSON.stringify(session));
    }
    
    endSession() {
        const sessionStr = localStorage.getItem('symphonyCurrentSession');
        if (!sessionStr) return;
        
        const session = JSON.parse(sessionStr);
        session.endTime = new Date().toISOString();
        
        const duration = new Date(session.endTime) - new Date(session.startTime);
        const durationMinutes = Math.round(duration / 60000);
        
        const students = this.getStudents();
        const student = students[this.currentUser];
        
        if (student) {
            student.sessions.push(session);
            student.totalTimeMinutes += durationMinutes;
            this.saveStudents(students);
        }
        
        this.logResearchEvent('session_ended', {
            username: this.currentUser,
            sessionId: session.sessionId,
            duration: durationMinutes,
            wordsLearned: session.wordsLearned,
            successRate: session.totalAttempts > 0 
                ? (session.correctAttempts / session.totalAttempts) 
                : 0
        });
    }
    
    updateSession(updates) {
        const sessionStr = localStorage.getItem('symphonyCurrentSession');
        if (!sessionStr) return;
        
        const session = JSON.parse(sessionStr);
        Object.assign(session, updates);
        localStorage.setItem('symphonyCurrentSession', JSON.stringify(session));
    }
    
    getStudents() {
        return JSON.parse(localStorage.getItem('symphonyStudents') || '{}');
    }
    
    saveStudents(students) {
        localStorage.setItem('symphonyStudents', JSON.stringify(students));
    }
    
    updateStudent(updates) {
        const students = this.getStudents();
        const student = students[this.currentUser];
        
        if (student) {
            Object.assign(student, updates);
            this.saveStudents(students);
        }
    }
    
    logResearchEvent(eventType, data) {
        let researchLog = JSON.parse(localStorage.getItem('symphonyResearchLog') || '[]');
        
        researchLog.push({
            eventType: eventType,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('symphonyResearchLog', JSON.stringify(researchLog));
    }
}

// Create global auth instance
window.AUTH = new AuthSystem();
