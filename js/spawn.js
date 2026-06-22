        // ========== SPAWN FUNCTIONS ==========
        function spawnFood() {
            let mode = document.getElementById("modeSelect").value;
            let maxAttempts = 50;

            for (let i = 0; i < maxAttempts; i++) {
                let fx = Math.floor(Math.random() * tileCount);
                let fy = Math.floor(Math.random() * tileCount);

                if (isHitObstacle({ x: fx, y: fy }) || isHitSelf({ x: fx, y: fy }) ||
                    (extraHeart && fx === extraHeart.x && fy === extraHeart.y) ||
                    isHitPoop({ x: fx, y: fy })) {
                    continue;
                }

                if (mode === "4" && ais.length > 0 && snake.length > 0) {
                    let distToPlayer = Math.abs(fx - snake[0].x) + Math.abs(fy - snake[0].y);
                    let minDistToAi = Math.min(...ais.map(ai => Math.abs(fx - ai.body[0].x) + Math.abs(fy - ai.body[0].y)));
                    if (minDistToAi <= distToPlayer && i < maxAttempts - 1) continue;
                }

                food.x = fx; food.y = fy;
                return;
            }

            food.x = Math.floor(Math.random() * tileCount);
            food.y = Math.floor(Math.random() * tileCount);
        }

        function spawnHeart() {
            let maxAttempts = 50;
            for (let i = 0; i < maxAttempts; i++) {
                let hx = Math.floor(Math.random() * tileCount);
                let hy = Math.floor(Math.random() * tileCount);
                if (isHitObstacle({ x: hx, y: hy }) || isHitSelf({ x: hx, y: hy }) ||
                    (food.x === hx && food.y === hy) || isHitPoop({ x: hx, y: hy })) {
                    continue;
                }
                extraHeart = { x: hx, y: hy, life: 50 };
                return;
            }
        }

        function spawnObstacles() {
            obstacles = [];
            if (document.getElementById("modeSelect").value !== "2") return;

            // safe zone รอบงูเกิด (x=8,9,10 y=10) + buffer 2 cell ทุกทิศ
            const safeSet = new Set();
            for (let sx = 6; sx <= 12; sx++)
                for (let sy = 8; sy <= 12; sy++)
                    safeSet.add(`${sx},${sy}`);

            let targetCount = 6 + Math.floor(Math.random() * 5); // 6-10 ก้อน
            let attempts = 0;

            while (obstacles.length < targetCount && attempts < 800) {
                attempts++;
                let w = 3 + Math.floor(Math.random() * 3); // 3-5
                let h = 3 + Math.floor(Math.random() * 3); // 3-5

                // ห่างขอบแมพอย่างน้อย 1 cell
                if (tileCount - w - 2 < 1 || tileCount - h - 2 < 1) continue;
                let ox = 1 + Math.floor(Math.random() * (tileCount - w - 2));
                let oy = 1 + Math.floor(Math.random() * (tileCount - h - 2));

                let shape = generateObstacleShape(w, h);
                if (!shape) continue;

                // แปลงเป็น map coords
                let cells = shape.map(c => ({
                    x: ox + c.lx,
                    y: oy + c.ly,
                    hitCount: 0,
                    hasBlood: false
                }));

                // เช็ค safe zone (buffer 2 cell จากผู้เล่น)
                if (cells.some(c => safeSet.has(`${c.x},${c.y}`))) continue;

                // เช็คทับอาหาร
                if (cells.some(c => c.x === food.x && c.y === food.y)) continue;

                // เช็คทับ หรือ ติดกัน (buffer 1 cell) กับ obstacle เดิม
                // ขยาย bounding ออก 1 cell ทุกด้านก่อนเช็ค
                const hasConflict = cells.some(c => {
                    for (let dx = -1; dx <= 1; dx++)
                        for (let dy = -1; dy <= 1; dy++)
                            if (isHitObstacle({ x: c.x + dx, y: c.y + dy })) return true;
                    return false;
                });
                if (hasConflict) continue;

                obstacles.push({ cells });
            }
        }

        function refreshObstacles() {
            // กดได้เฉพาะก่อนเริ่มเดิน (dx===0 && dy===0) เท่านั้น
            if (dx !== 0 || dy !== 0) return;
            spawnObstacles();
            spawnFood();
            draw();
        }

        function spawnEggObj() {
            if (document.getElementById("modeSelect").value === "4") return;
            let maxAttempts = 50;
            for (let i = 0; i < maxAttempts; i++) {
                let fx = Math.floor(Math.random() * tileCount);
                let fy = Math.floor(Math.random() * tileCount);
                if (isHitObstacle({ x: fx, y: fy }) || isHitSelf({ x: fx, y: fy }) ||
                    (food.x === fx && food.y === fy) || isHitPoop({ x: fx, y: fy })) continue;
                eggObj = { type: 'EGG', x: fx, y: fy, timer: 150 };
                return;
            }
        }

