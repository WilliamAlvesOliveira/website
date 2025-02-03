const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Cidades (pontos)
        let cityPoints = generateCityPoints(10);

        // Mísseis inimigos
        const enemyMissiles = [];

        // Contramísseis
        const playerMissiles = [];

        // Contador de mísseis destruídos
        let missilesDestroyed = 0;

        // Gera pontos da cidade em posições aleatórias nos 20% finais da tela
        function generateCityPoints(numPoints) {
            const points = [];
            const marginBottom = 0.8 * canvas.height; // 80% da altura do canvas
            for (let i = 0; i < numPoints; i++) {
                const x = Math.random() * canvas.width;
                const y = marginBottom + Math.random() * (canvas.height - marginBottom); // Parte inferior do canvas
                points.push({ x: x, y: y });
            }
            return points;
        }

        // Desenha os pontos das cidades
        function drawCityPoints() {
            ctx.fillStyle = 'rgb(31, 138, 205)';
            cityPoints.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });
        }

        // Adiciona um míssil inimigo
        function addEnemyMissile() {
            const x = Math.random() * canvas.width;
            const speed = 0.1 + Math.random() * 0.7;

            // Decide aleatoriamente se o míssil será vertical, diagonal ou direcionado para uma cidade
            const directionType = Math.random();

            let dx = 0;
            let dy = speed;

            if (directionType < 0.4 && cityPoints.length > 0) { // 40% de chance de direcionar para um ponto da cidade
                const target = cityPoints[Math.floor(Math.random() * cityPoints.length)];
                const angle = Math.atan2(target.y - 0, target.x - x);
                dx = speed * Math.cos(angle);
                dy = speed * Math.sin(angle);
            } else if (directionType < 0.8) { // 40% de chance de ser diagonal
                const angle = (Math.random() * Math.PI / 3) - (Math.PI / 6); // Ângulo aleatório ajustado
                dx = speed * Math.cos(angle);
                dy = speed * Math.sin(angle);
            }

            enemyMissiles.push({ x: x, y: 0, dx: dx, dy: dy, initialX: x, initialY: 0 });
        }

        // Desenha mísseis inimigos
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

                // Verifica se atingiu o fim da tela
                if (missile.y >= canvas.height || missile.x <= 0 || missile.x >= canvas.width) {
                    enemyMissiles.splice(i, 1);
                }

                // Verifica colisão com pontos das cidades
                for (let j = cityPoints.length - 1; j >= 0; j--) {
                    const point = cityPoints[j];
                    const dx = missile.x - point.x;
                    const dy = missile.y - point.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 5) {
                        cityPoints.splice(j, 1); // Remove o ponto da cidade
                        enemyMissiles.splice(i, 1); // Remove o míssil inimigo
                        break;
                    }
                }
            }
        }

        // Desenha contramísseis
        function drawPlayerMissiles() {
            ctx.fillStyle = 'yellow';
            for (let i = playerMissiles.length - 1; i >= 0; i--) {
                let missile = playerMissiles[i];
                missile.radius += 0.5; // Expande o raio do míssil
                missile.timeLeft -= 1; // Diminui o tempo de vida

                ctx.beginPath();
                ctx.arc(missile.x, missile.y, missile.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();

                // Remove contramísseis após um curto período
                if (missile.timeLeft <= 0) {
                    playerMissiles.splice(i, 1);
                }
            }
        }

        // Lança um contramíssil
        function launchPlayerMissile(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            playerMissiles.push({ x: x, y: y, radius: 5, timeLeft: 60 }); // Adiciona raio e tempo de vida
        }

        // Verifica colisões
        function checkCollisions() {
            for (let i = playerMissiles.length - 1; i >= 0; i--) {
                let playerMissile = playerMissiles[i];
                for (let j = enemyMissiles.length - 1; j >= 0; j--) {
                    let enemyMissile = enemyMissiles[j];
                    const dx = playerMissile.x - enemyMissile.x;
                    const dy = playerMissile.y - enemyMissile.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < playerMissile.radius) {
                        enemyMissiles.splice(j, 1); // Remove o míssil inimigo que colide com o contramíssil
                        missilesDestroyed++; // Incrementa a contagem de mísseis destruídos
                    }
                }
            }
        }

        // Verifica se o jogo terminou
        function checkGameOver() {
            if (cityPoints.length === 0) {
                alert("Game Over! All cities have been destroyed.");
                resetGame();
            }
        }

        // Reinicia o jogo
        function resetGame() {
            cityPoints = generateCityPoints(10);
            enemyMissiles.length = 0;
            playerMissiles.length = 0;
            missilesDestroyed = 0; // Reinicia a contagem de mísseis destruídos
        }

        // Exibe a contagem de mísseis destruídos
        function drawScore() {
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(`Mísseis destruídos: ${missilesDestroyed}`, 10, 20);
        }

        // Loop do jogo
        function gameLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawCityPoints();
            drawEnemyMissiles();
            drawPlayerMissiles();
            checkCollisions();
            checkGameOver();
            drawScore();

            if (Math.random() < 0.006) {
                addEnemyMissile();
            }

            requestAnimationFrame(gameLoop);
        }

        canvas.addEventListener('click', launchPlayerMissile);

        gameLoop();