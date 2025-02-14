class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.physics = new PhysicsEngine();
        this.maxRadius = 0;
        this.currentType = this.getRandomStarterType();  // Current type for preview
        this.nextType = this.getRandomStarterType();     // Next type to be shown
        this.hasBlackHole = false;
        this.isGameOver = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.previewBody = null;
        this.restartButton = document.querySelector('.restart-button');
        
        this.setupCanvas();
        this.setupEventListeners();
        this.gameLoop();
    }

    getRandomStarterType() {
        const types = [
            CelestialType.DUST,
            CelestialType.COMET,
            CelestialType.ASTEROID
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    setupCanvas() {
        const updateCanvasSize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // Game boundary is 25% of the smaller screen dimension
            this.maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.4;
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

        // Restart button event
        this.restartButton.addEventListener('click', () => {
            this.restart();
        });
    }

    handleInput(x, y) {
        if (this.isGameOver || this.hasBlackHole) return;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Create a temporary body to get its radius
        const tempBody = new CelestialBody(0, 0, this.currentType);
        
        // Always place on the border, accounting for body radius
        const borderPoint = this.getNearestBorderPoint(x, y, tempBody.radius);
        
        // Create a new body at the border position
        const placedBody = new CelestialBody(borderPoint.x, borderPoint.y, this.currentType);
        placedBody.vertices = this.previewBody.vertices; // Copy the preview shape
        this.physics.addBody(placedBody);
        
        // Current type becomes next type, generate new next type
        this.currentType = this.nextType;
        this.nextType = this.getRandomStarterType();
        
        // Update preview body for new current type
        const tempBody2 = new CelestialBody(0, 0, this.currentType);
        const borderPoint2 = this.getNearestBorderPoint(x, y, tempBody2.radius);
        this.previewBody = new CelestialBody(borderPoint2.x, borderPoint2.y, this.currentType);
    }

    handleMouseMove(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        
        // Create temporary body to get radius if preview doesn't exist
        const radius = this.previewBody ? this.previewBody.radius : new CelestialBody(0, 0, this.currentType).radius;
        
        // Move preview to nearest border point, accounting for body radius
        const borderPoint = this.getNearestBorderPoint(x, y, radius);
        
        // Create preview body if it doesn't exist or if type changed
        if (!this.previewBody || this.previewBody.type !== this.currentType) {
            this.previewBody = new CelestialBody(borderPoint.x, borderPoint.y, this.currentType);
        } else {
            // Update position of existing preview body to border point
            this.previewBody.x = borderPoint.x;
            this.previewBody.y = borderPoint.y;
        }
    }

    getNearestBorderPoint(x, y, bodyRadius) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const angle = Math.atan2(dy, dx);
        
        // Calculate point on border, offset inward by body radius to ensure full containment
        const placementRadius = this.maxRadius - bodyRadius;
        return {
            x: centerX + Math.cos(angle) * placementRadius,
            y: centerY + Math.sin(angle) * placementRadius
        };
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
                // Show restart button when game is lost
                this.restartButton.style.display = 'block';
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

        // Draw legend entries
        this.ctx.font = '16px Arial';
        // Draw entry for each type
        Object.entries(CELESTIAL_COLORS).forEach(([type, color]) => {
            // Draw circle
            this.ctx.beginPath();
            this.ctx.arc(padding + circleRadius, y, circleRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.lineWidth = 2;
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

        // Draw next type indicator
        y += lineHeight / 2;
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('Next Body:', padding, y);
        y += lineHeight;
        
        // Draw circle for next type
        this.ctx.beginPath();
        this.ctx.arc(padding + circleRadius, y, circleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = CELESTIAL_COLORS[this.nextType];
        this.ctx.fill();
        this.ctx.lineWidth = 2;  // Consistent border width
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
        
        // Draw text for next type
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(
            TYPE_NAMES[this.nextType],
            padding + circleRadius * 2 + textOffset,
            y
        );
    }

    restart() {
        // Reset game state
        this.physics = new PhysicsEngine();
        this.currentType = this.getRandomStarterType();
        this.nextType = this.getRandomStarterType();
        this.hasBlackHole = false;
        this.isGameOver = false;
        this.previewBody = null;
        
        // Hide restart button
        this.restartButton.style.display = 'none';
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
