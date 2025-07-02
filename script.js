 let players = [];
let currentPlayerIndex = 0;
let gameBoard = [];
let gameState = 'setup';
let playerCount = 0;
let backgroundMusic;
let isAnimating = false;
let boardSize = 600;
let cellSize = 60;

const ladders = {
    2: 38,
    7: 14,
    8: 31,
    15: 26,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    78: 98,
    87: 94
};

const snakes = {
    16: 6,
    46: 25,
    49: 11,
    62: 19,
    64: 60,
    74: 53,
    89: 68,
    92: 88,
    95: 75,
    99: 80
};

function initGame() {
    backgroundMusic = document.getElementById('backgroundMusic');
    updateBoardSize();
    createBoard();
    checkBoardImage();
    window.addEventListener('resize', handleResize);
}

function updateBoardSize() {
    const screenWidth = window.innerWidth;
    const board = document.getElementById('gameBoard');
    
    if (screenWidth <= 375) {
        boardSize = 280;
        cellSize = 28;
    } else if (screenWidth <= 575) {
        boardSize = 300;
        cellSize = 30;
    } else if (screenWidth <= 767) {
        boardSize = Math.min(400, screenWidth - 40);
        cellSize = boardSize / 10;
    } else if (screenWidth <= 991) {
        boardSize = 500;
        cellSize = 50;
    } else {
        boardSize = 600;
        cellSize = 60;
    }
    
    if (board) {
        board.style.width = boardSize + 'px';
        board.style.height = boardSize + 'px';
    }
}

function handleResize() {
    const oldBoardSize = boardSize;
    updateBoardSize();
    
    if (oldBoardSize !== boardSize && gameState === 'playing') {
        createBoard();
        placePlayers();
    }
}

function checkBoardImage() {
    const board = document.getElementById('gameBoard');
    const img = new Image();
    
    img.onload = function() {
        console.log('Board image loaded successfully');
    };
    
    img.onerror = function() {
        console.log('Board image not found, using fallback');
        board.classList.add('error');
        createBoardGrid();
    };
    
    img.src = 'board.png';
}

function createBoardGrid() {
    const board = document.getElementById('gameBoard');
    const colors = ['#ffebee', '#e3f2fd', '#e8f5e8', '#fff3e0', '#f3e5f5', '#fce4ec', '#e0f2f1', '#e1f5fe', '#f9fbe7', '#fff8e1'];
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            let cellNumber;
            if (row % 2 === 0) {
                cellNumber = (9 - row) * 10 + col + 1;
            } else {
                cellNumber = (9 - row) * 10 + (9 - col) + 1;
            }
            
            const gridCell = document.createElement('div');
            gridCell.style.position = 'absolute';
            gridCell.style.left = `${col * cellSize}px`;
            gridCell.style.top = `${row * cellSize}px`;
            gridCell.style.width = cellSize + 'px';
            gridCell.style.height = cellSize + 'px';
            gridCell.style.border = '1px solid #dee2e6';
            gridCell.style.backgroundColor = colors[cellNumber % colors.length];
            gridCell.style.display = 'flex';
            gridCell.style.alignItems = 'center';
            gridCell.style.justifyContent = 'center';
            gridCell.style.fontSize = Math.max(8, cellSize * 0.2) + 'px';
            gridCell.style.fontWeight = 'bold';
            gridCell.style.color = '#343a40';
            gridCell.textContent = cellNumber;
            
            if (snakes[cellNumber]) {
                gridCell.innerHTML += '<br>🐍';
                gridCell.style.backgroundColor = '#ffcccb';
                gridCell.title = `Ular: ${cellNumber} → ${snakes[cellNumber]}`;
            }
            
            if (ladders[cellNumber]) {
                gridCell.innerHTML += '<br>🪜';
                gridCell.style.backgroundColor = '#90ee90';
                gridCell.title = `Tangga: ${cellNumber} → ${ladders[cellNumber]}`;
            }
            
            board.appendChild(gridCell);
        }
    }
}

function toggleSettings() {
    const menu = document.getElementById('settingsMenu');
    menu.classList.toggle('hidden');
}

function setupGame(count) {
    playerCount = count;
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('playerSetup').classList.remove('hidden');
    
    const container = document.getElementById('playerSetupContainer');
    container.innerHTML = '';
    
    players = [];
    
    for (let i = 0; i < count; i++) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-setup';
        playerDiv.innerHTML = `
            <h4><i class="bi bi-person-circle"></i> Pemain ${i + 1}</h4>
            <input type="file" accept="image/*" onchange="loadPlayerImage(${i}, this)" class="form-control mb-2">
            <img id="player${i}Preview" class="player-avatar hidden" src="" alt="Player ${i + 1}">
        `;
        container.appendChild(playerDiv);
    }
}

function loadPlayerImage(playerIndex, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(`player${playerIndex}Preview`);
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            
            if (!players[playerIndex]) {
                players[playerIndex] = {};
            }
            players[playerIndex].avatar = e.target.result;
            players[playerIndex].position = 0;
            players[playerIndex].name = `Pemain ${playerIndex + 1}`;
            
            checkAllPlayersReady();
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function checkAllPlayersReady() {
    let readyCount = 0;
    for (let i = 0; i < playerCount; i++) {
        if (players[i] && players[i].avatar) {
            readyCount++;
        }
    }
    
    if (readyCount === playerCount) {
        document.getElementById('startGameBtn').classList.remove('hidden');
    }
}

function startGame() {
    document.getElementById('playerSetup').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    gameState = 'playing';
    currentPlayerIndex = 0;
    
    updateBoardSize();
    playBackgroundMusic();
    createPlayersInfo();
    placePlayers();
    updateCurrentPlayer();
}

function playBackgroundMusic() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle.checked && backgroundMusic) {
        backgroundMusic.play().catch(e => console.log('Audio play failed'));
    }
}

function createBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    for (let i = 1; i <= 100; i++) {
        const position = getPositionCoordinates(i);
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${i}`;
        cell.style.left = `${position.x - cellSize/4}px`;
        cell.style.top = `${position.y - cellSize/4}px`;
        cell.style.width = cellSize/2 + 'px';
        cell.style.height = cellSize/2 + 'px';
        cell.style.fontSize = Math.max(8, cellSize * 0.2) + 'px';
        cell.textContent = i;
        
        if (snakes[i]) {
            cell.title = `Ular: Turun ke ${snakes[i]}`;
        } else if (ladders[i]) {
            cell.title = `Tangga: Naik ke ${ladders[i]}`;
        }
        
        board.appendChild(cell);
    }
}

function createPlayersInfo() {
    const info = document.getElementById('playersInfo');
    info.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-info';
        playerDiv.id = `player-info-${index}`;
        playerDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${player.avatar}" class="player-avatar me-3" alt="${player.name}">
                <div>
                    <h5><i class="bi bi-person-fill"></i> ${player.name}</h5>
                    <p class="mb-0"><i class="bi bi-geo-alt"></i> Posisi: <span id="player-pos-${index}">0</span></p>
                    <p class="mb-0"><i class="bi bi-star-fill"></i> Poin: <span id="player-score-${index}">0</span></p>
                </div>
            </div>
        `;
        info.appendChild(playerDiv);
    });
}

function placePlayers() {

    document.querySelectorAll('.player-piece').forEach(piece => piece.remove());
    
    const pieceSize = Math.max(20, cellSize * 0.4);
    
    players.forEach((player, index) => {
        const piece = document.createElement('div');
        piece.className = 'player-piece';
        piece.id = `piece-${index}`;
        piece.style.backgroundImage = `url(${player.avatar})`;
        piece.style.backgroundSize = 'cover';
        piece.style.backgroundPosition = 'center';
        piece.style.width = pieceSize + 'px';
        piece.style.height = pieceSize + 'px';
        piece.style.borderRadius = '50%';
        piece.style.border = '2px solid #fff';
        piece.style.position = 'absolute';
        piece.style.zIndex = '10';
        piece.style.transition = 'all 0.5s ease';
        piece.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        
        if (!player.score) {
            player.score = 0;
        }
        
        const position = getPositionCoordinates(player.position);
        
        const offsetDistance = Math.max(3, cellSize * 0.08);
        const angle = (index * 2 * Math.PI) / players.length; 
        const offsetX = Math.cos(angle) * offsetDistance;
        const offsetY = Math.sin(angle) * offsetDistance;
        
        piece.style.left = `${position.x + offsetX - pieceSize/2}px`;
        piece.style.top = `${position.y + offsetY - pieceSize/2}px`;
        
        document.getElementById('gameBoard').appendChild(piece);
    });
}

function getPositionCoordinates(position) {
    if (position === 0) {
        return { 
            x: cellSize / 2, 
            y: boardSize - cellSize / 2 
        };
    }
    
    const row = Math.floor((position - 1) / 10);
    let col = (position - 1) % 10;
    
    if (row % 2 === 1) {
        col = 9 - col;
    }
    

    return {
        x: col * cellSize + cellSize / 2,
        y: (9 - row) * cellSize + cellSize / 2
    };
}

function rollDice() {
    if (gameState !== 'playing' || isAnimating) return;
    
    const dice = document.getElementById('dice');
    const rollButton = document.getElementById('rollBtn');
    
    dice.classList.add('rolling');
    rollButton.disabled = true;
    
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        dice.textContent = Math.floor(Math.random() * 6) + 1;
        rollCount++;
        
        if (rollCount >= 10) {
            clearInterval(rollInterval);
            const finalRoll = Math.floor(Math.random() * 6) + 1;
            dice.textContent = finalRoll;
            dice.classList.remove('rolling');
            
            setTimeout(() => {
                movePlayer(currentPlayerIndex, finalRoll);
            }, 500);
        }
    }, 100);
}

async function movePlayer(playerIndex, steps) {
    if (isAnimating) return;
    
    isAnimating = true;
    const player = players[playerIndex];
    const startPosition = player.position;
    let currentPos = startPosition;
    
    if (startPosition + steps > 100) {
        showMessage(`${player.name} butuh angka ${100 - startPosition} untuk menang!`);
        isAnimating = false;
        document.getElementById('rollBtn').disabled = false;
        nextPlayer();
        return;
    }
    
    for (let i = 1; i <= steps; i++) {
        currentPos = startPosition + i;
        await animatePlayerStep(playerIndex, currentPos);
        
        document.getElementById(`player-pos-${playerIndex}`).textContent = currentPos;
        
        await delay(300);
    }
    
    player.position = currentPos;
    let finalPosition = currentPos;
    let bonusPoints = 0;
    

    if (snakes[currentPos]) {
        const snakeEnd = snakes[currentPos];
        showMessage(`${player.name} terkena ular! 🐍 Turun dari ${currentPos} ke ${snakeEnd}`);
        
        await animateSnakeEffect(playerIndex);
        
        await animatePlayerStep(playerIndex, snakeEnd);
        player.position = snakeEnd;
        finalPosition = snakeEnd;
        
        bonusPoints = -10;
        await animateScoreChange(playerIndex, bonusPoints, 'ular');
    }

    else if (ladders[currentPos]) {
        const ladderEnd = ladders[currentPos];
        showMessage(`${player.name} naik tangga! 🪜 Naik dari ${currentPos} ke ${ladderEnd}`);
        
        await animateLadderEffect(playerIndex);
        
        await animatePlayerStep(playerIndex, ladderEnd);
        player.position = ladderEnd;
        finalPosition = ladderEnd;
        
        bonusPoints = 20;
        await animateScoreChange(playerIndex, bonusPoints, 'tangga');
    }
    
    document.getElementById(`player-pos-${playerIndex}`).textContent = finalPosition;
    

    if (finalPosition === 100) {
        bonusPoints += 100;
        await animateScoreChange(playerIndex, bonusPoints, 'menang');
        
        setTimeout(() => {
            showWinner(player);
        }, 1000);
        return;
    }
    
    isAnimating = false;
    document.getElementById('rollBtn').disabled = false;
    nextPlayer();
}

function animatePlayerStep(playerIndex, position) {
    return new Promise(resolve => {
        const piece = document.getElementById(`piece-${playerIndex}`);
        const targetPos = getPositionCoordinates(position);
        
        const offsetDistance = Math.max(3, cellSize * 0.08);
        const angle = (playerIndex * 2 * Math.PI) / players.length;
        const offsetX = Math.cos(angle) * offsetDistance;
        const offsetY = Math.sin(angle) * offsetDistance;
        
        const pieceSize = Math.max(20, cellSize * 0.4);
        

        piece.style.transform = 'scale(1.2)';
        piece.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            piece.style.left = `${targetPos.x + offsetX - pieceSize/2}px`;
            piece.style.top = `${targetPos.y + offsetY - pieceSize/2}px`;
            piece.style.transform = 'scale(1)';
            
            setTimeout(resolve, 300);
        }, 100);
    });
}

function animateSnakeEffect(playerIndex) {
    return new Promise(resolve => {
        const piece = document.getElementById(`piece-${playerIndex}`);
        
        piece.style.animation = 'shake 0.5s ease-in-out 3';
        piece.style.filter = 'hue-rotate(120deg)';
        
        if (!document.querySelector('#shake-keyframe')) {
            const style = document.createElement('style');
            style.id = 'shake-keyframe';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0) scale(1); }
                    25% { transform: translateX(-5px) scale(0.9); }
                    75% { transform: translateX(5px) scale(0.9); }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            piece.style.animation = '';
            piece.style.filter = '';
            resolve();
        }, 1500);
    });
}

function animateLadderEffect(playerIndex) {
    return new Promise(resolve => {
        const piece = document.getElementById(`piece-${playerIndex}`);
        
        piece.style.animation = 'climb 0.5s ease-in-out 2';
        piece.style.filter = 'brightness(1.3)';
        
        if (!document.querySelector('#climb-keyframe')) {
            const style = document.createElement('style');
            style.id = 'climb-keyframe';
            style.textContent = `
                @keyframes climb {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-10px) scale(1.1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            piece.style.animation = '';
            piece.style.filter = '';
            resolve();
        }, 1000);
    });
}

function animateScoreChange(playerIndex, points, type) {
    return new Promise(resolve => {
        const player = players[playerIndex];
        const oldScore = player.score || 0;
        const newScore = Math.max(0, oldScore + points);
        
        player.score = newScore;
        
        const scoreElement = document.createElement('div');
        scoreElement.style.position = 'fixed';
        scoreElement.style.top = '50%';
        scoreElement.style.left = '50%';
        scoreElement.style.transform = 'translate(-50%, -50%)';
        scoreElement.style.fontSize = Math.min(48, window.innerWidth * 0.1) + 'px';
        scoreElement.style.fontWeight = 'bold';
        scoreElement.style.zIndex = '1000';
        scoreElement.style.pointerEvents = 'none';
        scoreElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        
        if (points > 0) {
            scoreElement.textContent = `+${points}`;
            scoreElement.style.color = '#28a745';
            if (type === 'tangga') {
                scoreElement.innerHTML = `🪜 +${points}`;
            } else if (type === 'menang') {
                scoreElement.innerHTML = `🏆 +${points}`;
            }
        } else {
            scoreElement.textContent = points;
            scoreElement.style.color = '#dc3545';
            if (type === 'ular') {
                scoreElement.innerHTML = `🐍 ${points}`;
            }
        }
        
        scoreElement.style.opacity = '0';
        scoreElement.style.transition = 'all 1s ease-out';
        document.body.appendChild(scoreElement);
        
        setTimeout(() => {
            scoreElement.style.opacity = '1';
            scoreElement.style.transform = 'translate(-50%, -150%)';
        }, 100);
        
        animateCounter(
            document.getElementById(`player-score-${playerIndex}`),
            oldScore,
            newScore,
            1000
        );
        
        setTimeout(() => {
            document.body.removeChild(scoreElement);
            resolve();
        }, 2000);
    });
}

function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(start + (end - start) * progress);
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
}

function showMessage(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = '#17a2b8';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '25px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    notification.style.fontSize = Math.min(16, window.innerWidth * 0.04) + 'px';
    notification.style.fontWeight = 'bold';
    notification.style.maxWidth = '90%';
    notification.style.textAlign = 'center';
    notification.textContent = message;
    
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(-50%) translateY(-20px)';
    notification.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateCurrentPlayer() {
    document.querySelectorAll('.player-info').forEach((info, index) => {
        if (index === currentPlayerIndex) {
            info.classList.add('current-player');
        } else {
            info.classList.remove('current-player');
        }
    });
}

function showWinner(player) {
    gameState = 'finished';
    document.getElementById('winnerName').innerHTML = `
        <img src="${player.avatar}" class="player-avatar me-3" alt="${player.name}">
        ${player.name} Menang!<br>
        <small>Total Poin: ${player.score}</small>
    `;
    document.getElementById('winnerPopup').classList.remove('hidden');
    
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
    
    createFireworks();
}

function createFireworks() {
    const colors = ['#ff6b35', '#f7931e', '#ffd700', '#4ecdc4', '#45b7d1'];
    const fireworkCount = window.innerWidth < 768 ? 10 : 20;
    
    for (let i = 0; i < fireworkCount; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.style.position = 'fixed';
            firework.style.width = '4px';
            firework.style.height = '4px';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            firework.style.borderRadius = '50%';
            firework.style.pointerEvents = 'none';
            firework.style.zIndex = '1001';
            
            const startX = Math.random() * window.innerWidth;
            const startY = window.innerHeight;
            const endX = startX + (Math.random() - 0.5) * 300;
            const endY = Math.random() * window.innerHeight * 0.5;
            
            firework.style.left = startX + 'px';
            firework.style.top = startY + 'px';
            
            document.body.appendChild(firework);
            
            firework.style.transition = 'all 1s ease-out';
            setTimeout(() => {
                firework.style.left = endX + 'px';
                firework.style.top = endY + 'px';
                firework.style.transform = 'scale(3)';
                firework.style.opacity = '0';
            }, 50);
            
            setTimeout(() => {
                if (document.body.contains(firework)) {
                    document.body.removeChild(firework);
                }
            }, 1500);
        }, i * 100);
    }
}

function resetGame() {
    players = [];
    currentPlayerIndex = 0;
    gameState = 'setup';
    playerCount = 0;
    isAnimating = false;
    
    document.getElementById('winnerPopup').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('playerSetup').classList.add('hidden');
    document.getElementById('setupScreen').classList.remove('hidden');
    
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    board.classList.remove('error');
    
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    
    document.getElementById('rollBtn').disabled = false;
    
    updateBoardSize();
    createBoard();
}

document.addEventListener('DOMContentLoaded', function() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', function() {
            if (this.checked && gameState === 'playing') {
                playBackgroundMusic();
            } else if (backgroundMusic) {
                backgroundMusic.pause();
            }
        });
    }
});

initGame();