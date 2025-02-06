class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.physics = new PhysicsEngine();
        this.maxRadius = 0;
        this.currentType = this.getRandomStarterType();  // Start with random type
        this.hasBlackHole = false;
        this.isGameOver = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.previewBody = null;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.gameLoop();
    }

    getRandomStarterType() {
        const types = [
            CelestialType.PEBBLE,
            CelestialType.ASTEROID,
            CelestialType.MOON
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    setupCanvas() {
        const updateCanvasSize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // Game boundary is 45% of the smaller screen dimension
            this.maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.45;
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleInput(x, y);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleMouseMove(x, y);
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();  // Prevent scrolling
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleInput(x, y);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();  // Prevent scrolling
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleMouseMove(x, y);
        });
    }

    handleInput(x, y) {
        if (this.isGameOver || this.hasBlackHole) return;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

        if (distanceFromCenter <= this.maxRadius) {
            // Create a new body at the clicked position
            const placedBody = new CelestialBody(x, y, this.currentType);
            placedBody.vertices = this.previewBody.vertices; // Copy the preview shape
            this.physics.addBody(placedBody);
            
            // Get new random type and update preview
            const newType = this.getRandomStarterType();
            this.currentType = newType;
            this.previewBody = new CelestialBody(this.mouseX, this.mouseY, newType);
        }
    }

    handleMouseMove(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        
        // Create preview body if it doesn't exist or if type changed
        if (!this.previewBody || this.previewBody.type !== this.currentType) {
            this.previewBody = new CelestialBody(x, y, this.currentType);
        } else {
            // Update position of existing preview body
            this.previewBody.x = x;
            this.previewBody.y = y;
        }
    }

    spawnObject(x, y, type) {
        const body = new CelestialBody(x, y, type);
        this.physics.addBody(body);
    }

    checkWinCondition() {
        this.hasBlackHole = this.physics.bodies.some(body => body.type === CelestialType.BLACK_HOLE);
        if (this.hasBlackHole) {
            console.log("Victory! Black Hole created!");
        }
        return this.hasBlackHole;
    }

    checkLossCondition() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Check if any body is outside the boundary
        for (const body of this.physics.bodies) {
            const dx = body.x - centerX;
            const dy = body.y - centerY;
            const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
            
            if (distanceFromCenter > this.maxRadius) {
                this.isGameOver = true;
                return;
            }
        }
    }

    drawBoundary() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Draw dotted circle for boundary
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.maxRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);  // Reset line style

    }

    drawGameState() {
        if (this.hasBlackHole) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Victory!', this.canvas.width / 2, this.canvas.height / 2);
        } else if (this.isGameOver) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawMousePreview() {
        if (!this.previewBody) return;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const dx = this.mouseX - centerX;
        const dy = this.mouseY - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

        // Set preview transparency based on valid placement
        this.ctx.globalAlpha = distanceFromCenter <= this.maxRadius ? 0.6 : 0.3;
        this.previewBody.draw(this.ctx, this.isGameOver);  // Pass game over state
        this.ctx.globalAlpha = 1.0;

    }

    update() {
        if (!this.isGameOver && !this.hasBlackHole) {
            this.physics.update();
            this.checkWinCondition();
            this.checkLossCondition();
        }
    }

    draw() {
        // Clear the canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw boundary circle
        this.drawBoundary();
        
        // Draw all bodies
        for (const body of this.physics.bodies) {
            body.draw(this.ctx, this.isGameOver);  // Pass game over state
        }

        // Draw preview if not game over
        if (!this.isGameOver && !this.hasBlackHole) {
            this.drawMousePreview();
        }

        // Draw game state (win/lose messages)
        this.drawGameState();

        // Draw legend
        this.drawLegend();
    }

    drawLegend() {
        const padding = 20;
        const lineHeight = 30;
        const circleRadius = 10;
        const textOffset = 25;
        
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        let y = padding;
        
        // Title
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('Celestial Bodies', padding, y);
        y += lineHeight;
        
        this.ctx.font = '16px Arial';
        // Draw entry for each type
        Object.entries(CELESTIAL_COLORS).forEach(([type, color]) => {
            // Draw circle
            this.ctx.beginPath();
            this.ctx.arc(padding + circleRadius, y, circleRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.lineWidth = 2;  // Consistent border width
            this.ctx.strokeStyle = 'white';
            this.ctx.stroke();
            
            // Draw text
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(
                TYPE_NAMES[type],
                padding + circleRadius * 2 + textOffset, 
                y
            );
            
            y += lineHeight;
        });

        // Draw current type indicator
        y += lineHeight / 2;
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('Next Body:', padding, y);
        y += lineHeight;
        
        // Draw circle for current type
        this.ctx.beginPath();
        this.ctx.arc(padding + circleRadius, y, circleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = CELESTIAL_COLORS[this.currentType];
        this.ctx.fill();
        this.ctx.lineWidth = 2;  // Consistent border width
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
        
        // Draw text for current type
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(
            TYPE_NAMES[this.currentType],
            padding + circleRadius * 2 + textOffset,
            y
        );
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.gameLoop();
    }
}

// Start game when page loads
window.onload = () => {
    const game = new Game();
    game.start();
};
