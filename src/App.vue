<script setup>
import { ref, onUnmounted, onMounted } from 'vue'

// Target cell size in pixels (will be used to calculate grid dimensions)
const TARGET_CELL_SIZE = 25

// Reactive refs for grid dimensions
const gridDimensions = ref({
  width: 0,
  height: 0
})

// Calculate grid dimensions based on viewport
const calculateGridDimensions = () => {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight - 200

  const columns = Math.floor(viewportWidth / TARGET_CELL_SIZE)
  const rows = Math.floor(viewportHeight / TARGET_CELL_SIZE)

  return { width: columns, height: rows }
}

// Initialize grid with calculated dimensions
const initializeGrid = () => {
  const dims = calculateGridDimensions()
  gridDimensions.value = dims
  return Array(dims.height).fill().map(() => Array(dims.width).fill(false))
}

const grid = ref(initializeGrid())
const isRunning = ref(false)
const iterations = ref(0)
const livingCells = ref(0)
const speed = ref(500)
let intervalId = null

// Handle window resize
let resizeTimeout
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const newDims = calculateGridDimensions()
    if (newDims.width !== gridDimensions.value.width || 
        newDims.height !== gridDimensions.value.height) {
      isRunning.value = false
      clearInterval(intervalId)
      gridDimensions.value = newDims
      grid.value = initializeGrid()
      iterations.value = 0
      livingCells.value = 0
    }
  }, 250) // Debounce resize events
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (intervalId) {
    clearInterval(intervalId)
  }
  clearTimeout(resizeTimeout)
})

const toggleCell = (row, col) => {
  if (!isRunning.value) {
    grid.value[row][col] = !grid.value[row][col]
  }
}

const countNeighbors = (row, col) => {
  let count = 0
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue
      const newRow = row + i
      const newCol = col + j
      if (newRow >= 0 && newRow < gridDimensions.value.height && 
          newCol >= 0 && newCol < gridDimensions.value.width) {
        count += grid.value[newRow][newCol] ? 1 : 0
      }
    }
  }
  return count
}

const updateGrid = () => {
  const newGrid = Array(gridDimensions.value.height).fill()
    .map(() => Array(gridDimensions.value.width).fill(false))
  
  for (let row = 0; row < gridDimensions.value.height; row++) {
    for (let col = 0; col < gridDimensions.value.width; col++) {
      const neighbors = countNeighbors(row, col)
      const isAlive = grid.value[row][col]
      
      if (isAlive && (neighbors === 2 || neighbors === 3)) {
        newGrid[row][col] = true
      } else if (!isAlive && neighbors === 3) {
        newGrid[row][col] = true
      }
    }
  }
  
  grid.value = newGrid
  iterations.value++
  livingCells.value = newGrid.flat().filter(cell => cell).length
}

const toggleSimulation = () => {
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    intervalId = setInterval(updateGrid, 1000 - speed.value)
  } else {
    clearInterval(intervalId)
  }
}

const resetGrid = () => {
  isRunning.value = false
  clearInterval(intervalId)
  grid.value = initializeGrid()
  iterations.value = 0
  livingCells.value = 0
}

const randomize = () => {
  grid.value = Array(gridDimensions.value.height).fill()
    .map(() => Array(gridDimensions.value.width).fill()
    .map(() => Math.random() > 0.7))
}

const updateSpeed = () => {
  // Snap to middle if within 50 units of center
  if (Math.abs(speed.value - 500) <= 50) {
    speed.value = 500
  }
  
  if (isRunning.value) {
    clearInterval(intervalId)
    intervalId = setInterval(updateGrid, 1000 - speed.value)
  }
}
</script>

<template>
  <div class="container">
    <h1>Game of Life</h1>
    <div class="stats">
      <p>Iterations: {{ iterations }}</p>
      <p>Living Cells: {{ livingCells }}</p>
    </div>
    <div class="controls">
      <button @click="toggleSimulation">{{ isRunning ? 'Stop' : 'Start' }}</button>
      <button @click="resetGrid">Reset</button>
      <button @click="randomize">Randomize</button>
    </div>
    <div class="speed-control">
      <input 
        type="range" 
        id="speed" 
        v-model="speed" 
        @input="updateSpeed"
        @change="updateSpeed"
        min="0" 
        max="1000" 
        step="10"
        class="speed-slider"
      >
    </div>
    <div class="grid-container">
      <div class="grid">
        <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="cell"
            :class="{ alive: cell }"
            @click="toggleCell(rowIndex, colIndex)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Global reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #1e1e1e;
}
</style>

<style scoped>
.container {
  width: 100vw;
  min-height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
}

.controls {
  padding: 10px 0;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px 0;
  font-size: 1.1em;
  color: white;
}

.speed-control {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.speed-slider {
  width: 200px;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #444;
  outline: none;
  border-radius: 4px;
}

.grid-container {
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
}

.grid {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #333;
  gap: 1px;
  margin-top: 20px;
}

.row {
  display: flex;
  gap: 1px;
}

.cell {
  width: 25px;
  height: 25px;
  background-color: white;
  transition: background-color 0.2s;
  border: 1px solid #ddd;
}

.cell:hover {
  background-color: #e3f2fd;
}

.cell.alive {
  background-color: #2196f3;
}

h1 {
  color: #2196f3;
  margin: 20px 0;
  font-size: 2.5em;
}

button {
  margin: 0 10px;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #1976d2;
}
</style>
