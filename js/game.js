// Game of Life implementation
class GameOfLife {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = Array(rows)
            .fill(null)
            .map(() => Array(cols).fill(0));
        this.generation = 0;
    }

    // Get the current grid
    getGrid() {
        return this.grid;
    }

    // Set a cell state
    setCell(row, col, alive) {
        if (this.isValidCell(row, col)) {
            this.grid[row][col] = alive ? 1 : 2; // If toggling, either make alive or mark as dead
        }
    }

    // Toggle a cell between never lived (0) and alive (1)
    toggleCellAliveOnly(row, col) {
        if (this.isValidCell(row, col)) {
            // Get current state
            const currentState = this.grid[row][col];

            // Toggle only between never lived (0) and alive (1)
            this.grid[row][col] = currentState === 1 ? 0 : 1;
        }
    }

    // Helper to check if cell coordinates are valid
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    // Count live neighbors of a cell
    countLiveNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidCell(newRow, newCol) && this.grid[newRow][newCol] === 1) {
                    count++;
                }
            }
        }
        return count;
    }

    // Get current generation count
    getGeneration() {
        return this.generation;
    }

    // Calculate the next generation
    nextGeneration() {
        const newGrid = Array(this.rows)
            .fill(null)
            .map(() => Array(this.cols).fill(0));

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const liveNeighbors = this.countLiveNeighbors(row, col);
                const currentState = this.grid[row][col];

                if (currentState === 1) {
                    // Rules 1, 2, and 3: Any live cell with 2 or 3 live neighbors survives.
                    if (liveNeighbors === 2 || liveNeighbors === 3) {
                        newGrid[row][col] = 1; // Stays alive
                    } else {
                        newGrid[row][col] = 2; // Dies
                    }
                } else {
                    // Rule 4: Any dead cell with exactly 3 live neighbors becomes a live cell.
                    if (liveNeighbors === 3) {
                        newGrid[row][col] = 1; // Becomes alive
                    } else {
                        newGrid[row][col] = currentState; // Stays in current state (0 or 2)
                    }
                }
            }
        }

        this.grid = newGrid;
        this.generation++;
    }

    // Reset the grid (all cells to never lived state)
    reset() {
        this.grid = Array(this.rows)
            .fill(null)
            .map(() => Array(this.cols).fill(0));
        this.generation = 0;
    }

    // Random pattern
    randomize(probability = 0.3) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = Math.random() < probability ? 1 : 0;
            }
        }
    }
}

// UI Controller
document.addEventListener('DOMContentLoaded', () => {
    // Game configuration
    const CONFIG = {
        TARGET_CELL_SIZE: 10,
        DEFAULT_SPEED: 400,
        RANDOMIZE_PROBABILITY: 0.3,
        RESIZE_DEBOUNCE_TIME: 250
    };

    // Game state variables
    const state = {
        rows: 0,
        cols: 0,
        cellSize: 0,
        game: null,
        gameTimer: null,
        isRunning: false,
        isMouseDown: false,
        speed: CONFIG.DEFAULT_SPEED,
        resizeTimeout: null
    };

    // Cache DOM elements
    const elements = {
        grid: document.getElementById('grid'),
        generationCount: document.getElementById('generation-count'),
        speedSlider: document.getElementById('speed'),
        speedValue: document.getElementById('speed-value'),
        startButton: document.getElementById('start-button'),
        stopButton: document.getElementById('stop-button'),
        resetButton: document.getElementById('reset-button'),
        randomizeButton: document.getElementById('randomize-button')
    };

    // Initialize all event listeners
    function initEventListeners() {
        // Button controls
        elements.startButton.addEventListener('click', startGame);
        elements.stopButton.addEventListener('click', stopGame);
        elements.resetButton.addEventListener('click', resetGame);
        elements.randomizeButton.addEventListener('click', randomizeGrid);
        
        // Speed slider
        elements.speedSlider.addEventListener('input', handleSpeedChange);
        
        // Grid interaction via event delegation
        elements.grid.addEventListener('mousedown', handleGridMouseDown);
        elements.grid.addEventListener('mouseover', handleGridMouseOver);
        
        // Global events
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', handleWindowResize);
    }

    // Calculate grid dimensions to fill viewport with square cells
    function calculateGrid() {
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate how many cells fit in each dimension
        const possibleCols = Math.ceil(viewportWidth / CONFIG.TARGET_CELL_SIZE);
        const possibleRows = Math.ceil(viewportHeight / CONFIG.TARGET_CELL_SIZE);

        // Calculate actual cell sizes if we used those dimensions
        const cellWidthIfUsingCols = viewportWidth / possibleCols;
        const cellHeightIfUsingRows = viewportHeight / possibleRows;

        // Choose the larger cell size to ensure we fill or exceed the viewport
        if (cellWidthIfUsingCols > cellHeightIfUsingRows) {
            state.cellSize = cellWidthIfUsingCols;
            state.cols = possibleCols;
            state.rows = Math.ceil(viewportHeight / state.cellSize);
        } else {
            state.cellSize = cellHeightIfUsingRows;
            state.rows = possibleRows;
            state.cols = Math.ceil(viewportWidth / state.cellSize);
        }

        // Update CSS custom properties
        document.documentElement.style.setProperty('--rows', state.rows.toString());
        document.documentElement.style.setProperty('--cols', state.cols.toString());
        document.documentElement.style.setProperty('--cell-size', `${state.cellSize}px`);
    }

    // Initialize game of life
    function initializeGame() {
        // Reset timer if it's running
        stopGameTimer();

        // Initialize or reinitialize game
        state.game = new GameOfLife(state.rows, state.cols);
        
        // Create grid UI
        createGridUI();

        // Restart loop if we were running
        if (state.isRunning) {
            startGameLoop();
        }
    }
    
    // Stop the game timer if running
    function stopGameTimer() {
        if (state.gameTimer) {
            clearInterval(state.gameTimer);
            state.gameTimer = null;
        }
    }
    
    // Create the grid UI
    function createGridUI() {
        // Clear the grid
        elements.grid.innerHTML = '';
        
        // Set the grid dimensions
        elements.grid.style.gridTemplateColumns = `repeat(${state.cols}, ${state.cellSize}px)`;
        elements.grid.style.gridTemplateRows = `repeat(${state.rows}, ${state.cellSize}px)`;
        
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Add cells
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                fragment.appendChild(cell);
            }
        }
        
        // Add all cells to the grid at once
        elements.grid.appendChild(fragment);
        
        // Update generation counter
        updateUI();
    }
    
    // Update UI to match game state
    function updateUI() {
        const grid = state.game.getGrid();
        const cells = elements.grid.children;
        
        // Update cells
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.cols; col++) {
                const cellState = grid[row][col];
                const cellIndex = row * state.cols + col;
                const cell = cells[cellIndex];
                
                // Remove existing state classes
                cell.classList.remove('alive', 'dead');
                
                // Add appropriate class based on state
                if (cellState === 1) {
                    cell.classList.add('alive');
                } else if (cellState === 2) {
                    cell.classList.add('dead');
                }
            }
        }
        
        // Update generation counter
        elements.generationCount.textContent = state.game.getGeneration();
    }

    // Event Handlers
    
    // Handle grid mouse down (using event delegation)
    function handleGridMouseDown(event) {
        if (event.target.classList.contains('cell')) {
            state.isMouseDown = true;
            const row = parseInt(event.target.dataset.row);
            const col = parseInt(event.target.dataset.col);
            handleCellClick(row, col);
        }
    }
    
    // Handle grid mouse over (using event delegation)
    function handleGridMouseOver(event) {
        if (state.isMouseDown && event.target.classList.contains('cell')) {
            const row = parseInt(event.target.dataset.row);
            const col = parseInt(event.target.dataset.col);
            handleCellActivate(row, col);
        }
    }
    
    // Handle mouse up
    function handleMouseUp() {
        state.isMouseDown = false;
    }
    
    // Handle window resize with debounce
    function handleWindowResize() {
        if (state.resizeTimeout) {
            clearTimeout(state.resizeTimeout);
        }
        
        state.resizeTimeout = setTimeout(() => {
            calculateGrid();
            initializeGame();
        }, CONFIG.RESIZE_DEBOUNCE_TIME);
    }
    
    // Handle speed slider change
    function handleSpeedChange() {
        state.speed = parseInt(elements.speedSlider.value);
        updateSpeedDisplay();
    }

    // Cell Interaction
    
    // Handle cell click (toggle only between white and blue)
    function handleCellClick(row, col) {
        state.game.toggleCellAliveOnly(row, col);
        updateUI();
    }

    // Handle cell activation (only make alive, don't toggle)
    function handleCellActivate(row, col) {
        state.game.setCell(row, col, true); // Always set to alive
        updateUI();
    }

    // Game Control Functions
    
    // Start game loop
    function startGameLoop() {
        stopGameTimer();

        state.gameTimer = setInterval(() => {
            state.game.nextGeneration();
            updateUI();
        }, state.speed);
    }

    // Start game
    function startGame() {
        state.isRunning = true;
        elements.startButton.disabled = true;
        elements.stopButton.disabled = false;
        startGameLoop();
    }

    // Stop game
    function stopGame() {
        state.isRunning = false;
        elements.startButton.disabled = false;
        elements.stopButton.disabled = true;
        stopGameTimer();
    }

    // Reset game
    function resetGame() {
        // Stop the game first
        stopGame();

        // Then reset
        state.game.reset();
        updateUI();
    }

    // Randomize grid
    function randomizeGrid() {
        state.game.randomize(CONFIG.RANDOMIZE_PROBABILITY);
        updateUI();
    }
    
    // Update speed value display
    function updateSpeedDisplay() {
        elements.speedValue.textContent = `(${state.speed} ms)`;
        
        // Update game loop if running
        if (state.isRunning && state.gameTimer) {
            clearInterval(state.gameTimer);
            startGameLoop();
        }
    }

    // Initialize application
    function init() {
        // Set initial speed slider value
        elements.speedSlider.value = state.speed;
        updateSpeedDisplay();
        
        // Initialize all event listeners
        initEventListeners();
        
        // Calculate grid and start game
        calculateGrid();
        initializeGame();
    }

    // Start the application
    init();
});