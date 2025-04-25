export class GameOfLife {
	private grid: number[][]; // 0: never lived, 1: alive, 2: dead
	private rows: number;
	private cols: number;
	private generation: number = 0;

	constructor(rows: number, cols: number) {
		this.rows = rows;
		this.cols = cols;
		this.grid = Array(rows)
			.fill(null)
			.map(() => Array(cols).fill(0));
	}

	// Get the current grid
	public getGrid(): number[][] {
		return this.grid;
	}

	// Set a cell state
	public setCell(row: number, col: number, alive: boolean): void {
		if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
			this.grid[row][col] = alive ? 1 : 2; // If toggling, either make alive or mark as dead
		}
	}

	// Toggle a cell between never lived (0) and alive (1)
	public toggleCellAliveOnly(row: number, col: number): void {
		if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
			// Get current state
			const currentState = this.grid[row][col];

			// Toggle only between never lived (0) and alive (1)
			this.grid[row][col] = currentState === 1 ? 0 : 1;
		}
	}

	// NOTE: toggleCell and getCell methods were removed as they weren't being used

	// Count live neighbors of a cell
	private countLiveNeighbors(row: number, col: number): number {
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
	public getGeneration(): number {
		return this.generation;
	}

	// Calculate the next generation
	public nextGeneration(): void {
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
	public reset(): void {
		this.grid = Array(this.rows)
			.fill(null)
			.map(() => Array(this.cols).fill(0));
		this.generation = 0;
	}

	// Random pattern
	public randomize(probability: number = 0.3): void {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				this.grid[row][col] = Math.random() < probability ? 1 : 0;
			}
		}
	}
}
