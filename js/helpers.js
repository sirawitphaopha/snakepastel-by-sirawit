        // ========== HELPER FUNCTIONS ==========
        function drawRoundedRect(context, x, y, width, height, radius) {
            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();
            context.fill();
        }

        function isHitObstacle(point) {
            return obstacles.some(ob =>
                ob.cells.some(c => c.x === point.x && c.y === point.y)
            );
        }

        // หา obstacle + cell ที่ตรงตำแหน่ง
        function findHitCell(point) {
            for (let ob of obstacles) {
                let cell = ob.cells.find(c => c.x === point.x && c.y === point.y);
                if (cell) return { ob, cell };
            }
            return null;
        }

        // เช็ค connectivity ใน local coords (สำหรับ shape generation)
        function isLocalConnected(cells) {
            if (cells.length === 0) return false;
            let visited = new Set();
            let queue = [cells[0]];
            visited.add(`${cells[0].lx},${cells[0].ly}`);
            while (queue.length > 0) {
                let cur = queue.shift();
                for (let d of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]) {
                    let nx = cur.lx + d.x, ny = cur.ly + d.y;
                    let key = `${nx},${ny}`;
                    if (!visited.has(key) && cells.some(c => c.lx === nx && c.ly === ny)) {
                        visited.add(key);
                        queue.push({ lx: nx, ly: ny });
                    }
                }
            }
            return visited.size === cells.length;
        }

        // เช็คว่า empty cell ทุกตัวใน bounding box flood fill ออกนอกขอบได้
        // ตรวจ 2 เงื่อนไข: ไม่มี enclosed space + ไม่มี 1-cell-wide constriction
        function isValidEmptySpace(filledCells, w, h) {
            const filledSet = new Set(filledCells.map(c => `${c.lx},${c.ly}`));

            const empties = [];
            for (let ly = 0; ly < h; ly++)
                for (let lx = 0; lx < w; lx++)
                    if (!filledSet.has(`${lx},${ly}`)) empties.push({ lx, ly });

            if (empties.length === 0) return true;

            // CHECK 1: ไม่มี enclosed empty space (flood fill จากขอบ)
            const reachable = new Set();
            const queue = [];
            for (const ec of empties) {
                if (ec.lx === 0 || ec.lx === w-1 || ec.ly === 0 || ec.ly === h-1) {
                    const k = `${ec.lx},${ec.ly}`;
                    if (!reachable.has(k)) { reachable.add(k); queue.push(ec); }
                }
            }
            while (queue.length > 0) {
                const cur = queue.shift();
                for (const d of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]) {
                    const nx = cur.lx + d.x, ny = cur.ly + d.y;
                    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                    const k = `${nx},${ny}`;
                    if (!reachable.has(k) && !filledSet.has(k)) { reachable.add(k); queue.push({ lx: nx, ly: ny }); }
                }
            }
            if (!empties.every(ec => reachable.has(`${ec.lx},${ec.ly}`))) return false;

            // CHECK 2: ไม่มี 1-cell-wide constriction
            // empty cell ที่ถูกล้อม in-box-filled ทั้งซ้าย+ขวา หรือ บน+ล่าง = ทางแคบเกิน
            for (const { lx, ly } of empties) {
                const leftFilled  = lx > 0     && filledSet.has(`${lx-1},${ly}`);
                const rightFilled = lx < w - 1 && filledSet.has(`${lx+1},${ly}`);
                const topFilled   = ly > 0     && filledSet.has(`${lx},${ly-1}`);
                const botFilled   = ly < h - 1 && filledSet.has(`${lx},${ly+1}`);
                if ((leftFilled && rightFilled) || (topFilled && botFilled)) return false;
            }

            return true;
        }

        // สร้างรูปร่างสุ่มใน bounding box w×h — คืน array local cells หรือ null ถ้าไม่ผ่าน
        function generateObstacleShape(w, h) {
            for (let attempt = 0; attempt < 400; attempt++) {
                let cells = [];
                for (let ly = 0; ly < h; ly++)
                    for (let lx = 0; lx < w; lx++)
                        if (Math.random() < 0.6) cells.push({ lx, ly });
                if (cells.length < 3) continue;
                if (!isLocalConnected(cells)) continue;
                if (!isValidEmptySpace(cells, w, h)) continue;
                return cells;
            }
            return null;
        }

        // แบ่ง map-coord cells ออกเป็นกลุ่ม connected
        function getConnectedGroups(cells) {
            let visited = new Set();
            let groups = [];
            for (let cell of cells) {
                let key = `${cell.x},${cell.y}`;
                if (visited.has(key)) continue;
                let group = [];
                let queue = [cell];
                while (queue.length > 0) {
                    let cur = queue.shift();
                    let curKey = `${cur.x},${cur.y}`;
                    if (visited.has(curKey)) continue;
                    visited.add(curKey);
                    group.push(cur);
                    for (let d of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]) {
                        let nx = cur.x + d.x, ny = cur.y + d.y;
                        let nb = cells.find(c => c.x === nx && c.y === ny);
                        if (nb && !visited.has(`${nx},${ny}`)) queue.push(nb);
                    }
                }
                groups.push(group);
            }
            return groups;
        }

        function isHitSelf(point) {
            return snake.some(part => part.x === point.x && part.y === point.y);
        }

        function isHitPoop(point) {
            return poops.some(p => p.x === point.x && p.y === point.y);
        }

