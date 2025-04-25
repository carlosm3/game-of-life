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
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col] = alive ? 1 : 2; // If toggling, either make alive or mark as dead
        }
    }

    // Toggle a cell between never lived (0) and alive (1)
    toggleCellAliveOnly(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            // Get current state
            const currentState = this.grid[row][col];

            // Toggle only between never lived (0) and alive (1)
            this.grid[row][col] = currentState === 1 ? 0 : 1;
        }
    }

    // Count live neighbors of a cell
    countLiveNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                    if (this.grid[newRow][newCol] === 1) {
                        count++;
                    }
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
    // Target cell size in pixels
    const TARGET_CELL_SIZE = 10;

    // Game state variables
    let rows = 0;
    let cols = 0;
    let cellSize = 0;
    let game;
    let gameTimer;
    let isRunning = false;
    let isMouseDown = false;
    let speed = 400; // Default speed in milliseconds

    // Get DOM elements
    const gridElement = document.getElementById('grid');
    const generationCountElement = document.getElementById('generation-count');
    const speedSlider = document.getElementById('speed');
    const speedValueElement = document.getElementById('speed-value');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    const resetButton = document.getElementById('reset-button');
    const randomizeButton = document.getElementById('randomize-button');

    // Calculate grid dimensions to fill viewport with square cells
    function calculateGrid() {
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate how many cells fit in each dimension
        const possibleCols = Math.ceil(viewportWidth / TARGET_CELL_SIZE);
        const possibleRows = Math.ceil(viewportHeight / TARGET_CELL_SIZE);

        // Calculate actual cell sizes if we used those dimensions
        const cellWidthIfUsingCols = viewportWidth / possibleCols;
        const cellHeightIfUsingRows = viewportHeight / possibleRows;

        // Choose the larger cell size to ensure we fill or exceed the viewport
        if (cellWidthIfUsingCols > cellHeightIfUsingRows) {
            cellSize = cellWidthIfUsingCols;
            cols = possibleCols;
            rows = Math.ceil(viewportHeight / cellSize);
        } else {
            cellSize = cellHeightIfUsingRows;
            rows = possibleRows;
            cols = Math.ceil(viewportWidth / cellSize);
        }

        // Update CSS custom properties
        document.documentElement.style.setProperty('--rows', rows.toString());
        document.documentElement.style.setProperty('--cols', cols.toString());
        document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);

        // Reset game with new dimensions
        initializeGame();
    }

    // Initialize game of life
    function initializeGame() {
        // Reset timer if it's running
        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = undefined;
        }

        // Initialize or reinitialize game
        game = new GameOfLife(rows, cols);
        
        // Create grid UI
        createGridUI();

        // Restart loop if we were running
        if (isRunning) {
            startGameLoop();
        }
    }
    
    // Create the grid UI
    function createGridUI() {
        // Clear the grid
        gridElement.innerHTML = '';
        
        // Set the grid dimensions
        gridElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        gridElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
        
        // Add cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add event listeners for cell interaction
                cell.addEventListener('mousedown', (e) => {
                    isMouseDown = true;
                    handleCellClick(row, col);
                });
                
                cell.addEventListener('mouseover', (e) => {
                    if (isMouseDown) {
                        handleCellActivate(row, col);
                    }
                });
                
                gridElement.appendChild(cell);
            }
        }
        
        // Update generation counter
        updateUI();
    }
    
    // Update UI to match game state
    function updateUI() {
        const grid = game.getGrid();
        
        // Update cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellState = grid[row][col];
                const cellIndex = row * cols + col;
                const cell = gridElement.children[cellIndex];
                
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
        generationCountElement.textContent = game.getGeneration();
    }

    // Handle cell click (toggle only between white and blue)
    function handleCellClick(row, col) {
        game.toggleCellAliveOnly(row, col);
        updateUI();
    }

    // Handle cell activation (only make alive, don't toggle)
    function handleCellActivate(row, col) {
        game.setCell(row, col, true); // Always set to alive
        updateUI();
    }

    // Handle mouse up
    function handleMouseUp() {
        isMouseDown = false;
    }

    // Start game loop
    function startGameLoop() {
        if (gameTimer) clearInterval(gameTimer);

        gameTimer = setInterval(() => {
            game.nextGeneration();
            updateUI();
        }, speed);
    }

    // Start game
    function startGame() {
        isRunning = true;
        startButton.disabled = true;
        stopButton.disabled = false;
        startGameLoop();
    }

    // Stop game
    function stopGame() {
        isRunning = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = undefined;
        }
    }

    // Reset game
    function resetGame() {
        // Stop the game first
        stopGame();

        // Then reset
        game.reset();
        updateUI();
    }

    // Randomize grid
    function randomizeGrid() {
        game.randomize(0.3); // 30% chance for each cell to be alive
        updateUI();
    }
    
    // Update speed value display
    function updateSpeedDisplay() {
        speedValueElement.textContent = `(${speed} ms)`;
        
        // Update game loop if running
        if (isRunning && gameTimer) {
            clearInterval(gameTimer);
            startGameLoop();
        }
    }

    // Set up event listeners
    startButton.addEventListener('click', startGame);
    stopButton.addEventListener('click', stopGame);
    resetButton.addEventListener('click', resetGame);
    randomizeButton.addEventListener('click', randomizeGrid);
    speedSlider.addEventListener('input', () => {
        speed = parseInt(speedSlider.value);
        updateSpeedDisplay();
    });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', calculateGrid);

    // Initialize
    calculateGrid();
});