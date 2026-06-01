// Premium Casino Game - Cloade Design System

class CloadeSlotMachine {
    constructor() {
        // Game State
        this.balance = 1000;
        this.gems = 100;
        this.jackpot = 5000;
        this.level = 1;
        this.experience = 0;
        this.currentBet = 10;
        this.currentBetMega = 20;
        this.isSpinning = false;

        // Statistics
        this.stats = {
            totalSpins: 0,
            totalWins: 0,
            winStreak: 0,
            totalWinAmount: 0,
            jackpotHits: 0,
            largestWin: 0
        };

        // Symbols and Multipliers
        this.SYMBOLS = ['🍒', '🍊', '🍉', '💎', '🔔', '⭐'];
        this.SYMBOL_MULTIPLIER = {
            '🍒': 2,
            '🍊': 3,
            '🍉': 5,
            '💎': 10,
            '🔔': 7,
            '⭐': 15
        };

        // Achievements
        this.achievements = {
            first_win: { name: 'First Win', icon: '🏅', unlocked: false },
            ten_wins: { name: '10 Wins', icon: '🥈', unlocked: false },
            fifty_wins: { name: '50 Wins', icon: '🥇', unlocked: false },
            jackpot: { name: 'Jackpot', icon: '🎰', unlocked: false },
            mega_win: { name: 'Mega Win', icon: '💎', unlocked: false },
            level_5: { name: 'Level 5', icon: '⭐', unlocked: false },
            all_in: { name: 'All In', icon: '🔥', unlocked: false },
            lucky_seven: { name: 'Lucky Seven', icon: '7️⃣', unlocked: false }
        };

        this.setupDOM();
        this.loadGameData();
        this.initializeEventListeners();
        this.updateUI();
    }

    setupDOM() {
        // Stats
        this.balanceSpan = document.getElementById('balanceValue');
        this.gemsSpan = document.getElementById('gemsValue');
        this.jackpotSpan = document.getElementById('jackpotValue');
        this.levelSpan = document.getElementById('levelValue');

        // Classic Mode
        this.reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
        this.betAmount = document.getElementById('betAmount');
        this.spinBtn = document.getElementById('spinBtn');
        this.resetBtn = document.getElementById('resetGameBtn');
        this.decrBetBtn = document.getElementById('decrBet');
        this.incrBetBtn = document.getElementById('incrBet');
        this.messageDiv = document.getElementById('gameMessage');

        // Mega Mode
        this.reelsMega = [document.getElementById('reel-mega-1'), document.getElementById('reel-mega-2'), 
                          document.getElementById('reel-mega-3'), document.getElementById('reel-mega-4'), 
                          document.getElementById('reel-mega-5')];
        this.betAmountMega = document.getElementById('betAmountMega');
        this.spinBtnMega = document.getElementById('spinBtnMega');
        this.resetBtnMega = document.getElementById('resetGameBtnMega');
        this.decrBetBtnMega = document.getElementById('decrBetMega');
        this.incrBetBtnMega = document.getElementById('incrBetMega');
        this.messageDivMega = document.getElementById('gameMessageMega');

        // Stats
        this.spinCount = document.getElementById('spinCount');
        this.winCount = document.getElementById('winCount');
        this.winStreak = document.getElementById('winStreak');
        this.totalWins = document.getElementById('totalWins');

        // Tabs
        this.tabBtns = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.navLinks = document.querySelectorAll('.nav-link');

        // Settings
        this.soundToggle = document.getElementById('soundToggle');
        this.effectsToggle = document.getElementById('effectsToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.resetStatsBtn = document.getElementById('resetStatsBtn');
        this.clearCacheBtn = document.getElementById('clearCacheBtn');

        // Other
        this.maxBetBtn = document.getElementById('maxBetBtn');
        this.allInBtn = document.getElementById('allInBtn');
    }

    initializeEventListeners() {
        // Classic Mode
        this.spinBtn.addEventListener('click', () => this.spin('classic'));
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.decrBetBtn.addEventListener('click', () => this.changeBet(-5, 'classic'));
        this.incrBetBtn.addEventListener('click', () => this.changeBet(5, 'classic'));
        this.maxBetBtn.addEventListener('click', () => this.setMaxBet());
        this.allInBtn.addEventListener('click', () => this.setAllIn());

        // Mega Mode
        this.spinBtnMega.addEventListener('click', () => this.spin('mega'));
        this.resetBtnMega.addEventListener('click', () => this.resetGame());
        this.decrBetBtnMega.addEventListener('click', () => this.changeBet(-10, 'mega'));
        this.incrBetBtnMega.addEventListener('click', () => this.changeBet(10, 'mega'));

        // Tabs
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings
        this.resetStatsBtn.addEventListener('click', () => this.resetAllStats());
        this.clearCacheBtn.addEventListener('click', () => this.clearCache());
        this.soundToggle.addEventListener('click', (e) => this.toggleSetting(e.target, 'sound'));
        this.effectsToggle.addEventListener('click', (e) => this.toggleSetting(e.target, 'effects'));
        this.themeToggle.addEventListener('click', (e) => this.toggleSetting(e.target, 'theme'));
    }

    switchTab(tabName) {
        this.tabContents.forEach(content => content.classList.remove('active'));
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.navLinks.forEach(link => link.classList.remove('active'));
        
        document.getElementById(tabName)?.classList.add('active');
        document.querySelector(`.tab-button[data-tab="${tabName}"]`)?.classList.add('active');
        document.querySelector(`.nav-link[data-tab="${tabName}"]`)?.classList.add('active');

        if (tabName === 'achievements') this.updateAchievements();
        if (tabName === 'leaderboard') this.updateLeaderboard();
    }

    spin(mode) {
        if (this.isSpinning) return;

        const bet = mode === 'classic' ? this.currentBet : this.currentBetMega;
        const reels = mode === 'classic' ? this.reels : this.reelsMega;
        const messageDiv = mode === 'classic' ? this.messageDiv : this.messageDivMega;
        const reelCount = mode === 'classic' ? 3 : 5;

        if (bet > this.balance) {
            messageDiv.className = 'message error';
            messageDiv.innerHTML = `Insufficient balance. Current: ${Math.floor(this.balance)}`;
            return;
        }
        if (this.balance <= 0) {
            messageDiv.className = 'message error';
            messageDiv.innerHTML = 'Game over. Please reset to play again.';
            return;
        }

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        if (mode === 'mega') this.spinBtnMega.disabled = true;

        this.balance -= bet;
        this.stats.totalSpins++;
        this.updateUI();

        messageDiv.className = 'message';
        messageDiv.innerHTML = 'Spinning...';

        const spinDuration = 1500;
        const spinStartTime = Date.now();
        const spinInterval = setInterval(() => {
            const elapsed = Date.now() - spinStartTime;
            if (elapsed < spinDuration) {
                reels.forEach(reel => {
                    const randomSymbol = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
                    reel.textContent = randomSymbol;
                    reel.parentElement.classList.add('spinning');
                });
            } else {
                clearInterval(spinInterval);
                reels.forEach(reel => reel.parentElement.classList.remove('spinning'));

                const results = reels.map(r => r.textContent);
                const winData = this.calculateWin(results, bet);
                this.handleWin(winData, messageDiv);
                
                this.isSpinning = false;
                this.spinBtn.disabled = false;
                if (mode === 'mega') this.spinBtnMega.disabled = false;
            }
        }, 50);
    }

    calculateWin(symbols, bet) {
        const allMatch = symbols.every(s => s === symbols[0]);
        const twoMatch = symbols.filter(s => s === symbols[0]).length >= 2;

        if (allMatch) {
            if (symbols[0] === '💎') {
                return { win: this.jackpot, type: 'JACKPOT', multiplier: 'JACKPOT', symbol: '💎' };
            }
            const multiplier = this.SYMBOL_MULTIPLIER[symbols[0]];
            return { win: bet * multiplier, type: 'WIN', multiplier, symbol: symbols[0] };
        }

        if (twoMatch) {
            return { win: Math.floor(bet * 0.8), type: 'SMALL', multiplier: '0.8x' };
        }

        return { win: 0, type: 'LOSE', multiplier: 0 };
    }

    handleWin(winData, messageDiv) {
        if (winData.win > 0) {
            this.balance += winData.win;
            this.stats.totalWins++;
            this.stats.winStreak++;
            this.stats.totalWinAmount += winData.win;

            if (winData.win > this.stats.largestWin) {
                this.stats.largestWin = winData.win;
            }

            if (winData.type === 'JACKPOT') {
                messageDiv.className = 'message success';
                messageDiv.innerHTML = `🎉 JACKPOT! You won ${Math.floor(winData.win)} coins! 💎💎💎`;
                this.stats.jackpotHits++;
                this.jackpot = 3000;
                this.achievements.jackpot.unlocked = true;
            } else if (winData.type === 'WIN') {
                messageDiv.className = 'message success';
                messageDiv.innerHTML = `✓ Win! ${winData.symbol.repeat(3)} × ${winData.multiplier} = +${Math.floor(winData.win)} coins`;
                this.achievements.first_win.unlocked = true;
            } else {
                messageDiv.className = 'message success';
                messageDiv.innerHTML = `✓ Two match! +${Math.floor(winData.win)} coins`;
            }

            this.jackpot += Math.floor(this.currentBet * 0.05);
        } else {
            messageDiv.className = 'message warning';
            messageDiv.innerHTML = `No match. Better luck next time.`;
            this.stats.winStreak = 0;
            this.jackpot += Math.floor(this.currentBet * 0.05);
        }

        this.checkAchievements();
        this.levelUp();
        this.saveGameData();
        this.updateUI();
    }

    changeBet(delta, mode) {
        if (mode === 'classic') {
            this.currentBet = Math.max(5, Math.min(500, this.currentBet + delta));
            if (this.currentBet > this.balance) this.currentBet = Math.floor(this.balance);
            this.betAmount.textContent = this.currentBet;
        } else {
            this.currentBetMega = Math.max(10, Math.min(1000, this.currentBetMega + delta));
            if (this.currentBetMega > this.balance) this.currentBetMega = Math.floor(this.balance);
            this.betAmountMega.textContent = this.currentBetMega;
        }
    }

    setMaxBet() {
        this.currentBet = Math.min(500, Math.floor(this.balance));
        this.betAmount.textContent = this.currentBet;
    }

    setAllIn() {
        this.currentBet = Math.floor(this.balance);
        this.betAmount.textContent = this.currentBet;
    }

    resetGame() {
        if (confirm('Reset game? Your balance will return to 1000.')) {
            this.balance = 1000;
            this.jackpot = 5000;
            this.currentBet = 10;
            this.currentBetMega = 20;
            this.saveGameData();
            this.updateUI();
            this.messageDiv.innerHTML = 'Game reset. Ready to play again!';
            this.messageDiv.className = 'message';
        }
    }

    checkAchievements() {
        if (this.stats.totalWins === 10) this.achievements.ten_wins.unlocked = true;
        if (this.stats.totalWins === 50) this.achievements.fifty_wins.unlocked = true;
        if (this.stats.largestWin > 5000) this.achievements.mega_win.unlocked = true;
        if (this.level >= 5) this.achievements.level_5.unlocked = true;
    }

    levelUp() {
        this.experience += Math.floor(this.currentBet * 0.1);
        if (this.experience >= this.level * 100) {
            this.level++;
            this.gems += 10;
        }
    }

    updateAchievements() {
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = '';
        Object.entries(this.achievements).forEach(([key, achievement]) => {
            const div = document.createElement('div');
            div.className = 'achievement-card';
            div.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-status">${achievement.unlocked ? '✓ Unlocked' : '🔒 Locked'}</div>
            `;
            container.appendChild(div);
        });
    }

    updateLeaderboard() {
        const container = document.getElementById('leaderboardContainer');
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ name: 'You', score: this.balance });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(10);

        container.innerHTML = '';
        leaderboard.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'leaderboard-item';
            div.innerHTML = `
                <div class="leaderboard-rank">#${index + 1}</div>
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-score">${Math.floor(entry.score)}</div>
            `;
            container.appendChild(div);
        });

        localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, -1)));
    }

    toggleSetting(btn, setting) {
        btn.classList.toggle('on');
        localStorage.setItem(`setting_${setting}`, btn.classList.contains('on'));
    }

    resetAllStats() {
        if (confirm('Reset all statistics? This cannot be undone.')) {
            this.stats = {
                totalSpins: 0,
                totalWins: 0,
                winStreak: 0,
                totalWinAmount: 0,
                jackpotHits: 0,
                largestWin: 0
            };
            this.saveGameData();
            this.updateUI();
        }
    }

    clearCache() {
        if (confirm('Clear all data? This cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
    }

    updateUI() {
        this.balanceSpan.textContent = Math.floor(this.balance);
        this.gemsSpan.textContent = this.gems;
        this.jackpotSpan.textContent = Math.floor(this.jackpot);
        this.levelSpan.textContent = this.level;
        this.betAmount.textContent = this.currentBet;
        this.betAmountMega.textContent = this.currentBetMega;
        this.spinCount.textContent = this.stats.totalSpins;
        this.winCount.textContent = this.stats.totalWins;
        this.winStreak.textContent = this.stats.winStreak;
        this.totalWins.textContent = Math.floor(this.stats.totalWinAmount);
    }

    saveGameData() {
        const gameData = {
            balance: this.balance,
            gems: this.gems,
            jackpot: this.jackpot,
            level: this.level,
            experience: this.experience,
            stats: this.stats,
            achievements: this.achievements
        };
        localStorage.setItem('cloadeSlotData', JSON.stringify(gameData));
    }

    loadGameData() {
        const savedData = localStorage.getItem('cloadeSlotData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.balance = data.balance || 1000;
            this.gems = data.gems || 100;
            this.jackpot = data.jackpot || 5000;
            this.level = data.level || 1;
            this.experience = data.experience || 0;
            this.stats = data.stats || this.stats;
            this.achievements = data.achievements || this.achievements;
        }
    }
}

// Initialize Game
const game = new CloadeSlotMachine();
