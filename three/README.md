# Three-Body Problem Visualizer

A minimalistic visualization of the Three-Body Problem using Matter.js and HTML5 Canvas. This project demonstrates the chaotic nature of gravitational interactions between three bodies in space.

## Features

- Real-time simulation of three bodies under mutual gravitational attraction
- Distinct colors for each body
- Motion trails that fade over time
- Dark space-like background
- Physics powered by Matter.js
- Smooth rendering using HTML5 Canvas

## Technical Stack

- Matter.js - Physics engine
- HTML5 Canvas - Rendering
- JavaScript (ES6+)

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── js/
│   ├── main.js         # Main application logic
│   └── simulation.js   # Three-body simulation logic
```

## Setup

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process required - it's vanilla JavaScript!

## Physics Implementation

The simulation implements Newton's law of universal gravitation:

F = G * (m1 * m2) / r²

where:
- F is the gravitational force between two bodies
- G is the gravitational constant
- m1 and m2 are the masses of the two bodies
- r is the distance between the centers of the bodies

## Planned Enhancements

- User controls for initial positions and velocities
- Mass adjustment controls
- Trail length/opacity controls
- Time control (pause/play/speed)
- Color theme customization

## License

MIT License

## Author

Created by Jett
