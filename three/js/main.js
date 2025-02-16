document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    let simulation = null;
    
    // Set canvas size to window size and restart simulation
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Destroy existing simulation if it exists
        if (simulation) {
            simulation.destroy();
        }
        
        // Create new simulation
        simulation = new ThreeBodySimulation(canvas);
    }
    
    // Initial resize and simulation start
    resizeCanvas();
    
    // Debounce function to prevent too many restarts
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Resize canvas when window is resized (debounced)
    window.addEventListener('resize', debounce(resizeCanvas, 250));
});
