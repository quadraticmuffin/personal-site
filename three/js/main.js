document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    let simulation = null;
    
    // Set canvas size to window size and handle pixel ratio
    function resizeCanvas() {
        const pixelRatio = window.devicePixelRatio || 1;
        console.log(pixelRatio);
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set display size (css pixels)
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        
        // Normalize coordinate system to use css pixels
        const ctx = canvas.getContext('2d');
        ctx.scale(pixelRatio, pixelRatio);
        
        // Destroy existing simulation if it exists
        if (simulation) {
            simulation.destroy();
        }
        
        // Create new simulation with CSS dimensions
        simulation = new ThreeBodySimulation(canvas, width, height);
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
