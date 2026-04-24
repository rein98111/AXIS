/** 
 * AXIS - Core Game Engine (Hold Note Fixed & Improved)
 * 整合音量控制功能版本
 */
const songFolders = ["tuto", "track1",]; 
let songList = [], currentIndex = 0;
let isTransitioning = false, gameStarted = false, isResultScreen = false;
let isPaused = false, pauseStartTime = 0;
let pauseIndex = 0; 

let previewAudio = new Audio(); previewAudio.loop = true;
let gameAudio = new Audio();
let hitSound = new Audio('assets/hitsound.wav'); // 確保路徑與你的音效檔名一致

let score = 0, combo = 0, maxCombo = 0, accuracy = 100.0;
let notes = [], canvas, ctx, animationId, gameStartTime = 0, endTime = 0;
let totalJudgeCount = 0, currentAccScore = 0;
// 在 script.js 開頭加入
let counts = { great: 0, good: 0, ok: 0, miss: 0 };

// 追蹤目前正在按下的按鍵對應的軌道與音符
let activeHoldNotes = {}; // { laneIndex: noteObject }
let pressedKeys = new Set(); // 記錄目前被按住的按鍵

const angles = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => deg * Math.PI / 180);

// 修改後的 init 函數，加入了 setupVolumeControl
async function init() {
    await loadSongs();
    setupVolumeControl(); // 初始化音量控制邏輯
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
}

function loadSongs() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        songFolders.forEach(folder => {
            const script = document.createElement('script');
            script.src = `maps/${folder}/map.js`;
            script.onload = () => {
                if (window.currentTrack) {
                    songList.push(JSON.parse(JSON.stringify(window.currentTrack)));
                    window.currentTrack = null;
                }
                if (++loadedCount === songFolders.length) resolve();
            };
            document.head.appendChild(script);
        });
    });
}

function initGame() {
    if (gameStarted) return;
    gameStarted = true;
    const overlay = document.getElementById('start-overlay');
    const container = document.querySelector('.selection-container');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.visibility = 'hidden';
        container.style.display = 'flex';
        requestAnimationFrame(() => { container.style.opacity = '1'; });
        updateUI();
    }, 600);
}

function updateUI() {
    if (!gameStarted || songList.length === 0) return;
    const song = songList[currentIndex].info;
    document.getElementById('song-title').innerText = song.title;
    document.getElementById('song-artist').innerText = song.artist;
    const creatorElem = document.getElementById('song-creator');
    if (creatorElem) creatorElem.innerText = song.creator ? `CREATOR: ${song.creator}` : "";
    document.getElementById('level-num').innerText = song.level;
    document.getElementById('cover-art').style.backgroundImage = `url(${song.cover})`;
    previewAudio.src = song.preview;
    previewAudio.play().catch(e => {});
}

function nextSong() { currentIndex = (currentIndex + 1) % songList.length; updateUI(); }
function prevSong() { currentIndex = (currentIndex - 1 + songList.length) % songList.length; updateUI(); }

function startGame() {
    if (isTransitioning) return;
    isTransitioning = true;
    previewAudio.pause();
    document.querySelector('.song-card').style.animation = 'flash 0.05s infinite';
    setTimeout(() => {
        document.querySelector('.selection-container').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        setupCanvas();
        beginMatch();
    }, 500);
}

function setupCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function beginMatch() {
    const song = songList[currentIndex];
    
    // --- 新增：動態設定遊戲背景圖片與 75% 暗度 ---
    const gameArea = document.getElementById('game-area');
    if (gameArea && song.info.cover) {
        // 使用多重背景：黑色半透明遮罩層 + 封面圖層
        gameArea.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('${song.info.cover}')`;
    }
    // ------------------------------------------

    score = 0; combo = 0; maxCombo = 0; accuracy = 100.0;
    totalJudgeCount = 0; currentAccScore = 0;
    isResultScreen = false; isPaused = false; isTransitioning = false;
    activeHoldNotes = {}; 
    pressedKeys.clear();
    
    updateStatsUI();
    const bar = document.querySelector('.judgment-bar');
    if (bar) bar.innerHTML = '<div class="judge-line center"></div>';

    gameAudio.pause();
    if (song.info.audio) {
        gameAudio.src = song.info.audio;
        gameAudio.currentTime = 0;
        gameAudio.play().catch(e => {});
    }
    
    const endNode = song.notes.find(n => n.type === "end" || n.end);
    endTime = endNode ? (endNode.time < 100 ? endNode.time * 1000 : endNode.time) : 999999;

    notes = song.notes.filter(n => n.angle !== undefined || n.message !== undefined).map(n => {
        const isNote = n.angle !== undefined; 
        
        return {
            ...n,
            time: n.time < 100 ? n.time * 1000 : n.time,
            endTime: n.endTime ? (n.endTime < 100 ? n.endTime * 1000 : n.endTime) : null,
            lane: isNote ? Math.floor(n.angle / 45) : null,
            active: isNote, 
            speed: song.info.scrollSpeed || 0.0008,
            headHit: false
        };
    });
    
    gameStartTime = performance.now();
    gameLoop();
}

function gameLoop() {
    if (isPaused || isResultScreen) return;
    const currentTime = performance.now() - gameStartTime;
    
    if (currentTime > endTime) {
        cancelAnimationFrame(animationId);
        showResultScreen();
        return; 
    }

    const msgElem = document.getElementById('storyboard-text');
    if (msgElem) {
        const activeNote = notes.find(n => 
            n.message && 
            currentTime >= (n.time - 500) && 
            currentTime <= (n.time + 1500)
        );

        if (activeNote) {
            msgElem.innerText = activeNote.message;
            msgElem.style.opacity = '1';
        } else {
            msgElem.style.opacity = '0';
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2, centerY = canvas.height / 2, hitRadius = 40;
    const spawnRadius = Math.max(canvas.width, canvas.height) * 0.7;

    ctx.beginPath(); ctx.arc(centerX, centerY, hitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#00f2ff'; ctx.lineWidth = 4; ctx.stroke();

    notes.forEach(note => {
        if (!note.active) return;
        const progress = 1 - ((note.time - currentTime) * note.speed);
        
        if (note.type === "hold" && note.endTime) {
            const endProgress = 1 - ((note.endTime - currentTime) * note.speed);
            if (endProgress >= 0 && progress <= 1.5) {
                const dStart = spawnRadius * Math.max(0, 1 - progress);
                const dEnd = spawnRadius * Math.max(0, 1 - endProgress);
                const xS = centerX + Math.cos(angles[note.lane]) * dStart;
                const yS = centerY + Math.sin(angles[note.lane]) * dStart;
                const xE = centerX + Math.cos(angles[note.lane]) * dEnd;
                const yE = centerY + Math.sin(angles[note.lane]) * dEnd;

                ctx.beginPath();
                ctx.moveTo(xS, yS); ctx.lineTo(xE, yE);
                ctx.lineWidth = hitRadius * 0.8;
                ctx.strokeStyle = activeHoldNotes[note.lane] === note ? 'rgba(0, 255, 255, 0.8)' : 'rgba(0, 242, 255, 0.3)';
                ctx.lineCap = "round"; ctx.stroke();
            }

            if (progress > 1.15 && !note.headHit) {
                note.active = false; processJudge(0); combo = 0; updateStatsUI();
            }
            if (endProgress > 1.15) {
                if (activeHoldNotes[note.lane] === note) {
                    delete activeHoldNotes[note.lane];
                    processJudge(40);
                }
                note.active = false;
            }
        } else {
            if (progress >= 0 && progress <= 1.2) {
                const d = spawnRadius * (1 - progress);
                const x = centerX + Math.cos(angles[note.lane]) * d;
                const y = centerY + Math.sin(angles[note.lane]) * d;
                ctx.beginPath(); ctx.arc(x, y, hitRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'white'; ctx.fill();
            }
            if (progress > 1.15) { note.active = false; processJudge(0); combo = 0; updateStatsUI(); }
        }
    });
    animationId = requestAnimationFrame(gameLoop);
}

// 修改後的判定處理函數
function processJudge(weight) {
    totalJudgeCount++; 
    currentAccScore += weight;

    // --- 新增：累加 counts 判定次數 ---
    if (weight === 100) {
        counts.great++;
    } else if (weight === 70) {
        counts.good++;
    } else if (weight === 40) {
        counts.ok++;
    } else if (weight === 0) {
        counts.miss++;
    }
    // ----------------------------

    accuracy = (currentAccScore / (totalJudgeCount * 100)) * 100;
    if (combo > maxCombo) maxCombo = combo;
    updateStatsUI();
}

function playHitSound() {
    const sound = hitSound.cloneNode(); // 複製節點，避免聲音重疊時失效
    sound.volume = hitSound.volume;
    sound.play();
}

function updateStatsUI() {
    document.getElementById('score').innerText = score.toString().padStart(7, '0');
    document.getElementById('combo-num').innerText = combo;
    document.getElementById('accuracy').innerText = accuracy.toFixed(2) + "%";
}

function showHitError(diff) {
    const bar = document.querySelector('.judgment-bar');
    if(!bar) return;
    const indicator = document.createElement('div');
    indicator.className = 'hit-indicator';
    indicator.style.left = `${50 + (diff / 300) * 100}%`;
    indicator.style.background = Math.abs(diff) <= 45 ? '#00f2ff' : (Math.abs(diff) <= 90 ? '#ff0' : '#f08');
    bar.appendChild(indicator);
    setTimeout(() => { indicator.style.opacity = '0'; setTimeout(() => indicator.remove(), 800); }, 100);
}

function checkHit() {
    if (isPaused || isResultScreen) return;
    const currentTime = performance.now() - gameStartTime;
    const hitNote = notes.find(n => n.active && !n.headHit && Math.abs(n.time - currentTime) < 150);
    
    if (hitNote) {
		playHitSound(); // <--- 在這裡加入觸發
        const diff = currentTime - hitNote.time;
        const absDiff = Math.abs(diff);
        let w = absDiff <= 45 ? 100 : (absDiff <= 90 ? 70 : 40);
        
        if (hitNote.type === "hold") {
            hitNote.headHit = true;
            activeHoldNotes[hitNote.lane] = hitNote;
            score += Math.floor((500000 / notes.length) * (w / 100));
        } else {
            hitNote.active = false;
            score += Math.floor((1000000 / notes.length) * (w / 100));
        }
        combo++; processJudge(w); showHitError(diff);
    }
}

function handleKeyup(e) {
    pressedKeys.delete(e.key);
    if (!gameStarted || isPaused || isResultScreen) return;
    
    for (let lane in activeHoldNotes) {
        const note = activeHoldNotes[lane];
        const currentTime = performance.now() - gameStartTime;
        const diff = currentTime - note.endTime;
        const absDiff = Math.abs(diff);

        if (absDiff < 150) {
			playHitSound(); // <--- 長條尾部判定成功也加一個音效
            let w = absDiff <= 50 ? 100 : 70;
            score += Math.floor((500000 / notes.length) * (w / 100));
            processJudge(w);
            showHitError(diff);
        } else {
            processJudge(0);
            combo = 0;
            updateStatsUI();
        }
        note.active = false;
        delete activeHoldNotes[lane];
    }
}

function showResultScreen() {
    isResultScreen = true; 
    gameAudio.pause();
    
    // 隱藏遊戲畫面，顯示結算畫面
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('result-screen').style.display = 'flex';

    // --- 填入數據：確保在 resetStats 之前執行 ---
    // 左側：判定統計 (對應你 HTML 中的 ID)
    document.getElementById('res-great').innerText = counts.great;
    document.getElementById('res-good').innerText = counts.good;
    document.getElementById('res-ok').innerText = counts.ok;
    document.getElementById('res-miss').innerText = counts.miss;
    
    // 右側：主要總結
    document.getElementById('res-combo').innerText = maxCombo;
    document.getElementById('res-accuracy').innerText = accuracy.toFixed(2) + "%";
    document.getElementById('res-score').innerText = score.toString().padStart(7, '0');

    // 數據填寫完畢後，可以呼叫 resetStats 來清理變數
    resetStats();
}

function resetStats() {
    score = 0; 
    combo = 0; 
    maxCombo = 0; 
    accuracy = 100.0;
    totalJudgeCount = 0; 
    currentAccScore = 0;
    // 重置判定計數器
    counts = { great: 0, good: 0, ok: 0, miss: 0 };
    
    // 更新遊戲內的 UI，讓下次開始時畫面是乾淨的
    updateStatsUI();
}

function returnToSelection() {
    isResultScreen = false; 
    isTransitioning = false; 
    isPaused = false;
    
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('game-area').style.display = 'none';
    
    const songCard = document.querySelector('.song-card');
    if (songCard) {
        songCard.style.animation = ''; 
    }

    const selectionContainer = document.querySelector('.selection-container');
    selectionContainer.style.display = 'flex';
    requestAnimationFrame(() => { 
        selectionContainer.style.opacity = '1'; 
    });
    
    updateUI(); 
}

function pauseGame() {
    if (isResultScreen || isPaused) return;
    isPaused = true; gameAudio.pause(); cancelAnimationFrame(animationId);
    document.getElementById('pause-screen').style.display = 'flex';
    pauseStartTime = performance.now(); pauseIndex = 0; updatePauseUI();
}

function resumeGame() {
    isPaused = false; document.getElementById('pause-screen').style.display = 'none';
    const pauseDuration = performance.now() - pauseStartTime;
    gameStartTime += pauseDuration;
    gameAudio.play(); gameLoop();
}

function retryGame() {
    isPaused = false; document.getElementById('pause-screen').style.display = 'none';
    cancelAnimationFrame(animationId); beginMatch();
}

function endGame() {
    isPaused = false; document.getElementById('pause-screen').style.display = 'none';
    cancelAnimationFrame(animationId); gameAudio.pause(); returnToSelection();
}

function updatePauseUI() {
    const btns = document.querySelectorAll('.pause-btn');
    btns.forEach((btn, idx) => {
        if (idx === pauseIndex) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function handleKeydown(e) {
    if (e.repeat) return; 
    pressedKeys.add(e.key);

    if (isResultScreen) { if (e.key === "Enter") returnToSelection(); return; }
    if (isPaused) {
        if (e.key === "ArrowUp") { pauseIndex = (pauseIndex - 1 + 3) % 3; updatePauseUI(); }
        else if (e.key === "ArrowDown") { pauseIndex = (pauseIndex + 1) % 3; updatePauseUI(); }
        else if (e.key === "Enter") {
            if (pauseIndex === 0) resumeGame();
            else if (pauseIndex === 1) retryGame();
            else if (pauseIndex === 2) endGame();
        } else if (e.key === "Escape") resumeGame();
        return;
    }
    const isGaming = document.getElementById('game-area').style.display === 'block';
    if (gameStarted && isGaming) {
        if (e.key === "Escape") { pauseGame(); return; }
        checkHit();
    }
    if (!gameStarted && (e.key === "Enter" || e.key === " ")) { initGame(); return; }
    if (!isGaming && gameStarted) {
        if (e.key === "ArrowLeft") prevSong();
        if (e.key === "ArrowRight") nextSong();
        if (e.key === "Enter") startGame();
    }
}

function setupVolumeControl() {
    const volumeRange = document.getElementById('volume-range');
    const volumeIcon = document.querySelector('.volume-icon');
    
    if (volumeRange) {
        const initialVol = volumeRange.value;
        previewAudio.volume = initialVol;
        gameAudio.volume = initialVol;
		hitSound.volume = initialVol;

        volumeRange.addEventListener('input', (e) => {
            const val = e.target.value;
            previewAudio.volume = val;
            gameAudio.volume = val;
			hitSound.volume = val; // <--- 新增這行：拉動時同步音量
            
            if (parseFloat(val) === 0) {
                volumeIcon.innerText = '🔇';
            } else if (parseFloat(val) < 0.5) {
                volumeIcon.innerText = '🔉';
            } else {
                volumeIcon.innerText = '🔊';
            }
        });

        volumeRange.addEventListener('keydown', (e) => {
            e.stopPropagation();
        });
    }
}

init();
