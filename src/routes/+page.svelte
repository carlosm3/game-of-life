<script lang="ts">
	import { onMount } from 'svelte';
	import { GameOfLife } from '../lib/gameOfLife';

	// Target cell size in pixels
	const TARGET_CELL_SIZE = 10;

	// Dynamic grid dimensions
	let rows = 0;
	let cols = 0;
	let cellSize = 0;
	let game: GameOfLife;
	let grid: number[][] = [];
	let gameTimer: number | undefined;

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

		// Reset game with new dimensions if they've changed
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
		grid = game.getGrid();
		// Generation is now tracked inside the GameOfLife class

		// Restart loop if we were running
		if (isRunning) {
			startGameLoop();
		}
	}

	// Track if mouse is down for drag operations
	let isMouseDown = false;

	// Handle cell click (toggle only between white and blue)
	function handleCellClick(row: number, col: number) {
		// Use the new toggleCellAliveOnly method
		game.toggleCellAliveOnly(row, col);
		// Update our local grid reference
		grid = game.getGrid();
	}

	// Handle cell activation (only make alive, don't toggle)
	function handleCellActivate(row: number, col: number) {
		game.setCell(row, col, true); // Always set to alive
		grid = game.getGrid();
	}

	// Handle mouse down on a cell
	function handleMouseDown(row: number, col: number) {
		isMouseDown = true;
		handleCellClick(row, col); // Toggle on initial click
	}

	// Handle mouse over a cell
	function handleMouseOver(row: number, col: number) {
		if (isMouseDown) {
			handleCellActivate(row, col); // Only make alive on drag
		}
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
			grid = game.getGrid();
			// Generation increment is now handled in the GameOfLife class
		}, speed);
	}

	// Calculate grid on mount and window resize
	onMount(() => {
		calculateGrid();
		window.addEventListener('resize', calculateGrid);

		// Add global mouse up listener for drag operations
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('resize', calculateGrid);
			window.removeEventListener('mouseup', handleMouseUp);
			if (gameTimer) clearInterval(gameTimer);
		};
	});

	// Generation is now tracked inside the GameOfLife class
	let speed = 400; // Default speed in milliseconds
	let isRunning = false;

	function startGame() {
		isRunning = true;
		startGameLoop();
	}

	function stopGame() {
		isRunning = false;
		if (gameTimer) {
			clearInterval(gameTimer);
			gameTimer = undefined;
		}
	}

	function resetGame() {
		// Stop the game first
		stopGame();

		// Then reset (GameOfLife.reset now also resets the generation counter)
		game.reset();
		grid = game.getGrid();
	}

	function randomizeGrid() {
		game.randomize(0.3); // 30% chance for each cell to be alive
		grid = game.getGrid();
	}

	// Get cell class based on state
	function getCellClass(state: number): string {
		switch (state) {
			case 1:
				return 'alive'; // Blue
			case 2:
				return 'dead'; // Green
			default:
				return ''; // White (never lived)
		}
	}

	// Update game loop when speed changes
	$: if (isRunning && gameTimer && speed) {
		clearInterval(gameTimer);
		startGameLoop();
	}
</script>

<div class="title-container">
	<h1>Conway's<br />Game of Life</h1>
</div>
<main>
	<div class="grid-container">
		<div class="grid">
			{#each Array(rows) as _, row}
				{#each Array(cols) as _, col}
					<div
						class="cell {getCellClass(grid[row]?.[col] || 0)}"
						on:mousedown={() => handleMouseDown(row, col)}
						on:mouseover={() => handleMouseOver(row, col)}
					></div>
				{/each}
			{/each}
		</div>
	</div>
</main>

<div class="controls-container">
	<div class="controls-content">
		<div class="generation-counter">
			Generation: {game?.getGeneration() ?? 0}
		</div>
		<div class="speed-slider">
			<label for="speed">Speed:</label>
			<input id="speed" type="range" min="50" max="1000" step="50" bind:value={speed} />
			<span>({speed} ms)</span>
		</div>
		<div class="controls-buttons">
			<button on:click={startGame} disabled={isRunning}>Start</button>
			<button on:click={stopGame} disabled={!isRunning}>Stop</button>
			<button on:click={resetGame}>Reset</button>
			<button on:click={randomizeGrid}>Randomize</button>
		</div>
	</div>
</div>

<style>
	/* Reset everything */
	*,
	*::before,
	*::after {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
	}

	/* Prevent scrollbars at all costs */
	html,
	body {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	/* Make main fill exactly the viewport */
	main {
		position: fixed;
		inset: 0;
		display: flex;
		background: #f9f9f9;
		overflow: hidden;
	}

	/* Grid container fills entire viewport */
	.grid-container {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	/* Grid that fills entire space with square cells */
	.grid {
		display: grid;
		grid-template-columns: repeat(var(--cols), var(--cell-size, 20px));
		grid-template-rows: repeat(var(--rows), var(--cell-size, 20px));
		width: 100%;
		height: 100%;
	}

	/* Square cells with consistent dimensions */
	.cell {
		outline: 0.5px solid #e0e0e0;
		background: white; /* Default: never lived */
		width: var(--cell-size, 20px);
		height: var(--cell-size, 20px);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.cell.alive {
		background: #2563eb; /* Blue for alive cells */
	}

	.cell.dead {
		background: #22c55e; /* Green for dead cells */
	}
	.title-container {
		position: fixed;
		top: 24px;
		left: 0;
		right: 0;
		z-index: 10;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}
	.title-container h1 {
		background: rgba(61, 61, 61, 0.9);
		color: #fff;
		font-size: 2.2rem;
		padding: 12px 36px;
		border-radius: 12px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
		font-weight: 700;
		letter-spacing: 0.04em;
		margin: 0;
		pointer-events: auto;
		min-width: 320px;
		max-width: 420px;
		width: 100%;
		text-align: center;
		box-sizing: border-box;
	}
	.controls-content {
		background: rgba(61, 61, 61, 0.9);
		color: #fff;
		border-radius: 12px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		padding: 18px 36px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		align-items: center;
		min-width: 320px;
		max-width: 420px;
		width: 100%;
		pointer-events: auto;
		box-sizing: border-box;
	}
	@media (min-width: 600px) {
		.controls-content {
			max-width: 600px;
		}
	}
	@media (min-width: 900px) {
		.controls-content {
			max-width: 900px;
		}
	}

	.controls-container {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 24px;
		z-index: 10;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}
	/* Controls content styles defined above */
	/* All font-family is already set in the global reset */
	.generation-counter {
		font-size: 1.1rem;
		font-weight: 500;
		letter-spacing: 0.03em;
	}
	.speed-slider {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
	}
	.speed-slider label {
		font-size: 1rem;
	}
	.speed-slider input[type='range'] {
		flex: 1;
		accent-color: #222b3a;
		background: #1a1a1a;
		height: 4px;
		border-radius: 2px;
	}
	.speed-slider span {
		font-size: 0.95rem;
		min-width: 56px;
		text-align: right;
	}
	.controls-buttons {
		display: flex;
		gap: 12px;
	}
	.controls-buttons button {
		background: #23272f;
		color: #fff;
		border: none;
		border-radius: 6px;
		padding: 8px 20px;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		cursor: pointer;
		transition: background 0.15s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	.controls-buttons button:disabled {
		background: #444952;
		color: #bbb;
		cursor: not-allowed;
	}
	.controls-buttons button:not(:disabled):hover,
	.controls-buttons button:not(:disabled):focus {
		background: #353b47;
	}
</style>
