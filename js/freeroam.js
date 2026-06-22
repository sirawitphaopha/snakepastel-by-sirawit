        // ========== FREE ROAM ==========
        function triggerFreeRoam() {
            gameState = "FREEROAM";
            saveScore();
            clearTimeout(gameLoop);

            setTimeout(() => {
                alert("ยินดีด้วยค่ะ! เคลียร์ด่านแล้ว ตัวยาวคับจอจนทนไม่ไหว น้องขออนุญาตพังกรอบออกมาวิ่งเล่นข้างนอกนะคะ 🐍✨ (บังคับทิศทางต่อได้เลย!)");

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBackgroundEntities();
                canvas.style.opacity = "0.3";

                const rect  = canvas.getBoundingClientRect();
                const cellW = rect.width  / tileCount;
                const cellH = rect.height / tileCount;

                freeRoamSnake = snake.map(part => ({
                    px: rect.left + (part.x * cellW),
                    py: rect.top  + (part.y * cellH),
                    w: cellW, h: cellH, digesting: false
                }));

                if (dx === 0 && dy === 0) { dx = lastDx; dy = lastDy; }
                runFreeRoamLoop();
            }, 10);
        }

        function runFreeRoamLoop() {
            if (gameState !== "FREEROAM") return;

            freeRoamLoop = setTimeout(() => {
                changingDir = false;
                const headW = freeRoamSnake[0].w;
                const headH = freeRoamSnake[0].h;
                let nextPx = freeRoamSnake[0].px + (dx * headW);
                let nextPy = freeRoamSnake[0].py + (dy * headH);

                if (nextPx > window.innerWidth)  nextPx = -headW;
                else if (nextPx < -headW)         nextPx = window.innerWidth;
                if (nextPy > window.innerHeight)  nextPy = -headH;
                else if (nextPy < -headH)         nextPy = window.innerHeight;

                freeRoamSnake.unshift({ px: nextPx, py: nextPy, w: headW, h: headH, digesting: false });
                freeRoamSnake.pop();

                const resetBtn = document.getElementById("resetBtn").getBoundingClientRect();
                let headCenterPx = nextPx + headW / 2;
                let headCenterPy = nextPy + headH / 2;
                if (headCenterPx > resetBtn.left && headCenterPx < resetBtn.right &&
                    headCenterPy > resetBtn.top  && headCenterPy < resetBtn.bottom) {
                    initGame(true);
                    return;
                }

                renderFreeRoamSnake();
                runFreeRoamLoop();
            }, currentSpeed);
        }

        function renderFreeRoamSnake() {
            const container = document.getElementById("freeRoamContainer");
            container.innerHTML = "";

            freeRoamSnake.forEach((part, i) => {
                let div = document.createElement("div");
                div.style.position = "absolute";
                div.style.left = part.px + "px";
                div.style.top  = part.py + "px";

                let w = part.w, h = part.h;
                if (i === 0) {
                    w *= 1.2; h *= 1.2;
                    div.style.borderRadius = "30% 60% 60% 30%";
                } else if (i === freeRoamSnake.length - 1) {
                    div.style.borderRadius = "50% 50% 50% 0";
                } else {
                    div.style.borderRadius = "4px";
                }

                div.style.width           = w + "px";
                div.style.height          = h + "px";
                div.style.backgroundColor = colors[i % colors.length];
                div.style.boxShadow       = "0 2px 5px rgba(0,0,0,0.2)";

                if (i === 0) {
                    div.style.backgroundColor = "#B5E2FA";
                    div.style.zIndex = "100";
                    let eyeSize   = part.w * 0.15;
                    let eyeOffset = part.w * 0.25;
                    let eye1 = document.createElement("div");
                    let eye2 = document.createElement("div");
                    let eIdx   = Math.min(Math.floor(foodEatenCount / 15), eyeColorsProgression.length - 1);
                    let eColor = eyeColorsProgression[eIdx];

                    [eye1, eye2].forEach(e => {
                        e.style.position        = "absolute";
                        e.style.backgroundColor = eColor;
                        e.style.width           = eyeSize + "px";
                        e.style.height          = eyeSize + "px";
                        e.style.borderRadius    = "50%";
                    });

                    let drawDx = dx === 0 && dy === 0 ? lastDx : dx;
                    let drawDy = dx === 0 && dy === 0 ? lastDy : dy;

                    if (drawDx === 0 && drawDy === -1) {
                        div.style.borderRadius = "60% 60% 30% 30%";
                        eye1.style.top = eyeOffset+"px"; eye1.style.left  = eyeOffset+"px";
                        eye2.style.top = eyeOffset+"px"; eye2.style.right = eyeOffset+"px";
                    } else if (drawDx === 0 && drawDy === 1) {
                        div.style.borderRadius = "30% 30% 60% 60%";
                        eye1.style.bottom = eyeOffset+"px"; eye1.style.left  = eyeOffset+"px";
                        eye2.style.bottom = eyeOffset+"px"; eye2.style.right = eyeOffset+"px";
                    } else if (drawDx === -1 && drawDy === 0) {
                        div.style.borderRadius = "60% 30% 30% 60%";
                        eye1.style.top    = eyeOffset+"px"; eye1.style.left = eyeOffset+"px";
                        eye2.style.bottom = eyeOffset+"px"; eye2.style.left = eyeOffset+"px";
                    } else {
                        div.style.borderRadius = "30% 60% 60% 30%";
                        eye1.style.top    = eyeOffset+"px"; eye1.style.right = eyeOffset+"px";
                        eye2.style.bottom = eyeOffset+"px"; eye2.style.right = eyeOffset+"px";
                    }

                    div.appendChild(eye1);
                    div.appendChild(eye2);
                }
                container.appendChild(div);
            });
        }

