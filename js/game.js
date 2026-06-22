        // ========== MAIN LOOP ==========
        function mainLoopTrigger() {
            gameLoop = setTimeout(() => {
                changingDir = false;
                if (damageVisualTimer > 0) damageVisualTimer--;

                if (gameState === "PLAYING") {
                    update();
                    if (gameState === "PLAYING") {
                        updateAIs();
                        updateEgg();
                        draw();
                        mainLoopTrigger();
                    }
                } else if (gameState === "AI_VICTORY_LAP") {
                    updateAIs();
                    if (gameState === "AI_VICTORY_LAP") {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        drawBackgroundEntities();
                        mainLoopTrigger();
                    }
                }
            }, currentSpeed);
        }

        // ========== CORE UPDATE ==========
        function update() {
            if (dx === 0 && dy === 0) return;

            totalSteps++;
            updateStats();

            if (smileTimer > 0) smileTimer--;
            if (poopEatTimer > 0) poopEatTimer--;
            if (heartEatTimer > 0) heartEatTimer--;
            if (sadTimer > 0) sadTimer--;
            if (verySadTimer > 0) verySadTimer--;

            const head = { x: snake[0].x, y: snake[0].y };
            const mode = document.getElementById("modeSelect").value;

            let nextHead = { x: head.x + dx, y: head.y + dy };
            let hitWall  = false;

            if (mode !== "1") {
                if (nextHead.x < 0 || nextHead.x >= tileCount || nextHead.y < 0 || nextHead.y >= tileCount) hitWall = true;
            } else {
                if (nextHead.x < 0)          nextHead.x = tileCount - 1;
                else if (nextHead.x >= tileCount) nextHead.x = 0;
                if (nextHead.y < 0)          nextHead.y = tileCount - 1;
                else if (nextHead.y >= tileCount) nextHead.y = 0;
            }

            let hitObst = isHitObstacle(nextHead);
            let ateFood = (nextHead.x === food.x && nextHead.y === food.y);
            let hitS    = false;

            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === nextHead.x && snake[i].y === nextHead.y) {
                    if (i === snake.length - 1 && !ateFood && playerPendingGrowth === 0 && !snake[i].digesting) continue;
                    hitS = true; break;
                }
            }

            if (mode === "4") {
                ais.forEach(ai => {
                    if (ai.body.some(p => p.x === nextHead.x && p.y === nextHead.y)) {
                        ai.body.pop();
                        document.getElementById("statsBox").style.backgroundColor = "#B5EAD7";
                        setTimeout(() => { document.getElementById("statsBox").style.backgroundColor = "#FFE5D9"; }, 200);
                    }
                });
            }

            // ===== GRACE PERIOD COLLISION =====
            if (hitWall || hitObst || hitS) {
                if (!inGracePeriod) {
                    inGracePeriod = true;
                    pendingCollisionDamage = true;
                    collisionDir = { x: dx, y: dy };
                    pendingCollisionNext = { x: nextHead.x, y: nextHead.y };
                    // ไม่ตั้ง damageVisualTimer และ stunType ระหว่าง grace
                    // → หัวไม่เปลี่ยนสี ไม่มีสั่น จนกว่าจะโดนดาเมจจริง
                    damageVisualTimer = 0;
                    stunType = "";
                    dx = 0; dy = 0;

                    clearTimeout(graceTimeout);
                    const _hitS = hitS, _hitObst = hitObst, _savedNext = pendingCollisionNext;

                    graceTimeout = setTimeout(() => {
                        if (!inGracePeriod || !pendingCollisionDamage) return;
                        inGracePeriod = false; pendingCollisionDamage = false; collisionDir = null;

                        // เริ่ม visual หลังจากโดนดาเมจจริง
                        damageVisualTimer = 15;
                        if (_hitS)          stunType = 'SELF';
                        else if (_hitObst)  stunType = 'OBSTACLE';
                        else                stunType = 'WALL';

                        if (_hitS) {
                            if (selfBiteCount === 0) selfBiteCount = 1;
                            else if (stepsSinceLastSelfBite > 0 && stepsSinceLastSelfBite <= 5) selfBiteCount++;
                            else if (stepsSinceLastSelfBite > 5) selfBiteCount = 1;
                            stepsSinceLastSelfBite = 0;
                            let hitIndex = snake.findIndex(p => p.x === _savedNext.x && p.y === _savedNext.y);
                            if (hitIndex !== -1) snake[hitIndex].bruiseTimer = 45;
                            bloodSpots.push({ x: _savedNext.x, y: _savedNext.y, life: 20 });
                        } else if (_hitObst) {
                            let hit = findHitCell(_savedNext);
                            if (hit) {
                                let { ob, cell } = hit;
                                cell.hitCount++;
                                cell.hasBlood = true;
                                if (cell.hitCount >= 5) {
                                    // cell ถูกทำลาย → เลือดถาวร
                                    bloodSpots.push({ x: cell.x, y: cell.y, life: Infinity });
                                    ob.cells = ob.cells.filter(c => c !== cell);
                                    if (ob.cells.length === 0) {
                                        obstacles = obstacles.filter(o => o !== ob);
                                    } else {
                                        let groups = getConnectedGroups(ob.cells);
                                        if (groups.length > 1) {
                                            obstacles = obstacles.filter(o => o !== ob);
                                            groups.forEach(group => obstacles.push({ cells: group }));
                                        }
                                    }
                                }
                            }
                            if (snake.length > 0) snake[0].bloodTimer = 20;
                        }

                        if (_hitS && selfBiteCount > 5 && snake.length > 2) { snake.pop(); snake.pop(); }

                        if (lives <= 1) { explodeSnake(); return; }
                        lives -= 1; updateStats();
                        document.getElementById("statsBox").style.backgroundColor = "#FFCAD4";
                        setTimeout(() => {
                            document.getElementById("statsBox").style.backgroundColor = "#FFE5D9";
                            stunType = "";
                        }, 300);
                    }, 500); // ← 500ms
                    return;
                }
                return;
            }

            // ล้าง grace period เมื่อเลื้อยออกได้
            if (inGracePeriod && pendingCollisionDamage) {
                inGracePeriod = false; pendingCollisionDamage = false;
                collisionDir = null; pendingCollisionNext = null; stunType = "";
                clearTimeout(graceTimeout);
            }
            inGracePeriod = false;

            stepsSinceLastSelfBite++;
            bloodSpots.forEach(b => b.life--);
            bloodSpots = bloodSpots.filter(b => b.life > 0);
            snake.forEach(p => {
                if (p.bruiseTimer > 0) p.bruiseTimer--;
                if (p.bloodTimer  > 0) p.bloodTimer--;
            });

            // FIX: tail declared once only
            let tail = snake[snake.length - 1];

            poops.forEach(p => p.life--);
            poops = poops.filter(p => p.life > 0);

            let atePoopIdx = poops.findIndex(p => p.x === nextHead.x && p.y === nextHead.y);
            let atePoop  = atePoopIdx !== -1;
            let ateHeart = (extraHeart && nextHead.x === extraHeart.x && nextHead.y === extraHeart.y);

            // ชนไข่ / ลูกงู
            if (eggObj) {
                if (eggObj.type === 'EGG' && nextHead.x === eggObj.x && nextHead.y === eggObj.y) {
                    if (lives <= 4) { explodeSnake(); return; }
                    lives -= 4; snake.length = Math.max(3, Math.floor(snake.length / 2));
                    sadTimer = 40; eggObj = null; updateStats();
                } else if (eggObj.type === 'BABY') {
                    let hitBaby = eggObj.body.some(p => p.x === nextHead.x && p.y === nextHead.y);
                    if (hitBaby) {
                        if (lives <= 7) { explodeSnake(); return; }
                        lives -= 7; snake.length = Math.max(3, Math.floor(snake.length * 0.2));
                        verySadTimer = 50; eggObj = null; updateStats();
                    }
                }
            }

            // เลื่อน digesting flag
            for (let i = snake.length - 1; i > 0; i--) { snake[i].digesting = snake[i-1].digesting; }
            snake[0].digesting = false;

            // วางอึ
            if (!ateFood && pendingPoops > 0) {
                if (!isHitObstacle(tail) && !(food.x === tail.x && food.y === tail.y)) {
                    poops.push({ x: tail.x, y: tail.y, life: 60 });
                }
                pendingPoops--;
            }

            if (extraHeart) { extraHeart.life--; if (extraHeart.life <= 0) extraHeart = null; }

            snake.unshift({ x: nextHead.x, y: nextHead.y, digesting: ateFood, bruiseTimer: 0, bloodTimer: 0 });

            // กินอึ
            if (atePoop) {
                poops.splice(atePoopIdx, 1);
                if (heartEatTimer > 0) {
                    explodeSnake(['#00FF00','#32CD32','#7CFC00','#ADFF2F','#006400'],
                        "<span style='font-size: 32px; color: #CDDC39; text-shadow: 2px 2px 0px #4F5D2F; font-weight: 900; display: block; margin-top: 15px;'>ใครเขากินอึกัน</span>");
                    return;
                } else {
                    // ยกเลิก unshift (กลับความยาวเดิม) แล้ว pop อีกรอบ (สั้นลง 1 จริงๆ)
                    snake.pop();
                    if (snake.length > 2) snake.pop();
                    poopsEaten++; totalPoopsEatenSession++; poopEatTimer = 20; updateStats();
                    playSound(150, 'triangle', 0.2, 0.05);
                    createSparkles(nextHead.x * gridSize + gridSize/2, nextHead.y * gridSize + gridSize/2, "#A5D6A7", 12);
                    if (poopsEaten >= 5) { explodeSnake(); return; }
                }
            }

            // กินหัวใจ
            if (ateHeart) {
                if (lives < MAX_LIVES) lives++; else score += 11;
                poopsEaten = 0; extraHeart = null; heartEatTimer = 25; heartsEatenSession++;
                playSound(880, 'sine', 0.3, 0.1);
                createSparkles(nextHead.x * gridSize + gridSize/2, nextHead.y * gridSize + gridSize/2, "#FF80AB", 25);
                updateStats();
            }

            // กินอาหาร
            if (ateFood) {
                stepsSinceLastFood = 0;
                let now = Date.now();
                if (now - lastEatTime < 3000) comboCount++; else comboCount = 0;
                lastEatTime = now;

                let bonus = Math.floor(5 * (comboCount * 0.5));
                score += 5 + bonus;
                playSound(440 + (comboCount * 100), 'sine', 0.1, 0.1);

                foodEatenCount++; smileTimer = 15;
                createSparkles(nextHead.x * gridSize + gridSize/2, nextHead.y * gridSize + gridSize/2, colors[foodEatenCount % colors.length], 20);
                if (comboCount > 0) showComboText(comboCount);
                if (poopEatTimer > 0) poopEatTimer = 0;
                if (foodEatenCount % 100 === 0 && mode !== "4" && !eggObj) spawnEggObj();

                let diarrheaMult = 1 + (poopsEaten * 0.5);
                if (foodEatenCount >= 5) {
                    if (foodEatenCount % 5 === 0) {
                        pendingPoops += Math.floor((2 + Math.floor(snake.length / 5)) * diarrheaMult);
                    } else {
                        let chance = (0.4 + (snake.length * 0.01)) * diarrheaMult;
                        if (Math.random() < chance) pendingPoops += 1 + Math.floor(Math.random() * (snake.length / 10));
                    }
                }

                if (cheatWinActivated || (snake.length >= (tileCount * tileCount - obstacles.length - 2) && mode !== "4")) {
                    triggerFreeRoam(); return;
                }

                if (mode === "3") {
                    let speedLvl = Math.floor(foodEatenCount / 30);
                    if (speedLvl > 14) speedLvl = 14;
                    currentSpeed = 150 - (speedLvl * 7.85);
                }

                let dropRate = 0.30 - ((currentSpeed - 40) / 160) * 0.20;
                if (lives >= MAX_LIVES) dropRate *= 0.5;
                if (!extraHeart && Math.random() <= dropRate) spawnHeart();

                updateStats();
                spawnFood();

            } else {
                // ไม่ได้กินอาหาร
                stepsSinceLastFood++;
                if (playerPendingGrowth > 0) { playerPendingGrowth--; }
                else if (!atePoop) { snake.pop(); }

                isStarved = stepsSinceLastFood >= 100;

                if (stepsSinceLastFood === 100) {
                    starveBodyStart = Math.max(1, snake.length - 1);
                    starveLivesStart = lives;
                    liveDrainAccum = 0;
                }

                let bodyLen = Math.max(1, snake.length - 1);
                let shrinkInterval = Math.max(5, 15 - Math.floor(bodyLen / 15));

                if (isStarved && (stepsSinceLastFood - 100) % shrinkInterval === 0) {
                    if (starveLivesStart > 0 && starveBodyStart > 0) {
                        let drainPerShrink = starveLivesStart / (starveBodyStart + 1);
                        liveDrainAccum += drainPerShrink;
                        if (liveDrainAccum >= 1) {
                            let toLose = Math.floor(liveDrainAccum);
                            lives = Math.max(0, lives - toLose);
                            liveDrainAccum -= toLose;
                            updateStats();
                        }
                    }

                    if (snake.length > 1) {
                        snake.pop();
                    } else if (!isSkullPhase) {
                        isSkullPhase = true;
                        skullPhaseCountdown = 15;
                    }
                }

                if (isSkullPhase) {
                    skullPhaseCountdown--;
                    if (skullPhaseCountdown <= 0) {
                        isSkullPhase = false;
                        gameState = "DEAD";
                        dx = 0; dy = 0;
                        lives = 0; updateStats(); draw();
                        setTimeout(() => { showGameOverOverlay("💀 อดตาย"); }, 1000);
                    }
                }
            }

            if (mode === "4") {
                while (snake.length > MAX_SNAKE_LENGTH_AI) snake.pop();
            }
        }

        // ========== HIT UTILITY (ใช้ตอนเรียก lives-- โดยตรง) ==========
        function hit() {
            lives--;
            updateStats();
            document.getElementById("statsBox").style.backgroundColor = "#FFCAD4";
            setTimeout(() => { document.getElementById("statsBox").style.backgroundColor = "#FFE5D9"; }, 300);
            if (lives <= 0) explodeSnake();
        }

        // ========== INIT GAME ==========
        function initGame(fullReset) {
            clearTimeout(gameLoop);
            clearTimeout(freeRoamLoop);

            canvas.style.opacity = "1";
            document.getElementById("freeRoamContainer").innerHTML = "";

            if (fullReset) {
                score = 0;
                lives = 3;
                foodEatenCount = 0;
                poopsEaten = 0;
                pendingPoops = 0;
                totalSteps = 0;
                heartsEatenSession = 0;
                totalPoopsEatenSession = 0;
                aiWave = 1;
                isStarved = false;
                stepsSinceLastFood = 0;
                isSkullPhase = false;
                skullPhaseCountdown = 0;
                comboCount = 0;
                lastEatTime = 0;
                cheatWinActivated = false;
                selfBiteCount = 0;
                stepsSinceLastSelfBite = 0;
                liveDrainAccum = 0;
                starveBodyStart = 0;
                starveLivesStart = 0;
                playerPendingGrowth = 0;
                rainbowAuraHue = 0;
            }

            snake = [
                { x: 10, y: 10, digesting: false, bruiseTimer: 0, bloodTimer: 0 }, // หัว
                { x: 9,  y: 10, digesting: false, bruiseTimer: 0, bloodTimer: 0 }, // ตัว
                { x: 8,  y: 10, digesting: false, bruiseTimer: 0, bloodTimer: 0 }, // หาง
            ];
            dx = 0; dy = 0;
            lastDx = 1; lastDy = 0;
            poops = [];
            ais = [];
            extraHeart = null;
            eggObj = null;
            sparkles = [];
            floatingTexts = [];
            bloodSpots = [];
            explosionParticles = [];
            inGracePeriod = false;
            pendingCollisionDamage = false;
            collisionDir = null;
            pendingCollisionNext = null;
            damageVisualTimer = 0;
            stunType = "";
            isPaused = false;
            gameState = "PLAYING";
            // reset timers ที่ค้างจาก session ก่อน
            smileTimer     = 0;
            poopEatTimer   = 0;
            heartEatTimer  = 0;
            sadTimer       = 0;
            verySadTimer   = 0;

            document.getElementById("pauseBtn").innerText = "⏸️ พักเกม (Spacebar)";
            hideGameOverOverlay();
            spawnFood();
            spawnObstacles();
            updateStats();
            draw();
            mainLoopTrigger();
        }

