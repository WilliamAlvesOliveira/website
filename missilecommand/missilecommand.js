const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis do Jogo
let cityPoints = generateCityPoints(10);
const enemyMissiles = [];
const playerMissiles = [];
let missilesDestroyed = 0;
let highScore = localStorage.getItem('highScore') || 0;

// Configurações de dificuldade
const enemyMissileProbability = 0.006;
const initialSpeed = 0.1;
const maxSpeed = 0.8;
const expansionRate = 0.5;
const playerMissileLifetime = 60;

const estrelas = [
    // Virgem (Virgo)
    { x: 0.58, y: 0.05}, 

    //Cão Menor (Canis Minor)
    { x: 0.3, y: 0.15 },

    //Cão Maior (Canis Major)
    { x: 0.31, y: 0.28 },
    { x: 0.28, y: 0.31 },
    { x: 0.33, y: 0.26 }, 
    { x: 0.35, y: 0.32 }, 
    { x: 0.34, y: 0.34 },

    //Quilha (Carina)
    { x: 0.38, y: 0.38},

    //Hydra
    {x:0.39, y: 0.20},
    {x: 0.60 , y: 0.16},

    //Cruzeiro
    {x:0.50, y:0.22},
    {x:0.48, y:0.25},
    {x:0.52,y:0.24},
    {x:0.48999,y:0.27},
    {x:0.503, y:0.31},

    //Oitante
    {x:0.511, y:0.48},

    //Triângulo Astral
    {x:0.58, y:0.39},
    {x:0.63, y:0.399},
    {x:0.607, y:0.43},

    //Escorpião
    {x: 0.68, y:0.38},
    {x: 0.68, y:0.425},
    {x: 0.679, y:0.467},
    {x: 0.72, y:0.39},
    {x: 0.75, y:0.37},
    {x: 0.765, y: 0.335},
    {x:0.755, y: 0.30},
    {x: 0.80, y: 0.302}

];
// Funções do Jogo

function generateCityPoints(numPoints) {
    const points = [];
    const marginBottom = 0.8 * canvas.height;
    for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * canvas.width;
        const y = marginBottom + Math.random() * (canvas.height - marginBottom);
        points.push({ x: x, y: y });
    }
    return points;
}

function drawStars() {
    ctx.fillStyle = 'white'; // Cor das estrelas
    estrelas.forEach(estrela => {
        const x = estrela.x * canvas.width;
        const y = estrela.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2); // Tamanho das estrelas
        ctx.fill();
        ctx.closePath();
    });
}

function drawGround() {
    ctx.fillStyle = 'saddlebrown'; // Cor do chão
    const groundHeight = canvas.height * 0.25; // Altura do chão (25% da altura do canvas)
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function drawCityPoints() {
    ctx.fillStyle = 'rgb(31, 138, 205)';
    cityPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

function addEnemyMissile() {
    const x = Math.random() * canvas.width;
    const speed = initialSpeed + Math.random() * (maxSpeed - initialSpeed);
    const directionType = Math.random();

    let dx = 0;
    let dy = speed;

    if (directionType < 0.4 && cityPoints.length > 0) {
        const target = cityPoints[Math.floor(Math.random() * cityPoints.length)];
        const angle = Math.atan2(target.y, target.x - x);
        dx = speed * Math.cos(angle);
        dy = speed * Math.sin(angle);
    } else if (directionType < 0.8) {
        const angle = (Math.random() * Math.PI / 3) - (Math.PI / 6);
        dx = speed * Math.cos(angle);
        dy = speed * Math.sin(angle);
    }

    enemyMissiles.push({ x: x, y: 0, dx: dx, dy: dy, initialX: x, initialY: 0 });
}

function drawEnemyMissiles() {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;

    for (let i = enemyMissiles.length - 1; i >= 0; i--) {
        let missile = enemyMissiles[i];

        ctx.beginPath();
        ctx.moveTo(missile.initialX, missile.initialY);
        ctx.lineTo(missile.x, missile.y);
        ctx.stroke();

        missile.x += missile.dx;
        missile.y += missile.dy;

        if (missile.y >= canvas.height || missile.x <= 0 || missile.x >= canvas.width) {
            enemyMissiles.splice(i, 1);
        }

        for (let j = cityPoints.length - 1; j >= 0; j--) {
            const point = cityPoints[j];
            const dx = missile.x - point.x;
            const dy = missile.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 5) {
                cityPoints.splice(j, 1);
                enemyMissiles.splice(i, 1);
                break;
            }
        }
    }
}

function drawPlayerMissiles() {
    ctx.fillStyle = 'yellow';
    for (let i = playerMissiles.length - 1; i >= 0; i--) {
        let missile = playerMissiles[i];
        missile.radius += expansionRate;
        missile.timeLeft -= 1;

        ctx.beginPath();
        ctx.arc(missile.x, missile.y, missile.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        if (missile.timeLeft <= 0) {
            playerMissiles.splice(i, 1);
        }
    }
}

function launchPlayerMissile(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    playerMissiles.push({ x: x, y: y, radius: 5, timeLeft: playerMissileLifetime });
}

function checkCollisions() {
    for (let i = playerMissiles.length - 1; i >= 0; i--) {
        let playerMissile = playerMissiles[i];
        for (let j = enemyMissiles.length - 1; j >= 0; j--) {
            let enemyMissile = enemyMissiles[j];
            const dx = playerMissile.x - enemyMissile.x;
            const dy = playerMissile.y - enemyMissile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < playerMissile.radius) {
                drawExplosion(enemyMissile.x, enemyMissile.y);
                enemyMissiles.splice(j, 1);
                missilesDestroyed++;
            }
        }
    }

    for (let i = enemyMissiles.length - 1; i >= 0; i--) {
        let missile = enemyMissiles[i];
        for (let j = cityPoints.length - 1; j >= 0; j--) {
            const point = cityPoints[j];
            const dx = missile.x - point.x;
            const dy = missile.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 5) {
                drawExplosion(point.x, point.y);
                cityPoints.splice(j, 1);
                enemyMissiles.splice(i, 1);
                break;
            }
        }
    }
}

function checkGameOver() {
    if (cityPoints.length === 0) {
        alert("Game Over! All cities have been destroyed.");
        if (missilesDestroyed > highScore) {
            highScore = missilesDestroyed;
            localStorage.setItem('highScore', highScore);
            alert(`New High Score: ${highScore}`);
        }
        resetGame();
    }
}

function resetGame() {
    cityPoints = generateCityPoints(10);
    enemyMissiles.length = 0;
    playerMissiles.length = 0;
    missilesDestroyed = 0;
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`Mísseis destruídos: ${missilesDestroyed}`, 5, 10);
    ctx.fillText(`Recorde: ${highScore}`, 5, 25);
}

function drawExplosion(x, y) {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawGround(); // Desenhar o chão primeiro
    drawCityPoints();
    drawEnemyMissiles();
    drawPlayerMissiles();
    checkCollisions();
    checkGameOver();
    drawScore();

    if (Math.random() < enemyMissileProbability) {
        addEnemyMissile();
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', launchPlayerMissile);

gameLoop();
