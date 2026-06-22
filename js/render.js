        // ========== DRAW BACKGROUND ENTITIES ==========
        function drawBackgroundEntities() {
            // วาดสิ่งกีดขวาง
            obstacles.forEach(ob => {
                ob.cells.forEach(cell => {
                    let px = cell.x * gridSize;
                    let py = cell.y * gridSize;

                    // สีหิน: เข้มขึ้นตาม hitCount
                    let shade = Math.max(100, 165 - cell.hitCount * 20);
                    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
                    drawRoundedRect(ctx, px, py, gridSize - 1, gridSize - 1, 3);

                    // รอยร้าวแต่ละระดับ เฉพาะ cell นี้
                    if (cell.hitCount > 0) {
                        ctx.strokeStyle = "#333333";
                        ctx.lineWidth = Math.min(cell.hitCount, 3);
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(px + gridSize * 0.15, py + gridSize * 0.15);
                        ctx.lineTo(px + gridSize * 0.50, py + gridSize * 0.55);
                        if (cell.hitCount >= 2) {
                            ctx.moveTo(px + gridSize * 0.80, py + gridSize * 0.20);
                            ctx.lineTo(px + gridSize * 0.45, py + gridSize * 0.60);
                        }
                        if (cell.hitCount >= 3) {
                            ctx.moveTo(px + gridSize * 0.50, py + gridSize * 0.55);
                            ctx.lineTo(px + gridSize * 0.30, py + gridSize * 0.85);
                        }
                        if (cell.hitCount >= 4) {
                            ctx.moveTo(px + gridSize * 0.50, py + gridSize * 0.55);
                            ctx.lineTo(px + gridSize * 0.75, py + gridSize * 0.88);
                        }
                        ctx.stroke();
                    }

                    // เลือดติด cell นี้ (ก่อนถูกทำลาย)
                    if (cell.hasBlood) {
                        ctx.fillStyle = "rgba(139, 0, 0, 0.7)";
                        ctx.beginPath();
                        ctx.arc(px + gridSize / 2, py + gridSize / 2, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            });

            // รอยเลือด
            bloodSpots.forEach(b => {
                ctx.fillStyle = "rgba(139, 0, 0, 0.7)";
                let px = b.x * gridSize, py = b.y * gridSize;
                ctx.beginPath();
                ctx.arc(px + gridSize / 2, py + gridSize / 2, 3, 0, Math.PI * 2);
                ctx.arc(px + gridSize / 2 + 3, py + gridSize / 2 + 2, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            // วาดอึ
            poops.forEach(p => {
                let ratio = p.life / 60;
                let rC = Math.floor(40 + (215 * ratio));
                let gC = Math.floor(40 + (175 * ratio));
                let bC = Math.floor(40 + (-40 * ratio));
                ctx.fillStyle = `rgb(${rC},${gC},${bC})`;
                let px = p.x * gridSize, py = p.y * gridSize, s = gridSize;
                ctx.beginPath(); ctx.ellipse(px + s/2, py + s*0.75, s*0.4, s*0.2, 0, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(px + s/2, py + s*0.5,  s*0.3, s*0.18, 0, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(px + s/2, py + s*0.25, s*0.2, s*0.15, 0, 0, Math.PI*2); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(px + s/2 - s*0.1, py + s*0.25);
                ctx.quadraticCurveTo(px + s/2, py + s*0.05, px + s/2 + s*0.15, py + s*0.15);
                ctx.lineWidth = 4; ctx.strokeStyle = `rgb(${rC},${gC},${bC})`; ctx.lineCap = "round"; ctx.stroke();
            });

            // หัวใจ
            if (extraHeart) {
                let hx = extraHeart.x * gridSize, hy = extraHeart.y * gridSize, size = gridSize;
                if (extraHeart.life <= 15) { hx += (Math.random() * 4 - 2); hy += (Math.random() * 4 - 2); }
                ctx.font = Math.floor(size - 2) + "px Arial";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText("❤️", hx + size/2, hy + size/2 + 2);
            }

            // ไข่และลูกงู
            if (eggObj) {
                if (eggObj.type === 'EGG') {
                    let shakeX = Math.random() * 2 - 1;
                    let shakeY = Math.random() * 2 - 1;
                    let ex = eggObj.x * gridSize + gridSize/2 + shakeX;
                    let ey = eggObj.y * gridSize + gridSize/2 + shakeY;
                    ctx.fillStyle = "#E0F7FA";
                    ctx.beginPath(); ctx.ellipse(ex, ey, gridSize/2 + 2, gridSize/2 - 1, 0, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = "#B2EBF2"; ctx.lineWidth = 2; ctx.stroke();
                } else if (eggObj.type === 'BABY') {
                    eggObj.body.forEach((part, i) => {
                        ctx.fillStyle = "#FFB6C1";
                        drawRoundedRect(ctx, part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2, 3);
                        if (i === 0) {
                            ctx.fillStyle = "#FFFFFF";
                            ctx.beginPath();
                            ctx.arc(part.x * gridSize + 5,  part.y * gridSize + 5, 1.5, 0, Math.PI * 2);
                            ctx.arc(part.x * gridSize + 11, part.y * gridSize + 5, 1.5, 0, Math.PI * 2);
                            ctx.fill();
                            if (eggObj.loveTimer > 0) {
                                ctx.font = "10px Arial";
                                ctx.fillText("❤️", part.x * gridSize + 2, part.y * gridSize - 2);
                            }
                        }
                    });
                }
            }

            // อาหาร (glow ถ้า combo)
            if (comboCount > 0) { ctx.shadowBlur = 10; ctx.shadowColor = "#FF4081"; }
            ctx.fillStyle = "#FFB7B2";
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // AI bodies + HAHA text
            ais.forEach(ai => {
                ai.body.forEach((part, i) => {
                    ctx.fillStyle = ai.color;
                    drawRoundedRect(ctx, part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1, 4);
                    if (i === 0) {
                        ctx.fillStyle = "#FFCAD4";
                        ctx.beginPath();
                        ctx.arc(part.x * gridSize + 5,  part.y * gridSize + 5, 2, 0, Math.PI * 2);
                        ctx.arc(part.x * gridSize + 13, part.y * gridSize + 5, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });

                // วาด HAHA! เหนือหัว AI (ตอน victory lap หรือ hahaTimer ยังเหลือ)
                if (ai.showHaha && ai.body.length > 0) {
                    let hx = ai.body[0].x * gridSize + gridSize / 2;
                    let hy = ai.body[0].y * gridSize - 12;
                    ctx.save();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.font = "bold 14px 'Segoe UI'";
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 3;
                    ctx.strokeText("HAHA!", hx, hy);
                    ctx.fillStyle = "#FF0000";
                    ctx.fillText("HAHA!", hx, hy);
                    ctx.restore();
                }
            });

            drawFloatingTexts();
        }

        // ========== DRAW SNAKE ==========
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackgroundEntities();
            drawSparkles();

            let isHeartGlowing = heartEatTimer > 0;
            let isPoopAura    = poopEatTimer > 0;

            if (isHeartGlowing && isPoopAura) {
                ctx.shadowColor = "#4B0082"; ctx.shadowBlur = 20;
            } else if (isHeartGlowing) {
                ctx.shadowColor = "#FFFF00"; ctx.shadowBlur = 20;
            } else if (comboCount > 0) {
                ctx.shadowBlur = 25;
                ctx.shadowColor = `hsl(${rainbowAuraHue}, 100%, 65%)`;
                rainbowAuraHue = (rainbowAuraHue + 10) % 360;
            } else {
                ctx.shadowBlur = 0;
            }

            snake.forEach((part, i) => {
                if (i > 0 && i < snake.length - 1 &&
                    part.x === snake[i-1].x && part.y === snake[i-1].y &&
                    !part.digesting && !snake[i-1].digesting) return;

                let px = part.x * gridSize;
                let py = part.y * gridSize;
                let isStunned = damageVisualTimer > 0;
                let shakeX = 0, shakeY = 0;

                if (isStunned) {
                    if (stunType === 'SELF') { shakeX = Math.random() * 6 - 3; shakeY = Math.random() * 6 - 3; }
                    else { shakeX = Math.random() * 2 - 1; shakeY = Math.random() * 2 - 1; }
                }
                if (isStarved) { shakeX = Math.random() * 5 - 2.5; shakeY = Math.random() * 5 - 2.5; }
                px += shakeX; py += shakeY;

                let isBulging = part.digesting;
                let size   = isBulging ? gridSize + 6 : gridSize - 1;
                let offset = isBulging ? -3.5 : 0;

                let bodyColor = isHeartGlowing ? "#FF0000" : colors[i % colors.length];
                if (isStunned && stunType === 'SELF') {
                    let ratio = Math.min(selfBiteCount, 5) / 5;
                    let cv = 169 + Math.floor((255 - 169) * ratio);
                    bodyColor = `rgb(${cv},${cv},${cv})`;
                }
                if (isStunned && stunType === 'OBSTACLE') bodyColor = "#A8D8EA";
                if (part.bruiseTimer > 0) {
                    if (part.bruiseTimer > 35) bodyColor = "#C0392B";
                    else if (part.bruiseTimer > 15) bodyColor = "#8B0000";
                    else bodyColor = "#CD5C5C";
                }

                if ((isStarved || isSkullPhase) && snake.length >= 1) {
                    let overdue = stepsSinceLastFood - 100;
                    ctx.globalAlpha = Math.max(0.12, 1 - (overdue / 50));
                }

                ctx.fillStyle = bodyColor;

                // ===== HEAD =====
                if (i === 0) {
                    let drawDx = dx === 0 && dy === 0 ? lastDx : dx;
                    let drawDy = dx === 0 && dy === 0 ? lastDy : dy;

                    ctx.save();
                    ctx.translate(px + gridSize/2, py + gridSize/2);
                    let angle = 0;
                    if (drawDx ===  1) angle = 0;
                    else if (drawDx === -1) angle = Math.PI;
                    else if (drawDy ===  1) angle = Math.PI / 2;
                    else if (drawDy === -1) angle = -Math.PI / 2;
                    ctx.rotate(angle);

                    let headSize = isBulging ? gridSize + 6 : gridSize + 2;
                    let hHalf = headSize / 2;
                    let isEatingPoop = poopEatTimer > 0;
                    let isEatingFood = smileTimer > 0;
                    let isSad       = sadTimer > 0;
                    let isVerySad   = verySadTimer > 0;
                    let poopColorList = ["#8BC34A", "#689F38", "#33691E", "#1B5E20", "#003300"];
                    let drawAsSkull = isStarved && snake.length === 1 && !isSkullPhase && gameState === "DEAD";

                    let headColor;
                    if (drawAsSkull) headColor = "#FFFFFF";
                    else headColor = isEatingPoop ? poopColorList[Math.min(poopsEaten, 4)] : (isHeartGlowing ? "#FF0000" : "#FFCAD4");

                    if (isStunned) {
                        if (stunType === 'WALL') headColor = "#FF0000";
                        else if (stunType === 'OBSTACLE') headColor = "#7EC8E3";
                        else if (stunType === 'SELF') {
                            let ratio = Math.min(selfBiteCount, 5) / 5;
                            let cv = 169 + Math.floor((255 - 169) * ratio);
                            headColor = `rgb(${cv},${cv},${cv})`;
                        }
                    }
                    if (isStarved && !drawAsSkull) headColor = isHeartGlowing ? "#FF0000" : colors[0];

                    // ลิ้น
                    if (!isEatingFood && !isEatingPoop && !isSad && !isVerySad && !drawAsSkull) {
                        ctx.fillStyle = "#FF0000";
                        ctx.beginPath();
                        ctx.moveTo(hHalf - 2, -1.5);
                        ctx.lineTo(hHalf + 10, -1.5);
                        ctx.lineTo(hHalf + 14, -4);
                        ctx.lineTo(hHalf + 12,  0);
                        ctx.lineTo(hHalf + 14,  4);
                        ctx.lineTo(hHalf + 10,  1.5);
                        ctx.lineTo(hHalf - 2,   1.5);
                        ctx.fill();
                    }

                    // หัว
                    ctx.fillStyle = headColor;
                    ctx.beginPath();
                    if (drawAsSkull) {
                        ctx.arc(0, -2, hHalf, Math.PI, 0);
                        ctx.lineTo(hHalf - 2, hHalf);
                        ctx.lineTo(-hHalf + 2, hHalf);
                    } else {
                        ctx.moveTo(-hHalf, -hHalf - 1);
                        ctx.lineTo(hHalf - 4, -hHalf + 2);
                        ctx.lineTo(hHalf + 2, 0);
                        ctx.lineTo(hHalf - 4, hHalf - 2);
                        ctx.lineTo(-hHalf, hHalf + 1);
                    }
                    ctx.closePath();

                    if ((isStarved || isSkullPhase) && snake.length >= 1) {
                        let blinkAlpha = (isSkullPhase && Math.floor(Date.now() / 250) % 2 === 0) ? 0.3 : 1;
                        let overdue2   = stepsSinceLastFood - 100;
                        let starveAlpha = !isSkullPhase ? Math.max(0.12, 1 - (overdue2 / 50)) : 1;
                        if (drawAsSkull) starveAlpha = 1;
                        ctx.globalAlpha = 1;
                        ctx.strokeStyle = "rgba(100,60,60,0.55)"; ctx.lineWidth = 1.5; ctx.stroke();
                        ctx.globalAlpha = blinkAlpha * starveAlpha;
                    }
                    ctx.fill();

                    if (drawAsSkull) {
                        ctx.strokeStyle = "#000000"; ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.moveTo(-hHalf, -hHalf - 1); ctx.lineTo(hHalf - 4, -hHalf + 2);
                        ctx.lineTo(hHalf + 2, 0); ctx.lineTo(hHalf - 4, hHalf - 2); ctx.lineTo(-hHalf, hHalf + 1);
                        ctx.closePath(); ctx.stroke();
                    }

                    if (snake[0] && snake[0].bloodTimer > 0) {
                        ctx.fillStyle = "rgba(139, 0, 0, 0.8)";
                        ctx.beginPath();
                        ctx.arc(-hHalf + 2, -hHalf + 2, 2, 0, Math.PI * 2);
                        ctx.arc(hHalf - 3, hHalf - 2, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // ตา / อารมณ์
                    if (drawAsSkull) {
                        ctx.fillStyle = "#000000";
                        ctx.beginPath(); ctx.arc(0, -hHalf + 3, 3, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(0,  hHalf - 3, 3, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(3, -1); ctx.lineTo(1, 0); ctx.lineTo(3, 1); ctx.fill();
                        ctx.strokeStyle = "#000000"; ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(hHalf - 4, -2.5); ctx.lineTo(hHalf - 4, 2.5);
                        ctx.moveTo(hHalf - 6, -2.5); ctx.lineTo(hHalf - 6, 2.5);
                        ctx.moveTo(hHalf - 2, -2.5); ctx.lineTo(hHalf - 2, 2.5);
                        ctx.stroke();
                    } else if (isVerySad || isSad) {
                        ctx.strokeStyle = "#2E3D30"; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(0, -hHalf + 2); ctx.lineTo(3, -hHalf + 5); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(3, hHalf - 2); ctx.lineTo(0, hHalf - 5); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(hHalf - 2, -3); ctx.quadraticCurveTo(hHalf - 6, 0, hHalf - 2, 3); ctx.stroke();
                        if (isVerySad) {
                            ctx.fillStyle = "#4a90e2";
                            ctx.beginPath(); ctx.arc(1, -hHalf + 6, 1.5, 0, Math.PI * 2); ctx.fill();
                            ctx.beginPath(); ctx.arc(1,  hHalf - 6, 1.5, 0, Math.PI * 2); ctx.fill();
                        }
                    } else if (isEatingPoop) {
                        ctx.strokeStyle = "#FFFF00"; ctx.lineWidth = 2.5;
                        ctx.beginPath(); ctx.moveTo(-2, -hHalf + 6); ctx.lineTo(3, -hHalf + 3.5); ctx.lineTo(-2, -hHalf + 1); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(3, hHalf - 6);   ctx.lineTo(-2, hHalf - 3.5); ctx.lineTo(3, hHalf - 1); ctx.stroke();
                    } else if (eggObj && eggObj.type === 'BABY') {
                        ctx.save(); ctx.rotate(-angle);
                        ctx.font = "8px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                        ctx.fillText("❤️", -3, -6); ctx.fillText("❤️", -3, 6);
                        ctx.restore();
                    } else {
                        let eIdx = Math.min(Math.floor(foodEatenCount / 15), eyeColorsProgression.length - 1);
                        ctx.fillStyle = isHeartGlowing ? "#FFFF00" : eyeColorsProgression[eIdx];
                        ctx.beginPath(); ctx.arc(0, -hHalf + 3, 2.5, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(0,  hHalf - 3, 2.5, 0, Math.PI * 2); ctx.fill();
                    }

                    // รอยยิ้ม
                    if (isEatingFood) {
                        ctx.strokeStyle = isHeartGlowing ? "#FFD700" : "#D68C9A"; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(hHalf - 6, -hHalf + 2); ctx.quadraticCurveTo(hHalf - 1, -hHalf + 5, hHalf - 3, -hHalf + 9); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(hHalf - 6, hHalf - 2);  ctx.quadraticCurveTo(hHalf - 1, hHalf - 5,  hHalf - 3, hHalf - 9); ctx.stroke();
                    }

                    ctx.restore();
                    if (eggObj && !isSad && !isVerySad) { ctx.font = "10px Arial"; ctx.fillText("💕", px - 5, py - 5); }

                // ===== TAIL =====
                } else if (i === snake.length - 1 && snake.length > 1) {
                    let prev = snake[i - 1];
                    let dirX = prev ? prev.x - part.x : 1;
                    let dirY = prev ? prev.y - part.y : 0;
                    if (dirX > 1) dirX = -1; else if (dirX < -1) dirX = 1;
                    if (dirY > 1) dirY = -1; else if (dirY < -1) dirY = 1;
                    ctx.beginPath();
                    if (dirX === 1) {
                        ctx.moveTo(px + offset + size, py + offset);
                        ctx.lineTo(px + offset, py + offset + size/2);
                        ctx.lineTo(px + offset + size, py + offset + size);
                    } else if (dirX === -1) {
                        ctx.moveTo(px + offset, py + offset);
                        ctx.lineTo(px + offset + size, py + offset + size/2);
                        ctx.lineTo(px + offset, py + offset + size);
                    } else if (dirY === 1) {
                        ctx.moveTo(px + offset, py + offset + size);
                        ctx.lineTo(px + offset + size/2, py + offset);
                        ctx.lineTo(px + offset + size, py + offset + size);
                    } else {
                        ctx.moveTo(px + offset, py + offset);
                        ctx.lineTo(px + offset + size, py + offset);
                        ctx.lineTo(px + offset + size/2, py + offset + size);
                    }
                    ctx.closePath();
                    if ((isStarved || isSkullPhase) && snake.length > 1) {
                        ctx.globalAlpha = 1;
                        ctx.strokeStyle = "rgba(100,60,60,0.55)"; ctx.lineWidth = 1.5; ctx.stroke();
                        let overdue2 = stepsSinceLastFood - 100;
                        ctx.globalAlpha = Math.max(0.12, 1 - (overdue2 / 50));
                    }
                    ctx.fill();

                // ===== BODY =====
                } else {
                    if ((isStarved || isSkullPhase) && snake.length > 1) {
                        ctx.globalAlpha = 1;
                        ctx.strokeStyle = "rgba(100,60,60,0.55)"; ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        drawRoundedRect(ctx, px + offset, py + offset, size, size, 4);
                        ctx.stroke();
                        let overdue2 = stepsSinceLastFood - 100;
                        ctx.globalAlpha = Math.max(0.12, 1 - (overdue2 / 50));
                    }
                    drawRoundedRect(ctx, px + offset, py + offset, size, size, 4);

                    ctx.fillStyle = isHeartGlowing ? "rgba(100, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.08)";
                    let prev = snake[i - 1];
                    let segDx = prev ? prev.x - part.x : 0;
                    let segDy = prev ? prev.y - part.y : -1;
                    if (segDx > 1) segDx = -1; else if (segDx < -1) segDx = 1;
                    if (segDy > 1) segDy = -1; else if (segDy < -1) segDy = 1;
                    if (segDx !== 0) {
                        ctx.fillRect(px + offset, py + offset + 4, size, 1.5);
                        ctx.fillRect(px + offset, py + offset + size - 5.5, size, 1.5);
                    } else {
                        ctx.fillRect(px + offset + 4, py + offset, 1.5, size);
                        ctx.fillRect(px + offset + size - 5.5, py + offset, 1.5, size);
                    }
                }
            });

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

