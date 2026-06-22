        // ========== EGG / BABY SYSTEM ==========
        function updateEgg() {
            if (!eggObj) return;

            if (eggObj.type === 'EGG') {
                eggObj.timer--;
                if (eggObj.timer <= 0) {
                    eggObj = {
                        type: 'BABY',
                        body: [{ x: eggObj.x, y: eggObj.y }, { x: eggObj.x, y: eggObj.y }],
                        dx: 1, dy: 0,
                        foodEaten: 0,
                        accum: 0,
                        loveTimer: 0,
                        escaping: false
                    };
                }
            } else if (eggObj.type === 'BABY') {
                eggObj.accum += 1.5;
                while (eggObj.accum >= 1) {
                    eggObj.accum -= 1;
                    if (eggObj.loveTimer > 0) eggObj.loveTimer--;

                    let head = eggObj.body[0];
                    if (eggObj.escaping && (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount)) {
                        eggObj.body.pop();
                        if (eggObj.body.length === 0) eggObj = null;
                        return;
                    }

                    let targetX = food.x, targetY = food.y;
                    if (eggObj.escaping) { targetX = 20; targetY = head.y; }

                    let possibleMoves = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
                    let safeMoves = [];
                    let hitPlayerMove = null;

                    for (let m of possibleMoves) {
                        if (m.x === -eggObj.dx && m.y === -eggObj.dy && eggObj.body.length > 1) continue;
                        let nx = head.x + m.x, ny = head.y + m.y;
                        if (!eggObj.escaping && (nx < 0 || nx >= tileCount || ny < 0 || ny >= tileCount)) continue;
                        if (isHitObstacle({ x: nx, y: ny })) continue;
                        if (eggObj.body.some(p => p.x === nx && p.y === ny)) continue;
                        if (snake.some(p => p.x === nx && p.y === ny)) { hitPlayerMove = m; continue; }
                        safeMoves.push(m);
                    }

                    let chosenMove = null;
                    if (safeMoves.length > 0) {
                        if (hitPlayerMove && Math.random() < 0.2) {
                            eggObj.loveTimer = 15;
                            eggObj.dx = hitPlayerMove.x; eggObj.dy = hitPlayerMove.y;
                            continue;
                        } else {
                            safeMoves.sort((a, b) => {
                                let d1 = Math.abs(head.x + a.x - targetX) + Math.abs(head.y + a.y - targetY);
                                let d2 = Math.abs(head.x + b.x - targetX) + Math.abs(head.y + b.y - targetY);
                                return d1 - d2;
                            });
                            chosenMove = safeMoves[0];
                        }
                    } else if (hitPlayerMove) {
                        eggObj.loveTimer = 15;
                        eggObj.dx = hitPlayerMove.x; eggObj.dy = hitPlayerMove.y;
                        continue;
                    } else { continue; }

                    eggObj.dx = chosenMove.x; eggObj.dy = chosenMove.y;
                    let nx = head.x + eggObj.dx, ny = head.y + eggObj.dy;
                    eggObj.body.unshift({ x: nx, y: ny });

                    if (!eggObj.escaping && nx === food.x && ny === food.y) {
                        eggObj.foodEaten++;
                        spawnFood();
                        if (eggObj.foodEaten >= 10) eggObj.escaping = true;
                    } else {
                        if (!eggObj.escaping) eggObj.body.pop();
                        else { if (eggObj.body.length > 10) eggObj.body.pop(); eggObj.body.pop(); }
                    }
                }
            }
        }

