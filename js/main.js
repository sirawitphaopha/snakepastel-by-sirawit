        // ========== BOOT ==========
        window.onload = () => {
            updateInstructions();
            loadScores();
            initGame(true);

            // ป้องกันหน้าเลื่อนตอนแตะ game area และ d-pad บนมือถือ
            const noScrollEls = [
                document.getElementById("gameCanvas"),
                document.querySelector(".canvas-container"),
                document.querySelector(".d-pad"),
                document.querySelector(".game-panel")
            ];
            noScrollEls.forEach(el => {
                if (!el) return;
                el.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
                el.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
            });
        };

