        // ========== KEYBOARD HANDLER ==========
        document.addEventListener("keydown", e => {
            if (document.activeElement.id === "snakeNameInput") {
                if (e.code === "Enter") document.activeElement.blur();
                return;
            }

            // ปุ่มทิศทาง (Arrow + WASD)
            if (e.code === "ArrowUp"    || e.key === "w" || e.key === "W") { e.preventDefault(); setDir(0, -1); return; }
            if (e.code === "ArrowDown"  || e.key === "s" || e.key === "S") { e.preventDefault(); setDir(0,  1); return; }
            if (e.code === "ArrowLeft"  || e.key === "a" || e.key === "A") { e.preventDefault(); setDir(-1, 0); return; }
            if (e.code === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); setDir(1,  0); return; }

            // Spacebar: หยุด/เล่นต่อ
            if (e.code === "Space") { e.preventDefault(); togglePause(); return; }

            // Enter: รีสตาร์ทเมื่อตาย
            if (e.code === "Enter") {
                e.preventDefault();
                if (gameState === "DEAD") initGame(true);
                return;
            }

            // Shift: สุ่มหินใหม่ (เฉพาะก่อนเริ่มเดิน)
            if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
                if (dx === 0 && dy === 0 && gameState === "PLAYING") refreshObstacles();
                return;
            }

            // เฉพาะตัวเลขและ l สำหรับสูตรลับ
            let key = e.key.toLowerCase();
            if (!"0123456789l".includes(key)) return;

            cheatBuffer += key;
            if (cheatBuffer.length > 8) cheatBuffer = cheatBuffer.slice(-8);

            let cheatDisplay  = document.getElementById("cheatDisplay");
            let cheatCodeText = document.getElementById("cheatCodeText");
            if (cheatDisplay) {
                cheatDisplay.style.display = "block";
                cheatCodeText.innerText = cheatBuffer;
            }

            if (cheatTimer) clearTimeout(cheatTimer);
            cheatTimer = setTimeout(() => {
                cheatBuffer = "";
                if (cheatDisplay) cheatDisplay.style.display = "none";
            }, 1500);

            // 1010: หัวใจเต็ม + ล้างพิษ
            if (cheatBuffer.includes("1010")) {
                cheatBuffer = "";
                setTimeout(() => {
                    lives = MAX_LIVES; poopsEaten = 0; updateStats();
                    if (cheatDisplay) cheatDisplay.style.display = "none";
                    alert("❤️ ปลดล็อกสูตรลับ! หัวใจเด้งเต็มหลอด 10 ดวงและล้างพิษเรียบร้อยค่ะ!");
                }, 500);
            }

            // 6666: เข้าสู่โหมดหิวทันที
            if (cheatBuffer.includes("6666") && (gameState === "PLAYING" || gameState === "PAUSED")) {
                cheatBuffer = "";
                setTimeout(() => {
                    if (cheatDisplay) cheatDisplay.style.display = "none";
                    stepsSinceLastFood = 100;
                }, 500);
            }

            // ll[N]: ตั้งความยาวงู
            let match = cheatBuffer.match(/ll(\d+)/);
            if (match && (gameState === "PLAYING" || gameState === "PAUSED")) {
                let mode = document.getElementById("modeSelect").value;
                if (["0", "1", "3"].includes(mode)) {
                    let targetBodyLen  = parseInt(match[1]);
                    let targetTotalLen = targetBodyLen + 1;
                    let diff = targetTotalLen - snake.length;
                    if (diff > 0) {
                        for (let i = 0; i < diff; i++) {
                            let t = snake[snake.length - 1];
                            snake.push({ x: t.x, y: t.y, digesting: false, bruiseTimer: 0, bloodTimer: 0 });
                        }
                        foodEatenCount += diff;
                        if (mode === "3") {
                            let speedLvl = Math.floor(foodEatenCount / 30);
                            if (speedLvl > 14) speedLvl = 14;
                            currentSpeed = 150 - (speedLvl * 7.85);
                        }
                    }
                }
                // clear buffer หลัง match สำเร็จเสมอ
                cheatBuffer = "";
                if (cheatCodeText) cheatCodeText.innerText = "";
                if (cheatDisplay) cheatDisplay.style.display = "none";
            }

            // 9928: กินอาหารครั้งต่อไปแล้วพังกรอบ
            if (cheatBuffer.includes("9928") && (gameState === "PLAYING" || gameState === "PAUSED")) {
                cheatBuffer = "";
                setTimeout(() => {
                    cheatWinActivated = true;
                    if (cheatDisplay) cheatDisplay.style.display = "none";
                    alert("🤫 สูตรลัด 9928 ทำงาน! เลื้อยไปกินอาหารชิ้นต่อไปเพื่อน้องงูจะพังด่านออกมาเลยค่ะ!");
                }, 500);
            }

            // 1111: ระเบิดงูทันที ทุกด่าน
            if (cheatBuffer.includes("1111")) {
                cheatBuffer = "";
                if (cheatDisplay) cheatDisplay.style.display = "none";
                explodeSnake(
                    ['#FF69B4','#FF1493','#FF6347','#FFD700','#FF4500'],
                    "💥 สูตรลับ 1111 — ระเบิดตัวเอง!"
                );
            }

            // 6969: เสกไข่ ทุกด่าน กดตอนไหนก็ได้
            if (cheatBuffer.includes("6969")) {
                cheatBuffer = "";
                if (cheatDisplay) cheatDisplay.style.display = "none";
                // bypass mode check — ใช้ได้ทุกด่านรวม mode 4
                if (!eggObj) {
                    let placed = false;
                    for (let i = 0; i < 50; i++) {
                        let fx = Math.floor(Math.random() * tileCount);
                        let fy = Math.floor(Math.random() * tileCount);
                        if (isHitObstacle({x:fx,y:fy}) || isHitSelf({x:fx,y:fy}) ||
                            (food.x===fx && food.y===fy) || isHitPoop({x:fx,y:fy})) continue;
                        eggObj = { type: 'EGG', x: fx, y: fy, timer: 150 };
                        placed = true;
                        break;
                    }
                    if (!placed) alert("🥚 ไม่มีที่ว่างวางไข่ค่ะ!");
                } else {
                    alert("🥚 มีไข่อยู่แล้วค่ะ!");
                }
            }
        });

