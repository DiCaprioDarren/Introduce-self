class MathGame {
    constructor() {
        this.level = 1;
        this.maxLevel = 30; // 总共30关
        this.score = 0;
        this.timeLeft = 15;
        this.maxTime = 15;
        this.stars = 0;
        this.wrongCount = 0;
        this.operators = ['+'];
        this.isGameOver = false;
        this.soundEnabled = true; // 声音开关
        
        // 统计数据
        this.totalCorrect = 0; // 总答对题数
        this.totalWrong = 0; // 总答错题数
        this.totalTime = 0; // 总用时
        this.questionStartTime = 0; // 当前题目开始时间
        
        // 初始化音频上下文
        this.audioContext = null;
        this.initAudio();
        
        this.elements = {
            startScreen: document.getElementById('startScreen'),
            gameContainer: document.getElementById('gameContainer'),
            level: document.getElementById('level'),
            score: document.getElementById('score'),
            progressBar: document.getElementById('progressBar'),
            question: document.getElementById('question'),
            answers: document.getElementById('answers'),
            gameOver: document.getElementById('gameOver'),
            finalScore: document.getElementById('finalScore'),
            finalLevel: document.getElementById('finalLevel'),
            restartBtn: document.getElementById('restartBtn'),
            starsContainer: document.getElementById('starsContainer'),
            exitBtn: document.getElementById('exitBtn'),
            startGameBtn: document.getElementById('startGameBtn'),
            exitStartBtn: document.getElementById('exitStartBtn'),
            soundBtn: document.getElementById('soundBtn'),
            rankBtn: document.getElementById('rankBtn'),
            dailyBtn: document.getElementById('dailyBtn')
        };
        
        this.init();
    }
    
    init() {
        // 绑定开始界面按钮
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        this.elements.exitStartBtn.addEventListener('click', () => this.exitApp());
        this.elements.soundBtn.addEventListener('click', () => this.toggleSound());
        this.elements.rankBtn.addEventListener('click', () => this.showRank());
        this.elements.dailyBtn.addEventListener('click', () => this.showDaily());
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playSound(type) {
        if(!this.soundEnabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        switch(type) {
            case 'correct':
                // 答对：上升音调
                oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                oscillator.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;
                
            case 'wrong':
                // 答错：下降音调
                oscillator.frequency.setValueAtTime(392, ctx.currentTime); // G4
                oscillator.frequency.exponentialRampToValueAtTime(196, ctx.currentTime + 0.15); // G3
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;
                
            case 'levelup':
                // 升级：快速上升音阶
                const frequencies = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
                frequencies.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
                    osc.start(ctx.currentTime + i * 0.1);
                    osc.stop(ctx.currentTime + i * 0.1 + 0.15);
                });
                break;
                
            case 'gameover':
                // 游戏结束：下降音阶
                const downFreqs = [523.25, 392, 329.63, 261.63]; // C5, G4, E4, C4
                downFreqs.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
                    osc.start(ctx.currentTime + i * 0.15);
                    osc.stop(ctx.currentTime + i * 0.15 + 0.2);
                });
                break;
                
            case 'win':
                // 通关：胜利音效
                const winFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                winFreqs.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);
                    osc.start(ctx.currentTime + i * 0.12);
                    osc.stop(ctx.currentTime + i * 0.12 + 0.3);
                });
                break;
                
            case 'click':
                // 点击音效
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.05);
                break;
        }
    }
    
    startGame() {
        this.playSound('click');
        
        this.elements.startScreen.style.display = 'none';
        this.elements.gameContainer.style.display = 'block';
        
        // 重置游戏状态
        this.level = 1;
        this.score = 0;
        this.timeLeft = 15;
        this.maxTime = 15;
        this.stars = 0;
        this.wrongCount = 0;
        this.operators = ['+'];
        this.isGameOver = false;
        this.totalCorrect = 0;
        this.totalWrong = 0;
        this.totalTime = 0;
        this.questionStartTime = 0;
        
        // 清除旧的定时器
        if(this.timer) {
            clearInterval(this.timer);
        }
        
        // 初始化游戏元素引用
        this.elements.level = document.getElementById('level');
        this.elements.score = document.getElementById('score');
        this.elements.progressBar = document.getElementById('progressBar');
        this.elements.question = document.getElementById('question');
        this.elements.answers = document.getElementById('answers');
        this.elements.gameOver = document.getElementById('gameOver');
        this.elements.starsContainer = document.getElementById('starsContainer');
        this.elements.exitBtn = document.getElementById('exitBtn');
        
        // 移除旧的事件监听器，避免重复绑定
        const newExitBtn = this.elements.exitBtn.cloneNode(true);
        this.elements.exitBtn.parentNode.replaceChild(newExitBtn, this.elements.exitBtn);
        this.elements.exitBtn = newExitBtn;
        
        this.updateUI();
        this.updateStars();
        this.updateProgressBar();
        this.generateQuestion();
        this.startTimer();
        this.elements.exitBtn.addEventListener('click', () => this.exitGame());
    }
    
    exitApp() {
        if(confirm('确定要退出应用吗？')) {
            window.close();
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.elements.soundBtn.innerHTML = this.soundEnabled ? '<span>🔊</span>' : '<span>🔇</span>';
        
        // 播放提示音
        if(this.soundEnabled) {
            this.playSound('click');
        }
    }
    
    showRank() {
        alert('排行榜功能开发中...');
    }
    
    showDaily() {
        alert('每日挑战功能开发中...');
    }
    
    exitGame() {
        if(confirm('确定要退出游戏吗？')) {
            this.endGame();
        }
    }
    
    backToStart() {
        // 清除游戏结束界面
        this.elements.gameOver.classList.remove('show');
        
        this.elements.gameContainer.style.display = 'none';
        this.elements.startScreen.style.display = 'flex';
        
        // 重置游戏状态
        this.level = 1;
        this.score = 0;
        this.timeLeft = 15;
        this.maxTime = 15;
        this.stars = 0;
        this.wrongCount = 0;
        this.operators = ['+'];
        this.isGameOver = false;
        this.totalCorrect = 0;
        this.totalWrong = 0;
        this.totalTime = 0;
        this.questionStartTime = 0;
        
        if(this.timer) {
            clearInterval(this.timer);
        }
    }
    
    generateQuestion() {
        const operator = this.operators[Math.floor(Math.random() * this.operators.length)];
        let num1, num2, correctAnswer;
        
        // 记录题目开始时间
        this.questionStartTime = Date.now();
        
        // 根据等级调整数字范围
        let maxNum;
        if(this.level <= 5) {
            maxNum = 5 + (this.level - 1) * 2; // 1-5级: 5-13
        } else if(this.level <= 10) {
            maxNum = 15 + (this.level - 6) * 3; // 6-10级: 15-27
        } else if(this.level <= 20) {
            maxNum = 30 + (this.level - 11) * 2; // 11-20级: 30-48
        } else {
            maxNum = 50 + (this.level - 21) * 3; // 21-30级: 50-77
        }
        
        switch(operator) {
            case '+':
                num1 = Math.floor(Math.random() * maxNum) + 1;
                num2 = Math.floor(Math.random() * maxNum) + 1;
                correctAnswer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * maxNum) + 2;
                num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
                correctAnswer = num1 - num2;
                break;
            case '×':
                // 乘法根据等级调整
                const multMax = Math.min(3 + Math.floor(this.level / 3), 12);
                num1 = Math.floor(Math.random() * multMax) + 1;
                num2 = Math.floor(Math.random() * multMax) + 1;
                correctAnswer = num1 * num2;
                break;
            case '÷':
                // 除法根据等级调整
                const divMax = Math.min(3 + Math.floor(this.level / 3), 12);
                num2 = Math.floor(Math.random() * divMax) + 1;
                correctAnswer = Math.floor(Math.random() * divMax) + 1;
                num1 = num2 * correctAnswer;
                break;
        }
        
        // 从等级8开始，随机隐藏算式中的任意位置
        if(this.level >= 8) {
            const hidePosition = Math.floor(Math.random() * 3);
            
            if(hidePosition === 0) {
                this.currentAnswer = num1;
                this.elements.question.textContent = `? ${operator} ${num2} = ${correctAnswer}`;
            } else if(hidePosition === 1) {
                this.currentAnswer = num2;
                this.elements.question.textContent = `${num1} ${operator} ? = ${correctAnswer}`;
            } else {
                this.currentAnswer = correctAnswer;
                this.elements.question.textContent = `${num1} ${operator} ${num2} = ?`;
            }
        } else {
            this.currentAnswer = correctAnswer;
            this.elements.question.textContent = `${num1} ${operator} ${num2} = ?`;
        }
        
        this.generateAnswers(this.currentAnswer); // 修改：传入this.currentAnswer而不是correctAnswer
    }
    
    generateAnswers(correctAnswer) {
        const answers = new Set([correctAnswer]);
        
        // 根据等级调整选项数量
        let answerCount;
        if(this.level <= 3) {
            answerCount = 2; // 1-3级: 2个选项
        } else if(this.level <= 10) {
            answerCount = 3; // 4-10级: 3个选项
        } else {
            answerCount = 4; // 11-30级: 4个选项
        }
        
        // 确保生成的错误答案不会与正确答案相同
        let attempts = 0;
        while(answers.size < answerCount && attempts < 50) {
            attempts++;
            const offset = Math.floor(Math.random() * 10) - 5;
            if(offset === 0) continue;
            
            const wrongAnswer = correctAnswer + offset;
            if(wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
                answers.add(wrongAnswer);
            }
        }
        
        // 如果还是没有足够的答案，强制添加一些
        while(answers.size < answerCount) {
            const wrongAnswer = Math.floor(Math.random() * (correctAnswer * 2 + 10)) + 1;
            if(wrongAnswer !== correctAnswer) {
                answers.add(wrongAnswer);
            }
        }
        
        const answersArray = Array.from(answers).sort(() => Math.random() - 0.5);
        
        this.elements.answers.className = 'answers';
        this.elements.answers.innerHTML = '';
        
        answersArray.forEach(answer => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = answer;
            btn.addEventListener('click', () => this.checkAnswer(answer, btn));
            this.elements.answers.appendChild(btn);
        });
    }
    
    checkAnswer(answer, btn) {
        if(this.isGameOver) return;
        
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(b => b.disabled = true);
        
        // 计算答题用时
        const timeUsed = (Date.now() - this.questionStartTime) / 1000;
        
        if(answer === this.currentAnswer) {
            btn.classList.add('correct');
            this.playSound('correct'); // 播放答对音效
            this.totalCorrect++;
            this.totalTime += timeUsed;
            this.score = this.totalCorrect; // 答对一题得1分
            this.stars++;
            this.wrongCount = 0;
            
            // 根据等级调整加时（越高等级加的越少）
            let addTime;
            if(this.level <= 10) {
                addTime = 2;
            } else if(this.level <= 20) {
                addTime = 1.5;
            } else {
                addTime = 1;
            }
            
            this.timeLeft = Math.min(this.timeLeft + addTime, this.maxTime);
            
            if(this.stars >= 5) {
                setTimeout(() => {
                    this.levelUp();
                    if(!this.isGameOver) {
                        this.generateQuestion();
                    }
                }, 500);
                this.updateUI();
                this.updateStars();
                return;
            }
        } else {
            btn.classList.add('wrong');
            this.playSound('wrong'); // 播放答错音效
            this.totalWrong++;
            this.stars = Math.max(0, this.stars - 1);
            this.wrongCount++;
            
            if(this.wrongCount >= 2) {
                this.timeLeft = 0;
                this.endGame();
                return;
            }
        }
        
        this.updateUI();
        this.updateStars();
        
        setTimeout(() => {
            if(this.timeLeft > 0 && !this.isGameOver) {
                this.generateQuestion();
            }
        }, 500);
    }
    
    levelUp() {
        this.level++;
        
        this.playSound('levelup'); // 播放升级音效
        
        // 检查是否通关
        if(this.level > this.maxLevel) {
            this.winGame();
            return;
        }
        
        this.stars = 0;
        this.wrongCount = 0;
        
        // 根据等级调整最大时间（逐渐减少）
        if(this.level <= 5) {
            this.maxTime = 15;
        } else if(this.level <= 10) {
            this.maxTime = 14;
        } else if(this.level <= 15) {
            this.maxTime = 13;
        } else if(this.level <= 20) {
            this.maxTime = 12;
        } else if(this.level <= 25) {
            this.maxTime = 11;
        } else {
            this.maxTime = 10;
        }
        
        this.timeLeft = this.maxTime;
        
        // 运算符解锁
        if(this.level === 3 && !this.operators.includes('-')) {
            this.operators.push('-');
        } else if(this.level === 6 && !this.operators.includes('×')) {
            this.operators.push('×');
        } else if(this.level === 10 && !this.operators.includes('÷')) {
            this.operators.push('÷');
        }
        
        // 升级后立即生成新题目
        this.updateUI();
        this.updateStars();
        this.updateProgressBar();
    }
    
    winGame() {
        this.isGameOver = true;
        clearInterval(this.timer);
        
        this.playSound('win'); // 播放通关音效
        
        // 计算统计数据
        const totalQuestions = this.totalCorrect + this.totalWrong;
        const accuracy = totalQuestions > 0 ? ((this.totalCorrect / totalQuestions) * 100).toFixed(1) : 0;
        const avgTime = this.totalCorrect > 0 ? (this.totalTime / this.totalCorrect).toFixed(2) : 0;
        
        this.elements.gameOver.innerHTML = `
            <h2>🎉 恭喜通关！🎉</h2>
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-label">最终得分</div>
                    <div class="stat-value">${this.score}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">完成等级</div>
                    <div class="stat-value">30关全通</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">正确率</div>
                    <div class="stat-value">${accuracy}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">平均答题时间</div>
                    <div class="stat-value">${avgTime}秒</div>
                </div>
                <div class="stat-detail">
                    <span>答对: ${this.totalCorrect}题</span>
                    <span>答错: ${this.totalWrong}题</span>
                </div>
            </div>
            <button id="restartBtn" class="restart-game-btn">再玩一次</button>
            <button id="backToStartBtn" class="back-to-start-btn">返回主菜单</button>
        `;
        this.elements.gameOver.classList.add('show');
        
        // 重新绑定按钮事件
        setTimeout(() => {
            document.getElementById('restartBtn').addEventListener('click', () => this.restart());
            document.getElementById('backToStartBtn').addEventListener('click', () => this.backToStart());
        }, 100);
    }
    
    updateStars() {
        const starElements = this.elements.starsContainer.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            if(index < this.stars) {
                star.textContent = '★';
                star.classList.add('filled');
            } else {
                star.textContent = '☆';
                star.classList.remove('filled');
            }
        });
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if(this.isGameOver) return;
            
            this.timeLeft -= 0.1; // 每0.1秒减少0.1
            
            if(this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.endGame();
            }
            
            this.updateProgressBar();
        }, 100);
    }
    
    updateProgressBar() {
        const percentage = (this.timeLeft / this.maxTime) * 100;
        this.elements.progressBar.style.width = percentage + '%';
    }
    
    updateUI() {
        this.elements.level.textContent = this.level;
        this.elements.score.textContent = this.score;
    }
    
    endGame() {
        this.isGameOver = true;
        if(this.timer) {
            clearInterval(this.timer);
        }
        
        this.playSound('gameover'); // 播放游戏结束音效
        
        // 计算统计数据
        const totalQuestions = this.totalCorrect + this.totalWrong;
        const accuracy = totalQuestions > 0 ? ((this.totalCorrect / totalQuestions) * 100).toFixed(1) : 0;
        const avgTime = this.totalCorrect > 0 ? (this.totalTime / this.totalCorrect).toFixed(2) : 0;
        
        this.elements.gameOver.innerHTML = `
            <h2>游戏结束</h2>
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-label">最终得分</div>
                    <div class="stat-value">${this.score}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">达到等级</div>
                    <div class="stat-value">Level ${this.level}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">正确率</div>
                    <div class="stat-value">${accuracy}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">平均答题时间</div>
                    <div class="stat-value">${avgTime}秒</div>
                </div>
                <div class="stat-detail">
                    <span>答对: ${this.totalCorrect}题</span>
                    <span>答错: ${this.totalWrong}题</span>
                </div>
            </div>
            <button id="restartBtn" class="restart-game-btn">再来一局</button>
            <button id="backToStartBtn" class="back-to-start-btn">返回主菜单</button>
        `;
        this.elements.gameOver.classList.add('show');
        
        // 重新绑定按钮事件
        setTimeout(() => {
            document.getElementById('restartBtn').addEventListener('click', () => this.restart());
            document.getElementById('backToStartBtn').addEventListener('click', () => this.backToStart());
        }, 100);
    }
    
    restart() {
        this.level = 1;
        this.score = 0;
        this.timeLeft = 15;
        this.maxTime = 15;
        this.stars = 0;
        this.wrongCount = 0;
        this.operators = ['+'];
        this.isGameOver = false;
        
        // 重置统计数据
        this.totalCorrect = 0;
        this.totalWrong = 0;
        this.totalTime = 0;
        this.questionStartTime = 0;
        
        // 清除旧的定时器
        if(this.timer) {
            clearInterval(this.timer);
        }
        
        this.elements.gameOver.classList.remove('show');
        this.updateUI();
        this.updateStars();
        this.updateProgressBar();
        this.generateQuestion();
        this.startTimer();
    }

}

// 启动游戏
new MathGame();
