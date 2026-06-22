                // ========== SPARKLES & FLOATING TEXT ==========
        function createSparkles(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                sparkles.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    size: Math.random() * 4 + 2,
                    life: 1,
                    color: color
                });
            }
        }

        function drawSparkles() {
            for (let i = sparkles.length - 1; i >= 0; i--) {
                let s = sparkles[i];
                s.x += s.vx;
                s.y += s.vy;
                s.life -= 0.03;
                if (s.life <= 0) { sparkles.splice(i, 1); continue; }
                ctx.globalAlpha = s.life;
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        function showComboText(count) {
            createSparkles(
                snake[0].x * gridSize + gridSize / 2,
                snake[0].y * gridSize + gridSize / 2,
                "#FF4081", 15
            );
            floatingTexts.push({
                text: `COMBO x${count + 1}!`,
                x: snake[0].x * gridSize + gridSize / 2,
                y: snake[0].y * gridSize,
                life: 1.0,
                color: `hsl(${rainbowAuraHue}, 100%, 50%)`
            });
        }

        function drawFloatingTexts() {
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                let ft = floatingTexts[i];
                ctx.globalAlpha = ft.life;
                ctx.fillStyle = ft.color;
                ctx.font = "bold 20px 'Segoe UI'";
                ctx.textAlign = "center";
                ctx.fillText(ft.text, ft.x, ft.y);
                ft.y -= 1;
                ft.life -= 0.02;
                if (ft.life <= 0) floatingTexts.splice(i, 1);
            }
            ctx.globalAlpha = 1.0;
        }

