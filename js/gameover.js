        // ========== GAME OVER OVERLAY ==========
        function showGameOverOverlay(extraMsg) {
            const overlay = document.getElementById("gameOverOverlay");
            const msgEl   = document.getElementById("goExtraMsg");
            if (!overlay) return;
            if (msgEl) msgEl.innerHTML = extraMsg || "";
            overlay.classList.add("visible");
        }

        function hideGameOverOverlay() {
            const overlay = document.getElementById("gameOverOverlay");
            if (overlay) overlay.classList.remove("visible");
            const msgEl = document.getElementById("goExtraMsg");
            if (msgEl) msgEl.innerHTML = "";
        }

        function showGameOver(extraMsg) {
            clearTimeout(gameLoop);
            if (gameState !== "DEAD" && gameState !== "AI_VICTORY_LAP") saveScore();
            gameState = "DEAD";
            showGameOverOverlay(extraMsg);
        }

        function explodeSnake(customColors, customMsg) {
            gameState = "DEAD";
            clearTimeout(gameLoop);
            saveScore();

            let particleColors = customColors || colors;
            explosionParticles = [];
            snake.forEach(part => {
                for (let i = 0; i < 8; i++) {
                    explosionParticles.push({
                        x: part.x * gridSize + gridSize / 2,
                        y: part.y * gridSize + gridSize / 2,
                        vx: (Math.random() - 0.5) * 10,
                        vy: (Math.random() - 0.5) * 10,
                        life: 1.0,
                        color: particleColors[Math.floor(Math.random() * particleColors.length)]
                    });
                }
            });
            animateExplosion(customMsg);
        }

        function animateExplosion(customMsg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackgroundEntities();
            drawSparkles();

            let alive = false;
            explosionParticles.forEach(p => {
                if (p.life > 0) {
                    p.x += p.vx; p.y += p.vy; p.life -= 0.02;
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
                    alive = true;
                }
            });
            ctx.globalAlpha = 1.0;

            if (alive) requestAnimationFrame(() => animateExplosion(customMsg));
            else showGameOver(customMsg);
        }

