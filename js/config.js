        // ========== CONSTANTS & CANVAS ==========
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const tileCount = 20;
        const gridSize = 400 / tileCount;
        const MAX_LIVES = 10;
        const MAX_SNAKE_LENGTH_AI = 20;

        const colors = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F4ACB7', '#B5E2FA'];
        const rivalColors = ['#4A0E4E', '#811776', '#B91D73', '#F21170'];
        const eyeColorsProgression = ['#5c6b73', '#4a90e2', '#8b572a', '#f5a623', '#d0021b', '#900000'];

        // ========== GAME STATE VARIABLES ==========
        let snake = [];
        let freeRoamSnake = [];
        let playerPendingGrowth = 0;
        let sparkles = [];
        let comboCount = 0;
        let lastEatTime = 0;
        let rainbowAuraHue = 0;
        let floatingTexts = [];

        let ais = [];
        let aiWave = 1;
        let food = { x: 0, y: 0 };
        let extraHeart = null;
        let eggObj = null;

        let poops = [];
        let foodEatenCount = 0;
        let pendingPoops = 0;
        let poopsEaten = 0;

        let smileTimer = 0;
        let poopEatTimer = 0;
        let heartEatTimer = 0;
        let sadTimer = 0;
        let verySadTimer = 0;

        let inGracePeriod = false;
        let damageVisualTimer = 0;
        let stunType = "";
        let pendingCollisionDamage = false;
        let collisionDir = null;
        let pendingCollisionNext = null;
        let graceTimeout = null;

        let obstacles = [];
        let dx = 0, dy = 0;
        let lastDx = 1, lastDy = 0;
        let score = 0, lives = 3;
        let baseSpeed = 110, currentSpeed = 110;
        let gameLoop, freeRoamLoop;
        let changingDir = false;
        let isPaused = false;
        let gameState = "PLAYING";

        let cheatBuffer = "";
        let cheatTimer = null;
        let cheatWinActivated = false;
        let highScores = [];
        let explosionParticles = [];
        let pauseStartTime = 0; // เก็บเวลาตอน Pause เพื่อไม่ให้ combo หาย

        let isStarved = false;
        let stepsSinceLastFood = 0;
        let selfBiteCount = 0;
        let stepsSinceLastSelfBite = 0;
        let bloodSpots = [];
        let totalSteps = 0;
        let isSkullPhase = false;
        let skullPhaseCountdown = 0;
        let starveBodyStart = 0;
        let starveLivesStart = 0;
        let liveDrainAccum = 0;
        let heartsEatenSession = 0;
        let totalPoopsEatenSession = 0;

