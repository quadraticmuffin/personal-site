class ThreeBodySimulation {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        
        // Set up Matter.js engine with fixed time step
        this.engine = Matter.Engine.create({
            gravity: { x: 0, y: 0 },
            enableSleeping: false,
            timing: {
                timeScale: 1,
                timestamp: 0,
                lastDelta: 16.666667, // Target 60 FPS
                lastElapsed: 16.666667
            }
        });
        
        // Constants
        this.G = 0.5; // Gravitational constant (adjusted for visualization)
        this.trailLength = 50;
        this.radii = [25, 15, 20]; // Store radii as class property
        this.masses = [50, 30, 40]; // Store masses as class property
        
        // Generate random colors with same luminosity
        this.colors = this.generateColors();
        
        // Create bodies and walls
        this.bodies = this.createBodies();
        this.walls = this.createWalls();
        this.trails = this.bodies.map(() => []);
        
        // Add all bodies to the world
        Matter.Composite.add(this.engine.world, [...this.bodies, ...this.walls]);
        
        // Start animation
        this.lastTime = performance.now();
        this.fixedDelta = 1000 / 60; // 60 FPS
        this.accumulator = 0;
        this.animate();
    }
    
    generateColors() {
        // Start with a random hue
        const startHue = Math.random() * 360;
        // Generate three colors with hues 120 degrees apart
        return Array.from({length: 3}, (_, i) => {
            const hue = (startHue + i * 120) % 360;
            // Use high saturation (85%) and medium-high lightness (60%) for vibrant but visible colors
            return `hsl(${hue}, 85%, 60%)`;
        });
    }
    
    createWalls() {
        const thickness = 60;
        return [
            // Top wall
            Matter.Bodies.rectangle(this.width / 2, -thickness / 2, this.width, thickness, { isStatic: true }),
            // Bottom wall
            Matter.Bodies.rectangle(this.width / 2, this.height + thickness / 2, this.width, thickness, { isStatic: true }),
            // Left wall
            Matter.Bodies.rectangle(-thickness / 2, this.height / 2, thickness, this.height, { isStatic: true }),
            // Right wall
            Matter.Bodies.rectangle(this.width + thickness / 2, this.height / 2, thickness, this.height, { isStatic: true })
        ];
    }
    
    createBodies() {
        // Calculate center and radius of the formation
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const formationRadius = Math.min(this.width, this.height) * 0.2; // 20% of smaller dimension
        
        // Calculate positions in equilateral triangle formation
        const basePositions = Array.from({length: 3}, (_, i) => {
            const angle = (i * 2 * Math.PI / 3) + Math.PI / 6; // Start at 30 degrees for better aesthetics
            return {
                x: centerX + formationRadius * Math.cos(angle),
                y: centerY + formationRadius * Math.sin(angle)
            };
        });
        
        // Small random variation function
        const vary = (value, range) => value + (Math.random() - 0.5) * range;
        
        const bodies = basePositions.map((pos, i) => {
            // Add small random variations to positions (±10 pixels)
            const variedPos = {
                x: vary(pos.x, 20),
                y: vary(pos.y, 20)
            };
            
            // Create the body
            return Matter.Bodies.circle(variedPos.x, variedPos.y, this.radii[i], {
                render: { fillStyle: this.colors[i] },
                mass: this.masses[i],
                friction: 0,
                frictionAir: 0,
                restitution: 0.9
            });
        });
        
        // Set zero initial velocities
        bodies.forEach(body => {
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
        });
        
        return bodies;
    }
    
    calculateGravity(bodyA, bodyB) {
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const force = (this.G * bodyA.mass * bodyB.mass) / (distance * distance);
        const angle = Math.atan2(dy, dx);
        
        return {
            x: force * Math.cos(angle),
            y: force * Math.sin(angle)
        };
    }
    
    updateGravity() {
        // Apply gravitational forces between all bodies
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const force = this.calculateGravity(this.bodies[i], this.bodies[j]);
                Matter.Body.applyForce(this.bodies[i], this.bodies[i].position, force);
                Matter.Body.applyForce(this.bodies[j], this.bodies[j].position, {
                    x: -force.x,
                    y: -force.y
                });
            }
        }
    }
    
    updateTrails() {
        this.bodies.forEach((body, index) => {
            this.trails[index].push({ x: body.position.x, y: body.position.y });
            if (this.trails[index].length > this.trailLength) {
                this.trails[index].shift();
            }
        });
    }
    
    getCatmullRomPoint(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        // Catmull-Rom matrix
        const v0 = (-t3 + 2*t2 - t) * 0.5;
        const v1 = (3*t3 - 5*t2 + 2) * 0.5;
        const v2 = (-3*t3 + 4*t2 + t) * 0.5;
        const v3 = (t3 - t2) * 0.5;
        
        return {
            x: v0*p0.x + v1*p1.x + v2*p2.x + v3*p3.x,
            y: v0*p0.y + v1*p1.y + v2*p2.y + v3*p3.y
        };
    }
    
    drawTrails() {
        const STEPS = 10; // Number of interpolation steps between each point
        
        this.trails.forEach((trail, index) => {
            if (trail.length < 4) return; // Need at least 4 points for Catmull-Rom
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.colors[index];
            this.ctx.lineWidth = 2;
            
            // Start from the first actual point
            this.ctx.moveTo(trail[0].x, trail[0].y);
            
            // Draw smooth curve through all points
            for (let i = 0; i < trail.length - 3; i++) {
                const p0 = trail[i];
                const p1 = trail[i + 1];
                const p2 = trail[i + 2];
                const p3 = trail[i + 3];
                
                // Interpolate between p1 and p2
                for (let step = 0; step <= STEPS; step++) {
                    const t = step / STEPS;
                    const alpha = (i + t) / trail.length;
                    this.ctx.globalAlpha = alpha * 0.5;
                    
                    const pt = this.getCatmullRomPoint(p0, p1, p2, p3, t);
                    this.ctx.lineTo(pt.x, pt.y);
                }
            }
            
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
            this.ctx.lineWidth = 1;
        });
    }
    
    drawBodies() {
        this.bodies.forEach((body, index) => {
            this.ctx.beginPath();
            this.ctx.fillStyle = this.colors[index];
            this.ctx.arc(body.position.x, body.position.y, this.radii[index], 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    render() {
        // Clear with alpha for trails
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw trails and bodies
        this.drawTrails();
        this.drawBodies();
    }
    
    animate() {
        const currentTime = performance.now();
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Prevent spiral of death with large delta times
        if (deltaTime > 100) {
            deltaTime = this.fixedDelta;
        }
        
        // Accumulate time and update physics in fixed time steps
        this.accumulator += deltaTime;
        while (this.accumulator >= this.fixedDelta) {
            Matter.Engine.update(this.engine, this.fixedDelta);
            this.updateGravity();
            this.updateTrails();
            this.accumulator -= this.fixedDelta;
        }
        
        // Render at screen refresh rate
        this.render();
        
        // Request next frame
        if (!this.isDestroyed) {
            requestAnimationFrame(() => this.animate());
        }
    }
    
    destroy() {
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Clear all bodies from the world
        Matter.World.clear(this.engine.world);
        
        // Clear the engine
        Matter.Engine.clear(this.engine);
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Clear references
        this.bodies = null;
        this.walls = null;
        this.trails = null;
        this.engine = null;
    }
}
