// Celestial body types and progression
const CelestialType = {
    DUST: 0,
    COMET: 1,
    ASTEROID: 2,
    MOON: 3,
    SMALL_PLANET: 4,
    LARGE_PLANET: 5,
    DWARF_STAR: 6,
    MAIN_STAR: 7,
    SUPERGIANT_STAR: 8,
    BLACK_HOLE: 9
};

const TYPE_NAMES = {
    [CelestialType.DUST]: 'Dust',
    [CelestialType.COMET]: 'Comet',
    [CelestialType.ASTEROID]: 'Asteroid',
    [CelestialType.MOON]: 'Moon',
    [CelestialType.SMALL_PLANET]: 'Small Planet',
    [CelestialType.LARGE_PLANET]: 'Large Planet',
    [CelestialType.DWARF_STAR]: 'Dwarf Star',
    [CelestialType.MAIN_STAR]: 'Main Star',
    [CelestialType.SUPERGIANT_STAR]: 'Supergiant Star',
    [CelestialType.BLACK_HOLE]: 'Black Hole'
};

// Color palette for celestial bodies
const CELESTIAL_COLORS = {
    [CelestialType.DUST]: '#D3D3D3',        // Light gray
    [CelestialType.COMET]: '#87CEEB',       // Sky blue
    [CelestialType.ASTEROID]: '#8A2BE2',    // Purple (BlueViolet)
    [CelestialType.MOON]: '#707070',        // Silver
    [CelestialType.SMALL_PLANET]: '#32CD32', // Lime green
    [CelestialType.LARGE_PLANET]: '#4169E1', // Royal blue
    [CelestialType.DWARF_STAR]: '#FF0000',   // Red
    [CelestialType.MAIN_STAR]: '#FFD700',    // Gold
    [CelestialType.SUPERGIANT_STAR]: '#FF4500', // Orange red
    [CelestialType.BLACK_HOLE]: '#000000'    // Black
};

// Helper function to get physics constants based on screen size
function getPhysicsConstants() {
    const canvas = document.getElementById('gameCanvas');
    const minDimension = Math.min(canvas.width, canvas.height);
    
    return {
        // Scale gravity with screen size - larger screens need stronger gravity
        GRAVITY_CONSTANT: minDimension * 0.01,  // 0.4% of screen size
        // Damping and friction remain similar but slightly adjusted for screen scale
        ELASTIC_DAMPING: 1.0,  // Slight increase with screen size
        FRICTION: 0.999  // Slight increase with screen size
    };
}

class CelestialBody {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.velocityX = 0;
        this.velocityY = 0;
        this.radius = this.calculateRadius();
        this.isIrregular = this.checkIfIrregular();
        this.vertices = this.generateCollisionVertices();
    }

    calculateRadius() {
        // Get canvas dimensions
        const canvas = document.getElementById('gameCanvas');
        const minDimension = Math.min(canvas.width, canvas.height);
        
        // Base radius is 2% of the smaller canvas dimension
        const baseRadius = minDimension * 0.03;
        const radiusIncrement = minDimension * 0.015;
        
        // Linear progression based on type
        return baseRadius + (this.type * radiusIncrement);
    }

    checkIfIrregular() {
        return false;
        return [
            CelestialType.ASTEROID,
            CelestialType.MOON,
            CelestialType.LARGE_PLANET
        ].includes(this.type);
    }

    generateCollisionVertices() {
        if (!this.isIrregular) return null;

        // Generate irregular shape vertices based on type
        const numVertices = {
            [CelestialType.ASTEROID]: 6,
            [CelestialType.MOON]: 8,
            [CelestialType.LARGE_PLANET]: 12
        }[this.type];

        const vertices = [];
        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            // Vary radius between 0.8 and 1.2 of base radius for irregular shape
            const radiusVariation = 0.8 + Math.random() * 0.4;
            vertices.push({
                x: Math.cos(angle) * this.radius * radiusVariation,
                y: Math.sin(angle) * this.radius * radiusVariation
            });
        }
        return vertices;
    }

    getCollisionBox() {
        if (this.isIrregular) {
            return {
                type: 'irregular',
                vertices: this.vertices.map(v => ({
                    x: this.x + v.x,
                    y: this.y + v.y
                })),
                radius: this.radius  // For broad phase collision detection
            };
        } else {
            return {
                type: 'circular',
                x: this.x,
                y: this.y,
                radius: this.radius
            };
        }
    }

    draw(ctx, isGameOver = false) {
        // Draw body circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = CELESTIAL_COLORS[this.type];
        ctx.fill();
        ctx.lineWidth = 2;  // Consistent border width
        ctx.strokeStyle = 'white';
        ctx.stroke();
        
        // Draw face
        const faceRadius = this.radius * 0.6;
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x - faceRadius * 0.3, this.y - faceRadius * 0.2, faceRadius * 0.15, 0, Math.PI * 2);
        ctx.arc(this.x + faceRadius * 0.3, this.y - faceRadius * 0.2, faceRadius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth (smile or frown)
        ctx.beginPath();
        if (isGameOver) {
            // Frown - inverted arc, moved down
            ctx.arc(this.x, this.y + faceRadius * 0.3, faceRadius * 0.5, Math.PI, 0);
        } else {
            // Smile
            ctx.arc(this.x, this.y, faceRadius * 0.5, 0, Math.PI);
        }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class PhysicsEngine {
    constructor() {
        this.bodies = [];
    }

    addBody(body) {
        this.bodies.push(body);
    }

    applyGravity() {
        const physics = getPhysicsConstants();
        
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];

                const dx = body2.x - body1.x;
                const dy = body2.y - body1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance === 0) continue;

                // Calculate gravitational force using dynamic gravity constant
                const force = physics.GRAVITY_CONSTANT * body1.radius * body2.radius / (distance * distance);
                const angle = Math.atan2(dy, dx);

                // Apply forces
                body1.velocityX += Math.cos(angle) * force / body1.radius;
                body1.velocityY += Math.sin(angle) * force / body1.radius;
                body2.velocityX -= Math.cos(angle) * force / body2.radius;
                body2.velocityY -= Math.sin(angle) * force / body2.radius;
            }
        }
    }

    handleElasticCollision(body1, body2) {
        const physics = getPhysicsConstants();
        
        // Calculate collision normal
        const dx = body2.x - body1.x;
        const dy = body2.y - body1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;

        // First, move bodies apart (position correction)
        const overlap = (body1.radius + body2.radius - distance);
        const nx = dx / distance;
        const ny = dy / distance;
        
        const totalMass = body1.radius + body2.radius;
        const ratio1 = body1.radius / totalMass;
        const ratio2 = body2.radius / totalMass;

        // Move proportionally to mass
        body1.x -= nx * overlap * ratio2;
        body1.y -= ny * overlap * ratio2;
        body2.x += nx * overlap * ratio1;
        body2.y += ny * overlap * ratio1;

        // Then calculate and apply velocity changes with dynamic damping
        const relativeVelX = body2.velocityX - body1.velocityX;
        const relativeVelY = body2.velocityY - body1.velocityY;

        body1.velocityX += Math.abs(nx) * (1 + physics.ELASTIC_DAMPING) * relativeVelX * ratio2;
        body1.velocityY += Math.abs(ny) * (1 + physics.ELASTIC_DAMPING) * relativeVelY * ratio2;
        body2.velocityX -= Math.abs(nx) * (1 + physics.ELASTIC_DAMPING) * relativeVelX * ratio1;
        body2.velocityY -= Math.abs(ny) * (1 + physics.ELASTIC_DAMPING) * relativeVelY * ratio1;
    }

    checkMerge(body1, body2) {
        return body1.type === body2.type && body1.type < CelestialType.BLACK_HOLE;
    }

    handleCollisions() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];

                const dx = body2.x - body1.x;
                const dy = body2.y - body1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = body1.radius + body2.radius;

                if (distance < minDistance) {
                    if (this.checkMerge(body1, body2)) {
                        // Create new merged body
                        const newType = body1.type + 1;
                        const newX = (body1.x + body2.x) / 2;
                        const newY = (body1.y + body2.y) / 2;
                        const newBody = new CelestialBody(newX, newY, newType);
                        
                        // Average velocities weighted by mass (radius)
                        const totalMass = body1.radius + body2.radius;
                        newBody.velocityX = (body1.velocityX * body1.radius + body2.velocityX * body2.radius) / totalMass;
                        newBody.velocityY = (body1.velocityY * body1.radius + body2.velocityY * body2.radius) / totalMass;

                        // Remove old bodies and add new one
                        this.bodies.splice(j, 1);
                        this.bodies.splice(i, 1);
                        this.bodies.push(newBody);
                        return; // Exit after merge
                    } else {
                        this.handleElasticCollision(body1, body2);
                    }
                }
            }
        }
    }

    update() {
        const physics = getPhysicsConstants();
        
        // Apply friction to all bodies
        for (const body of this.bodies) {
            body.velocityX *= physics.FRICTION;
            body.velocityY *= physics.FRICTION;
        }

        // Update positions
        for (const body of this.bodies) {
            body.x += body.velocityX;
            body.y += body.velocityY;
        }

        // Then handle collisions
        this.handleCollisions();

        // Finally apply gravity
        this.applyGravity();
    }
}
