# Conway's Game of Life

A clean, responsive implementation of Conway's Game of Life using vanilla HTML, CSS, and JavaScript. This classic cellular automaton simulation demonstrates how complex patterns can emerge from simple rules.

![Conway's Game of Life](https://raw.githubusercontent.com/username/conways-game-of-life/main/screenshot.png)

## 🎮 Live Demo

Try it here: [Conway's Game of Life Demo](https://your-demo-url.com)

## 📖 About Conway's Game of Life

Conway's Game of Life is a zero-player game devised by mathematician John Conway in 1970. It simulates cellular automaton on a grid where cells live or die based on simple rules:

1. Any live cell with fewer than two live neighbors dies (underpopulation)
2. Any live cell with two or three live neighbors lives on (survival)
3. Any live cell with more than three live neighbors dies (overpopulation)
4. Any dead cell with exactly three live neighbors becomes a live cell (reproduction)

These simple rules lead to fascinating patterns and behaviors, making it a classic example of emergent complexity.

## ✨ Features

- **Responsive Grid**: Automatically adapts to any screen size while maintaining square cells
- **Interactive Controls**: 
  - Start/Stop the simulation
  - Reset the grid to a blank state
  - Generate random patterns
  - Adjust simulation speed
- **Cell Interaction**: Click to toggle cells or drag to draw alive cells
- **Cell States**: 
  - White: Never lived
  - Blue: Alive
  - Green: Dead (previously alive)
- **Generation Counter**: Tracks the number of simulation steps

## 🔧 Technical Implementation

This project is built using:

- **HTML5**: For structure
- **CSS3**: For styling and responsiveness
- **Vanilla JavaScript**: For game logic and UI interactions

Key technical features include:

- Dynamic grid sizing based on viewport dimensions
- Efficient cell state management
- Optimized rendering with minimal DOM operations
- Event delegation for performance
- Debounced window resize handling