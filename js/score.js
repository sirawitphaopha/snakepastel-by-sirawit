        // ========== SCORE / LEADERBOARD ==========
        function saveScore() {
            if (score === 0) return;
            let sName = document.getElementById("snakeNameInput").value.trim();
            if (!sName) sName = "น้องงูไร้นาม";

            highScores.push({
                name: sName,
                score: score,
                steps: totalSteps,
                poops: totalPoopsEatenSession,
                hearts: heartsEatenSession
            });
            highScores.sort((a, b) => b.score - a.score);
            highScores = highScores.slice(0, 5);
            localStorage.setItem('pastelSnakeScores', JSON.stringify(highScores));
            renderLeaderboard();
        }

        function renderLeaderboard() {
            const listHTML = document.getElementById("scoreListHTML");
            listHTML.innerHTML = "";
            for (let i = 0; i < 5; i++) {
                let item = highScores[i];
                let li = document.createElement("li");
                if (item) {
                    li.innerHTML = `
                        <span style="flex: 1; text-align: left;">${i + 1}. ${item.name}</span>
                        <div style="display: flex; gap: 6px; align-items: center; font-size: 11px;">
                            <span style="font-weight:bold; color:#E63946;">${item.score}</span>
                            <span>👟${item.steps || 0}</span>
                            <span>💩${item.poops || 0}</span>
                            <span>❤️${item.hearts || 0}</span>
                        </div>`;
                } else {
                    li.innerHTML = `<span>${i + 1}. -</span><span>0</span>`;
                }
                listHTML.appendChild(li);
            }
        }

        function loadScores() {
            try {
                let saved = localStorage.getItem('pastelSnakeScores');
                if (saved) {
                    highScores = JSON.parse(saved);
                    renderLeaderboard();
                }
            } catch (e) {
                console.error("Error loading scores:", e);
                highScores = [];
            }
        }

        function updateStats() {
            const scoreEl = document.getElementById("scoreText");
            const livesEl = document.getElementById("livesText");
            const toxEl   = document.getElementById("toxText");
            const stepsEl = document.getElementById("stepsText");

            if (scoreEl) {
                scoreEl.innerText = score;
                if (comboCount > 0) {
                    scoreEl.innerHTML += ` <span style="color:#FF4081; font-size:12px; font-weight:bold;">x${comboCount + 1} Combo!</span>`;
                }
            }
            if (livesEl) {
                let safeLives = Math.max(0, lives);
                let heartStr = "❤️".repeat(safeLives);
                if (safeLives < 10) heartStr += "🖤".repeat(10 - safeLives);
                livesEl.innerText = `${safeLives}/10 ` + heartStr;
            }
            if (toxEl) {
                let toxStr = "สะอาด ✨";
                if (poopsEaten === 1) toxStr = "เริ่มปวดท้อง 🤢";
                else if (poopsEaten === 2) toxStr = "พะอืดพะอม 🤢";
                else if (poopsEaten === 3) toxStr = "ท้องเสีย 🤮";
                else if (poopsEaten === 4) toxStr = "วิกฤต!! 💩🆘";
                toxEl.innerText = `${poopsEaten}/5 ${toxStr}`;
            }
            if (stepsEl) stepsEl.innerText = totalSteps;
        }

        function updateInstructions() {
            const select  = document.getElementById("modeSelect");
            const content = document.getElementById("instructionContent");
            if (!select || !content) return;

            const mode = select.value;
            let text = "";
            switch (mode) {
                case "0":
                    text = "<b>ดั้งเดิม:</b><br>- เลื้อยกินอาหารทำคะแนน ห้ามชนกำแพงขอบจอหรือลำตัวตัวเองเด็ดขาด<br>- <b>ระวังอึ!</b> งูจะขับถ่ายอึออกมาเมื่อกินอาหารครบทุก 5 คำ หากเผลอกินตัวจะสั้นลง และถ้ารับพิษครบ 5 ก้อน ตัวจะแตกตาย!<br>- <b>ระบบครอบครัว:</b> กินครบทุก 100 คำงูจะวางไข่ 1 ฟอง 🥚 ห้ามกินเด็ดขาด รอลูกงูฟักออกมาแล้วดูแลให้ดีล่ะ!";
                    break;
                case "1":
                    text = "<b>วาร์ปทะลุกำแพง:</b><br>- กติกาเหมือนโหมดดั้งเดิม แต่สามารถเลื้อยทะลุขอบจอไปโผล่อีกฝั่งได้<br>- มีระบบอึงูและระบบฟักไข่เช่นกัน";
                    break;
                case "2":
                    text = "<b>สิ่งกีดขวางแบบสุ่ม:</b><br>- จะมีบล็อกหินขนาดสุ่มเกิดกระจายทั่วแมพ ห้ามเลื้อยชนเด็ดขาด<br>- สามารถกดปุ่ม 'สุ่มลายหิน' หรือปุ่ม <b>Shift</b> เพื่อเปลี่ยนจุดเกิดหินได้ก่อนเริ่มเดิน<br>- มีระบบอึงูและระบบฟักไข่เช่นกัน";
                    break;
                case "3":
                    text = "<b>ยิ่งกินยิ่งซิ่ง:</b><br>- โหมดสุดฮาร์ดคอร์ ความเร็วของเกมจะค่อยๆ เพิ่มขึ้นทุกๆ อาหาร 30 ชิ้น (อัปเกรดความเร็วได้สูงสุด 15 ระดับ) ท้าทายสมาธิสุดๆ<br>- มีระบบอึงูและระบบฟักไข่เช่นกัน";
                    break;
                case "4":
                    text = "<b>ศึกชิงแชมป์ (เจอ AI 🤖):</b><br>- โหมดเน้นต่อสู้! ตัวเราจะยาวได้สูงสุด <b>20 ช่อง</b><br>- <b>คลื่นศัตรู:</b> AI จะเกิดจากขอบจอเมื่อเราเริ่มเดิน เริ่มจาก 1 ตัว ไปจนถึง 5 ตัว เมื่อปราบหมดเวฟ จะวนกลับมา 1 ตัวใหม่<br>- <b>โจมตี:</b> เอาหัวเราพุ่งชน AI ตรงไหนก็ได้ AI จะตัวสั้นลง<br>- <b>โดนโจมตี:</b> ถ้า AI เอาหัวพุ่งชนเรา ตัวเราจะสั้นลงแทน (แต่ AI ไม่ตาย)<br>- <b>รางวัลนักล่า:</b> หากทำให้ AI หดสั้นจนตายได้ <b>+20 แต้ม, +2 ใจ, ยาวขึ้น 3 ช่อง!</b><br>- <i>*โหมดนี้ไม่มีการวางไข่นะ บู๊แหลกอย่างเดียว!</i>";
                    break;
                default:
                    text = "กรุณาเลือกโหมดการเล่น...";
            }
            content.innerHTML = text;
        }

        function changeMode() {
            updateInstructions();
            const mode = document.getElementById("modeSelect").value;
            const refreshBtn = document.getElementById("refreshMapBtn");
            if (mode === "2") refreshBtn.style.display = "inline-block";
            else refreshBtn.style.display = "none";
            initGame(true);
        }

