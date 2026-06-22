        // ========== AI SYSTEM ==========
        function spawnAIs(count) {
            ais = [];
            let roamIdx = (count >= 3) ? Math.floor(Math.random() * count) : -1;

            for (let i = 0; i < count; i++) {
                let placed = false, attempts = 0;
                while (!placed && attempts < 200) {
                    attempts++;
                    let edge = Math.floor(Math.random() * 4);
                    let ax, ay;
                    if (edge === 0)      { ax = Math.floor(Math.random() * 20); ay = 0; }
                    else if (edge === 1) { ax = 19; ay = Math.floor(Math.random() * 20); }
                    else if (edge === 2) { ax = Math.floor(Math.random() * 20); ay = 19; }
                    else                 { ax = 0;  ay = Math.floor(Math.random() * 20); }

                    if (snake.length > 0) {
                        let distFromPlayer = Math.abs(ax - snake[0].x) + Math.abs(ay - snake[0].y);
                        if (distFromPlayer <= 5) continue;
                    }
                    // AI ต้องอยู่ห่างอาหารมากกว่าผู้เล่น
                    let distAItoFood = Math.abs(ax - food.x) + Math.abs(ay - food.y);
                    let distPlayerToFood = snake.length > 0
                        ? Math.abs(snake[0].x - food.x) + Math.abs(snake[0].y - food.y)
                        : 0;
                    if (distAItoFood <= distPlayerToFood) continue;

                    if (!isHitObstacle({ x: ax, y: ay }) && !isHitPoop({ x: ax, y: ay })) {
                        ais.push({
                            body: [{ x: ax, y: ay }, { x: ax, y: ay }, { x: ax, y: ay }],
                            dx: 0, dy: 0,
                            accum: 0,
                            behavior: (i === roamIdx) ? 'ROAM' : 'EVALUATE',
                            phaseTimer: 0,
                            roamTarget: null,
                            color: rivalColors[i % rivalColors.length],
                            foodEaten: 0,
                            showHaha: false,
                            hahaTimer: 0
                        });
                        placed = true;
                    }
                }
            }
        }

        // speed curve: เริ่ม 1.2x, ยาวขึ้นช้าลง, เหลือ 1-2 เร็ว 1.5x
        function getAiSpeed(ai) {
            let len = ai.body.length;
            if (len <= 2) return 1.5;
            if (len >= 12) return 1.0;
            return 1.2 - ((len - 3) / (12 - 3)) * 0.2;
        }

        function updateAIs() {
            if (document.getElementById("modeSelect").value !== "4") { ais = []; return; }
            if (dx === 0 && dy === 0 && gameState === "PLAYING") return;
            if (ais.length === 0 && snake.length > 0) {
                if (aiWave > 5) aiWave = 1;
                spawnAIs(aiWave); aiWave++;
            }

            for (let i = ais.length - 1; i >= 0; i--) {
                let ai = ais[i];
                ai.accum += getAiSpeed(ai);

                while (ai.accum >= 1) {
                    ai.accum -= 1;
                    if (ai.body.length === 0) break;

                    let head = ai.body[0];

                    // ===== re-evaluate behavior ทุก 30 tick =====
                    ai.phaseTimer++;
                    if (ai.phaseTimer > 30 && ai.behavior !== 'ROAM') {
                        ai.phaseTimer = 0;

                        if (ai.body.length <= 3) {
                            // ตัวเล็ก: สลับระหว่างหนีและแย่งอาหาร
                            let r = Math.random();
                            if (r < 0.5) ai.behavior = 'FLEE';
                            else         ai.behavior = 'STEAL'; // แย่งอาหาร
                        } else if (ai.body.length > snake.length) {
                            // ยาวกว่าผู้เล่น: 40% hunt, 40% food, 20% dodge
                            let r = Math.random();
                            if      (r < 0.40) ai.behavior = 'HUNT';
                            else if (r < 0.80) ai.behavior = 'FOOD';
                            else               ai.behavior = 'DODGE';
                        } else {
                            // สั้นกว่าผู้เล่น: หนี
                            ai.behavior = 'FLEE';
                        }
                    }

                    // ===== กำหนดเป้าหมาย =====
                    let targetX, targetY;

                    if (ai.behavior === 'ROAM') {
                        if (ai.phaseTimer % 15 === 0 || !ai.roamTarget) {
                            ai.roamTarget = {
                                x: Math.floor(Math.random() * tileCount),
                                y: Math.floor(Math.random() * tileCount)
                            };
                        }
                        targetX = ai.roamTarget.x;
                        targetY = ai.roamTarget.y;

                    } else if (ai.behavior === 'HUNT' && snake.length > 0) {
                        targetX = snake[0].x;
                        targetY = snake[0].y;

                    } else if (ai.behavior === 'FOOD' || ai.behavior === 'STEAL') {
                        targetX = food.x;
                        targetY = food.y;

                    } else if (ai.behavior === 'DODGE' && snake.length > 0) {
                        // หลบผู้เล่น: เลือก move ที่ห่างผู้เล่นมากสุด (handle ใน sort ด้านล่าง)
                        targetX = head.x + (head.x - snake[0].x) * 3;
                        targetY = head.y + (head.y - snake[0].y) * 3;
                        targetX = Math.max(0, Math.min(tileCount - 1, targetX));
                        targetY = Math.max(0, Math.min(tileCount - 1, targetY));

                    } else if (ai.behavior === 'FLEE' && snake.length > 0) {
                        // หนีผู้เล่น: เลือก move ที่ห่างผู้เล่นมากสุด
                        targetX = head.x + (head.x - snake[0].x) * 3;
                        targetY = head.y + (head.y - snake[0].y) * 3;
                        targetX = Math.max(0, Math.min(tileCount - 1, targetX));
                        targetY = Math.max(0, Math.min(tileCount - 1, targetY));

                    } else {
                        targetX = food.x; targetY = food.y;
                    }

                    // ===== safe moves: หลบทุกอย่าง รวม body ผู้เล่น =====
                    let possibleMoves = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
                    let safeMoves = possibleMoves.filter(m => {
                        if (m.x === -ai.dx && m.y === -ai.dy && ai.body.length > 1) return false;
                        let nx = head.x + m.x, ny = head.y + m.y;
                        if (nx < 0 || nx >= tileCount || ny < 0 || ny >= tileCount) return false;
                        if (isHitObstacle({ x: nx, y: ny })) return false;
                        if (isHitPoop({ x: nx, y: ny })) return false;
                        if (extraHeart && nx === extraHeart.x && ny === extraHeart.y) return false;
                        if (ai.body.some(p => p.x === nx && p.y === ny)) return false;
                        // AI ไม่ทะลุลำตัวผู้เล่น (ยกเว้นหัว ซึ่งเช็คแยก)
                        if (snake.slice(1).some(p => p.x === nx && p.y === ny)) return false;
                        let hitOtherAi = false;
                        ais.forEach(otherAi => {
                            if (otherAi !== ai && otherAi.body.some(p => p.x === nx && p.y === ny)) hitOtherAi = true;
                        });
                        return !hitOtherAi;
                    });

                    // FLEE/DODGE: เรียงจากห่างผู้เล่นมากสุด
                    let isFleeing = (ai.behavior === 'FLEE' || ai.behavior === 'DODGE');
                    if (safeMoves.length > 0) {
                        if (isFleeing && snake.length > 0) {
                            safeMoves.sort((a, b) => {
                                let d1 = Math.abs(head.x + a.x - snake[0].x) + Math.abs(head.y + a.y - snake[0].y);
                                let d2 = Math.abs(head.x + b.x - snake[0].x) + Math.abs(head.y + b.y - snake[0].y);
                                return d2 - d1; // มากสุดก่อน
                            });
                        } else {
                            safeMoves.sort((a, b) => {
                                let d1 = Math.abs(head.x + a.x - targetX) + Math.abs(head.y + a.y - targetY);
                                let d2 = Math.abs(head.x + b.x - targetX) + Math.abs(head.y + b.y - targetY);
                                return d1 - d2;
                            });
                        }
                        ai.dx = safeMoves[0].x; ai.dy = safeMoves[0].y;
                    } else {
                        ai.body = []; break;
                    }

                    let nextHead = { x: head.x + ai.dx, y: head.y + ai.dy };

                    // ===== Head-on collision: ปากชนปาก =====
                    let playerNextHead = (dx !== 0 || dy !== 0)
                        ? { x: snake.length > 0 ? snake[0].x + dx : -1, y: snake.length > 0 ? snake[0].y + dy : -1 }
                        : null;
                    let isHeadOn = playerNextHead
                        && nextHead.x === playerNextHead.x
                        && nextHead.y === playerNextHead.y;

                    // ===== ชนลำตัวผู้เล่น (ก่อน unshift) =====
                    let hitPlayerBody = snake.slice(1).some(p => p.x === nextHead.x && p.y === nextHead.y);
                    let hitPlayerHead = snake.length > 0 && snake[0].x === nextHead.x && snake[0].y === nextHead.y;

                    ai.body.unshift(nextHead);

                    if (isHeadOn) {
                        // ปากชนปาก: ทั้งคู่ลด 1
                        if (snake.length > 1) snake.pop();
                        ai.body.pop(); // AI ก็ลดด้วย
                        document.getElementById("statsBox").style.backgroundColor = "#FFB7B2";
                        setTimeout(() => { document.getElementById("statsBox").style.backgroundColor = "#FFE5D9"; }, 200);

                    } else if (hitPlayerHead) {
                        // หัว AI ชน หัวผู้เล่น (ไม่ head-on): ทั้งคู่ลด 1
                        if (snake.length > 1) snake.pop();
                        ai.body.pop();
                        document.getElementById("statsBox").style.backgroundColor = "#FFB7B2";
                        setTimeout(() => { document.getElementById("statsBox").style.backgroundColor = "#FFE5D9"; }, 200);

                    } else if (hitPlayerBody) {
                        // หัว AI ชน body ผู้เล่น → ผู้เล่นสั้นลง 1
                        if (snake.length > 1) {
                            snake.pop();
                            document.getElementById("statsBox").style.backgroundColor = "#FFB7B2";
                            setTimeout(() => { document.getElementById("statsBox").style.backgroundColor = "#FFE5D9"; }, 200);
                        } else {
                            // ผู้เล่นตาย → Victory Lap
                            snake = [];
                            lives = 0; updateStats();
                            if (gameState !== "DEAD" && gameState !== "AI_VICTORY_LAP") saveScore();
                            gameState = "AI_VICTORY_LAP";
                            ai.victoryFoodTarget = 1;
                            ai.showHaha = true;
                            ai.hahaTimer = 60;
                        }
                        ai.body.pop();

                    } else if (gameState === "AI_VICTORY_LAP" && ai.showHaha) {
                        // Victory Lap: AI วิ่งกินอาหาร 1 คำ
                        if (nextHead.x === food.x && nextHead.y === food.y) {
                            spawnFood();
                            ai.victoryFoodTarget = (ai.victoryFoodTarget || 1) - 1;
                            if (ai.victoryFoodTarget <= 0) {
                                clearTimeout(gameLoop);
                                gameState = "DEAD";
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                drawBackgroundEntities();
                                setTimeout(() => { showGameOverOverlay("😂 โดน AI ฆ่าตาย!"); }, 800);
                                return;
                            }
                        } else {
                            ai.body.pop();
                        }

                    } else if (nextHead.x === food.x && nextHead.y === food.y) {
                        spawnFood(); ai.foodEaten++;
                    } else {
                        ai.body.pop();
                    }

                    while (ai.body.length > MAX_SNAKE_LENGTH_AI) ai.body.pop();
                }

                // นับถอยหลัง hahaTimer
                if (ai.hahaTimer > 0) ai.hahaTimer--;

                if (ai.body.length <= 0) {
                    ais.splice(i, 1);
                    if (gameState === "PLAYING") {
                        score += 20;
                        lives = Math.min(MAX_LIVES, lives + 2);
                        let growCount = Math.min(3, MAX_SNAKE_LENGTH_AI - snake.length);
                        playerPendingGrowth += Math.max(0, growCount);
                        updateStats();
                    }
                }
            }
        }

