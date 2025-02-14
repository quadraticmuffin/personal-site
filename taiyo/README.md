## **Overview**
A physics-based celestial object merging game where players combine increasingly larger bodies to create a black hole.

## **Core Mechanics**
1. **Gravity-Based Movement**: Objects will be subject to gravity, causing them to move toward the nearest objects. Objects will fall towards the center of the play area or toward larger objects.
2. **Merging Mechanic**: When two objects of the same type collide, they will merge into a larger version according to the hierarchy.
3. **Progression**: Players work to merge objects into larger ones. The ultimate goal is to create a Black Hole to win the game.
4. **Game Mechanics**: 
    The game focuses on merging celestial bodies to create increasingly larger objects. The ultimate goal is to create a Black Hole. Once the player creates a Black Hole, they win the game.

    The progression of merging bodies is as follows:
    *   Dust < Comet < Asteroid < Moon < Small Planet < Large Planet < Dwarf Star < Main Star < Supergiant Star < Black Hole
5. **Physics Engine**: A gravity physics engine will simulate realistic gravitational attraction, where the bigger the object, the stronger its gravitational pull.

### **Game Elements**

#### **1. Gameplay Mechanics**

##### **Merging Objects**
   - Two objects of the same type will merge when they collide, following this hierarchy:
     - Two Dust → Comet
     - Two Comets → Asteroid
     - Two Asteroids → Moon
     - Two Moons → Small Planet
     - Two Small Planets → Large Planet
     - Two Large Planets → Dwarf Star
     - Two Dwarf Stars → Main Star
     - Two Main Stars → Supergiant Star
     - Two Supergiant Stars → Black Hole (Win condition!)
   - Object radii increase linearly with their rank in the hierarchy

##### **Player Actions**
   - Players can place new objects (limited to Dust, Comets, or Asteroids) on the edge of the game boundary
   - A dotted line circle always shows the maximum allowed total size
   - If the combined size of all objects exceeds this radius, the game is lost
   - This includes both newly placed bodies and existing bodies that drift out due to physics

##### **Physics**
   - Objects are affected by gravity and will naturally attract each other
   - Larger objects exert stronger gravitational pull
   - Objects will merge upon collision if they are of the same type
   - All non-merging collisions are elastic (objects bounce off each other)
   - Collision detection uses:
     - Regular circular collision boxes for spherical objects (Dust, Small Planets, Dwarf Stars, Main Stars, Supergiant Stars, Black Holes)

#### **2. Visuals**
   - **Art Style**: The game will feature a cute and lofi art style. Celestial bodies will have smiley faces to enhance the charming aesthetic.
   - **Background**: A deep-space backdrop with moving stars, nebulae, and cosmic elements to create a dynamic atmosphere.
   - **Animation**: 
     - Planets, moons, and asteroids should rotate or orbit in a visually engaging way.
     - Merging animations should be smooth and satisfying.

#### **3. Audio**
   - **Background Music**: Relaxing, ambient space-themed music that creates a calm atmosphere.
   - **Sound Effects**: 
     - Satisfying merge sounds.
     - Ambient space sounds.
     - Gravitational pull effects.

### **Technical Requirements**
   - **Platform**: Web-based game using HTML5 Canvas and JavaScript.
   - **Performance**: Smooth gameplay with multiple objects on screen.
   - **Device Compatibility**: Mobile-first, but should be playable on web browsers with responsive scaling for desktop.

### **Summary**
In **"Taiyo Game"**, players control celestial objects that are attracted to each other via gravity. When objects of the same type touch, they combine into larger celestial bodies according to the merging hierarchy. The game features an engaging system where players place new objects strategically while managing the total size of all objects within a maximum radius. Creating a Black Hole wins the game, while exceeding the size limit or having any celestial body's center move outside the boundary circle results in a loss.

The simple yet captivating mechanics of merging celestial bodies with gravity interactions, combined with cute lofi visuals and a relaxing soundtrack, will keep players engaged and encourage them to experiment with gravitational physics.