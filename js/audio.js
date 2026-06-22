        // ========== AUDIO SYSTEM ==========
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let isMusicPlaying = false;
        let lofiLoop = null;

        function playSound(freq, type, duration, vol = 0.1) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        }

        const chords = [
            [261.63, 329.63, 392.00, 493.88],
            [349.23, 440.00, 523.25, 659.25],
            [293.66, 349.23, 440.00, 523.25],
            [392.00, 466.16, 587.33, 698.46]
        ];
        let currentChordIdx = 0;

        function playLofiNote(freq, time, vol = 0.02) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(vol, time + 0.5);
            gain.gain.linearRampToValueAtTime(0, time + 4);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time);
            osc.stop(time + 4);
        }

        function startLofiMusic() {
            if (isMusicPlaying) return;
            isMusicPlaying = true;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            function loop() {
                if (!isMusicPlaying) return;
                let now = audioCtx.currentTime;
                let chord = chords[currentChordIdx];
                chord.forEach((f, i) => {
                    playLofiNote(f, now + (i * 0.1), 0.02);
                });
                currentChordIdx = (currentChordIdx + 1) % chords.length;
                lofiLoop = setTimeout(loop, 4000);
            }
            loop();
        }

        function stopLofiMusic() {
            isMusicPlaying = false;
            if (lofiLoop) clearTimeout(lofiLoop);
        }

        function toggleMusic() {
            const btn = document.getElementById("musicToggleBtn");
            if (isMusicPlaying) {
                stopLofiMusic();
                btn.innerText = "🎵 เปิดดนตรี Lo-fi";
                btn.style.background = "rgba(200, 230, 200, 0.6)";
            } else {
                startLofiMusic();
                btn.innerText = "🔇 ปิดดนตรี";
                btn.style.background = "rgba(255, 200, 200, 0.6)";
            }
        }

