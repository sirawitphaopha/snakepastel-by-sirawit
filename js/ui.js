        // ========== LAYOUT & UI ==========
        function toggleLayout() {
            document.body.classList.toggle('force-mobile');
        }

        function togglePause() {
            if (gameState === "FREEROAM" || gameState === "DEAD" || gameState === "AI_VICTORY_LAP") return;
            isPaused = !isPaused;
            const pauseBtn = document.getElementById("pauseBtn");

            if (isPaused) {
                gameState = "PAUSED";
                clearTimeout(gameLoop);
                pauseStartTime = Date.now(); // บันทึกเวลาที่หยุด
                pauseBtn.innerText = "▶️ เล่นต่อ (Spacebar)";
                ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#9D8189";
                ctx.font = "bold 30px 'Segoe UI'";
                ctx.textAlign = "center";
                ctx.fillText("⏸️ พักก่อน...", canvas.width / 2, canvas.height / 2);
            } else {
                gameState = "PLAYING";
                pauseBtn.innerText = "⏸️ พักเกม (Spacebar)";
                // ขยับ lastEatTime ไปตาม duration ที่หยุด เพื่อไม่ให้ combo หาย
                if (pauseStartTime > 0) {
                    lastEatTime += (Date.now() - pauseStartTime);
                    pauseStartTime = 0;
                }
                draw();
                mainLoopTrigger();
            }
        }

        function setSpeed(newSpeed, btn) {
            baseSpeed = newSpeed;
            if (document.getElementById("modeSelect").value !== "3") {
                currentSpeed = baseSpeed;
            }
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playSound(600, 'sine', 0.05, 0.05);
        }

        function setDir(x, y) {
            if (changingDir) return;
            if (gameState === "DEAD") return;

            if (gameState === "FREEROAM") {
                if (freeRoamSnake.length > 1) {
                    let head = freeRoamSnake[0];
                    let neck = freeRoamSnake[1];
                    if (head.px + (x * head.w) === neck.px && head.py + (y * head.h) === neck.py) return;
                }
                dx = x; dy = y;
                if (x !== 0 || y !== 0) { lastDx = x; lastDy = y; }
                return;
            }

            if (gameState !== "PLAYING" && gameState !== "PAUSED") return;

            if (inGracePeriod && pendingCollisionDamage && collisionDir) {
                if (x === collisionDir.x && y === collisionDir.y) return;
                if (x === -collisionDir.x && y === -collisionDir.y) return;
                inGracePeriod = false;
                pendingCollisionDamage = false;
                collisionDir = null;
                pendingCollisionNext = null;
                damageVisualTimer = 0;
                stunType = "";
                clearTimeout(graceTimeout);
                dx = x; dy = y;
                if (x !== 0 || y !== 0) { lastDx = x; lastDy = y; }
                changingDir = true;
                return;
            }

            if (x !== 0 && lastDx === -x && dx === 0) return;
            if (y !== 0 && lastDy === -y && dy === 0) return;
            if (x !== 0 && dx === -x) return;
            if (y !== 0 && dy === -y) return;

            dx = x; dy = y;
            if (x !== 0 || y !== 0) { lastDx = x; lastDy = y; }
            changingDir = true;
        }

