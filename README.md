# Fortnite Clone with Three.js

A simple Fortnite-inspired battle royale game built using Three.js and Cannon.js for physics.

## Features

- First-person shooter mechanics
- Battle royale gameplay with shrinking storm
- Building mechanics (walls)
- Resource gathering (wood, brick, metal)
- Multiple weapons with different stats
- Simple AI opponents
- Physics-based interactions
- Terrain with trees and rocks

## Controls

- **W, A, S, D**: Movement
- **Mouse**: Look around
- **Click**: Shoot
- **Space**: Jump
- **F**: Build a wall
- **1-4**: Switch weapons (when available)

## Development

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
```
npm install
```
3. Start the development server:
```
npm run dev
```
4. Open your browser at `http://localhost:5173`

## How to Play

1. Click the "Start Game" button on the main screen
2. You'll be dropped onto the island with 99 AI opponents
3. Gather resources by approaching trees (wood) and rocks (brick)
4. Find weapons scattered throughout the map
5. Stay inside the safe zone (outside the storm)
6. Be the last player standing to win!

## Technical Details

This game is built using:

- **Three.js**: For 3D rendering
- **Cannon.js**: For physics simulation
- **Vite**: For development and building
- Pure JavaScript with ES6 modules

The game is structured with the following components:

- `Game`: Main game controller
- `Player`: Player movement, actions, and state
- `Terrain`: World generation and environment
- `Building`: Structures that can be built by players
- `Weapon`: Weapon types and shooting mechanics
- `GameState`: Game state management and storm mechanics
- `UI`: User interface elements

## Future Improvements

This is an MVP (Minimum Viable Product) version. Future improvements could include:

- More detailed models and textures
- Advanced AI behavior
- More weapon types
- Additional building shapes (stairs, floors, etc.)
- Mobile support
- Multiplayer functionality
- Sound effects and music
- Game progression and leveling system

## License

MIT 