export class GameState {
    constructor() {
        this.gameStarted = false;
        this.playerHealth = 100;
        this.playerPosition = { x: 0, y: 5, z: 0 };
        this.stormsStarted = false;
        this.stormRadius = 400;
        this.nextStormRadius = 300;
        this.playersRemaining = 30;
        this.playerEliminations = 0;
        this.gameWon = false;
        
        // Game settings
        this.settings = {
            stormDamage: 1,       // Damage per second
            stormShrinkTime: 60,  // Seconds
            maxPlayers: 30,
            debugMode: false
        };
    }
    
    startGame() {
        this.gameStarted = true;
        this.stormsStarted = true;
        this.playerHealth = 100;
        this.playerEliminations = 0;
        this.playersRemaining = this.settings.maxPlayers;
    }
    
    endGame(victory = false) {
        this.gameStarted = false;
        this.gameWon = victory;
    }
    
    playerTookDamage(amount) {
        this.playerHealth = Math.max(0, this.playerHealth - amount);
        return this.playerHealth;
    }
    
    playerEliminatedOpponent() {
        this.playerEliminations++;
        this.playersRemaining--;
        
        if (this.playersRemaining <= 1) {
            this.gameWon = true;
            return true; // Victory achieved
        }
        return false;
    }
    
    npcEliminated() {
        this.playersRemaining--;
        return this.playersRemaining <= 1;
    }
    
    updateStorm(nextRadius) {
        this.stormRadius = this.nextStormRadius;
        this.nextStormRadius = nextRadius;
    }
    
    isPlayerInStorm(playerPosition) {
        const distanceFromCenter = Math.sqrt(
            playerPosition.x * playerPosition.x + 
            playerPosition.z * playerPosition.z
        );
        
        return distanceFromCenter > this.stormRadius;
    }
    
    getGameStats() {
        return {
            health: this.playerHealth,
            eliminations: this.playerEliminations,
            playersRemaining: this.playersRemaining,
            stormRadius: this.stormRadius,
            nextStormRadius: this.nextStormRadius,
            gameWon: this.gameWon
        };
    }
} 