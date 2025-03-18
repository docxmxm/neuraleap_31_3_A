/**
 * Neural Network Visualization for NeuralLeap
 * Creates an interactive neural network visualization with nodes and connections
 */

class NeuralNetworkVisualization {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }

        // Default options
        this.options = {
            nodeCount: options.nodeCount || 15,
            connectionCount: options.connectionCount || 25,
            nodeSize: options.nodeSize || { min: 4, max: 10 },
            animationSpeed: options.animationSpeed || { min: 2, max: 5 },
            interactive: options.interactive !== undefined ? options.interactive : true,
            colors: options.colors || {
                node: 'var(--neon-blue)',
                connection: 'var(--neon-blue)',
                highlight: 'var(--neon-green)'
            }
        };

        this.nodes = [];
        this.connections = [];
        this.containerWidth = this.container.offsetWidth;
        this.containerHeight = this.container.offsetHeight;

        this.init();
    }

    /**
     * Initialize the neural network visualization
     */
    init() {
        // Clear any existing content
        this.container.innerHTML = '';
        
        // Create nodes
        this.createNodes();
        
        // Create connections between nodes
        this.createConnections();
        
        // Add interactivity if enabled
        if (this.options.interactive) {
            this.addInteractivity();
        }
        
        // Add resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Create neural network nodes
     */
    createNodes() {
        for (let i = 0; i < this.options.nodeCount; i++) {
            // Create node element
            const node = document.createElement('div');
            node.className = 'node';
            
            // Random size
            const size = this.getRandomValue(this.options.nodeSize.min, this.options.nodeSize.max);
            node.style.width = `${size}px`;
            node.style.height = `${size}px`;
            
            // Random position
            const left = Math.random() * (this.containerWidth - size);
            const top = Math.random() * (this.containerHeight - size);
            node.style.left = `${left}px`;
            node.style.top = `${top}px`;
            
            // Random animation delay
            node.style.animationDuration = `${this.getRandomValue(this.options.animationSpeed.min, this.options.animationSpeed.max)}s`;
            node.style.animationDelay = `${Math.random() * 2}s`;
            
            // Store node data
            this.nodes.push({
                element: node,
                x: left + size / 2,
                y: top + size / 2,
                size: size
            });
            
            // Add to container
            this.container.appendChild(node);
        }
    }

    /**
     * Create connections between nodes
     */
    createConnections() {
        for (let i = 0; i < this.options.connectionCount; i++) {
            // Get two random nodes
            const nodeIndexA = Math.floor(Math.random() * this.nodes.length);
            let nodeIndexB = Math.floor(Math.random() * this.nodes.length);
            
            // Make sure we don't connect a node to itself
            while (nodeIndexB === nodeIndexA) {
                nodeIndexB = Math.floor(Math.random() * this.nodes.length);
            }
            
            const nodeA = this.nodes[nodeIndexA];
            const nodeB = this.nodes[nodeIndexB];
            
            // Create connection element
            const connection = document.createElement('div');
            connection.className = 'connection';
            
            // Calculate connection properties
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Set connection style
            connection.style.width = `${length}px`;
            connection.style.left = `${nodeA.x}px`;
            connection.style.top = `${nodeA.y}px`;
            connection.style.transform = `rotate(${angle}deg)`;
            connection.style.animationDelay = `${Math.random() * 4}s`;
            
            // Store connection data
            this.connections.push({
                element: connection,
                nodeA: nodeIndexA,
                nodeB: nodeIndexB
            });
            
            // Add to container
            this.container.appendChild(connection);
        }
    }

    /**
     * Add interactivity to the neural network
     */
    addInteractivity() {
        // Add mousemove event to highlight nearest nodes
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Find the closest node
            let closestNode = null;
            let closestDistance = Infinity;
            
            this.nodes.forEach((node, index) => {
                const dx = node.x - mouseX;
                const dy = node.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestNode = index;
                }
                
                // Reset node style
                node.element.style.backgroundColor = this.options.colors.node;
                node.element.style.boxShadow = `0 0 8px ${this.options.colors.node}`;
            });
            
            // Highlight closest node if it's within 50px
            if (closestNode !== null && closestDistance < 50) {
                const node = this.nodes[closestNode];
                node.element.style.backgroundColor = this.options.colors.highlight;
                node.element.style.boxShadow = `0 0 15px ${this.options.colors.highlight}`;
                
                // Highlight connections to this node
                this.connections.forEach(conn => {
                    if (conn.nodeA === closestNode || conn.nodeB === closestNode) {
                        conn.element.style.background = `linear-gradient(90deg, transparent, ${this.options.colors.highlight}, transparent)`;
                        conn.element.style.opacity = '0.8';
                    } else {
                        conn.element.style.background = `linear-gradient(90deg, transparent, ${this.options.colors.connection}, transparent)`;
                        conn.element.style.opacity = '';
                    }
                });
            } else {
                // Reset all connections
                this.connections.forEach(conn => {
                    conn.element.style.background = `linear-gradient(90deg, transparent, ${this.options.colors.connection}, transparent)`;
                    conn.element.style.opacity = '';
                });
            }
        });
        
        // Reset on mouse leave
        this.container.addEventListener('mouseleave', () => {
            this.nodes.forEach(node => {
                node.element.style.backgroundColor = this.options.colors.node;
                node.element.style.boxShadow = `0 0 8px ${this.options.colors.node}`;
            });
            
            this.connections.forEach(conn => {
                conn.element.style.background = `linear-gradient(90deg, transparent, ${this.options.colors.connection}, transparent)`;
                conn.element.style.opacity = '';
            });
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update container dimensions
        this.containerWidth = this.container.offsetWidth;
        this.containerHeight = this.container.offsetHeight;
        
        // Reinitialize the visualization
        this.init();
    }

    /**
     * Get a random value between min and max
     */
    getRandomValue(min, max) {
        return min + Math.random() * (max - min);
    }
}

// Initialize neural network visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const neuralNetworkContainer = document.getElementById('neural-network');
    
    if (neuralNetworkContainer) {
        const visualization = new NeuralNetworkVisualization('neural-network', {
            nodeCount: 15,
            connectionCount: 25,
            interactive: true
        });
    }
    
    // Create particles for the hero section
    createParticles();
});

/**
 * Create particles for the hero section
 */
function createParticles() {
    const particlesContainer = document.getElementById('particles-js');
    
    if (particlesContainer) {
        const particles = 30;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size
            const size = Math.random() * 5 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random animation duration and delay
            particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
}
