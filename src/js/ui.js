export class UI {
    constructor() {
        this.setupUI();
    }
    
    setupUI() {
        // Check if UI already exists
        if (document.getElementById('ui-overlay')) {
            return;
        }
        
        // Create UI overlay
        const overlay = document.createElement('div');
        overlay.id = 'ui-overlay';
        overlay.classList.add('ui-overlay');
        
        // Health bar
        const healthContainer = document.createElement('div');
        healthContainer.classList.add('health-container');
        
        const healthIcon = document.createElement('div');
        healthIcon.classList.add('health-icon');
        healthIcon.innerHTML = '❤️';
        
        const healthBar = document.createElement('div');
        healthBar.classList.add('health-bar');
        
        const healthFill = document.createElement('div');
        healthFill.id = 'health-fill';
        healthFill.classList.add('health-fill');
        
        const healthText = document.createElement('div');
        healthText.id = 'health-text';
        healthText.classList.add('health-text');
        healthText.innerText = '100';
        
        healthBar.appendChild(healthFill);
        healthBar.appendChild(healthText);
        healthContainer.appendChild(healthIcon);
        healthContainer.appendChild(healthBar);
        
        // Ammo display
        const ammoContainer = document.createElement('div');
        ammoContainer.classList.add('ammo-container');
        
        const ammoIcon = document.createElement('div');
        ammoIcon.classList.add('ammo-icon');
        ammoIcon.innerHTML = '🔫';
        
        const ammoText = document.createElement('div');
        ammoText.id = 'ammo-text';
        ammoText.classList.add('ammo-text');
        ammoText.innerText = '30 / 90';
        
        ammoContainer.appendChild(ammoIcon);
        ammoContainer.appendChild(ammoText);
        
        // Kills counter
        const killsContainer = document.createElement('div');
        killsContainer.classList.add('kills-container');
        
        const killsIcon = document.createElement('div');
        killsIcon.classList.add('kills-icon');
        killsIcon.innerHTML = '💀';
        
        const killsText = document.createElement('div');
        killsText.id = 'kills-text';
        killsText.classList.add('kills-text');
        killsText.innerText = '0';
        
        killsContainer.appendChild(killsIcon);
        killsContainer.appendChild(killsText);
        
        // Players remaining
        const playersContainer = document.createElement('div');
        playersContainer.classList.add('players-container');
        
        const playersIcon = document.createElement('div');
        playersIcon.classList.add('players-icon');
        playersIcon.innerHTML = '👥';
        
        const playersText = document.createElement('div');
        playersText.id = 'players-text';
        playersText.classList.add('players-text');
        playersText.innerText = '30';
        
        playersContainer.appendChild(playersIcon);
        playersContainer.appendChild(playersText);
        
        // Add damage overlay (red flash when taking damage)
        const damageOverlay = document.createElement('div');
        damageOverlay.id = 'damage-overlay';
        damageOverlay.classList.add('damage-overlay');
        
        // Add all elements to the overlay
        overlay.appendChild(healthContainer);
        overlay.appendChild(ammoContainer);
        overlay.appendChild(killsContainer);
        overlay.appendChild(playersContainer);
        
        // Add crosshair
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.classList.add('crosshair');
        crosshair.innerHTML = '+';
        
        // Add everything to the body
        document.body.appendChild(overlay);
        document.body.appendChild(crosshair);
        document.body.appendChild(damageOverlay);
        
        // Add CSS
        this.addStyles();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ui-overlay {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
                user-select: none;
                font-family: 'Arial', sans-serif;
            }
            
            .health-container, .ammo-container, .kills-container, .players-container {
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(0, 0, 0, 0.5);
                padding: 5px 10px;
                border-radius: 5px;
                color: white;
            }
            
            .health-icon, .ammo-icon, .kills-icon, .players-icon {
                font-size: 24px;
            }
            
            .health-bar {
                width: 150px;
                height: 20px;
                background: rgba(255, 0, 0, 0.3);
                border-radius: 10px;
                overflow: hidden;
                position: relative;
            }
            
            .health-fill {
                width: 100%;
                height: 100%;
                background: linear-gradient(to right, #ff0000, #ff5e00);
                border-radius: 10px;
                transition: width 0.3s ease;
            }
            
            .health-text, .ammo-text, .kills-text, .players-text {
                font-size: 18px;
                font-weight: bold;
            }
            
            .health-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-shadow: 0 0 3px black;
            }
            
            .crosshair {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: white;
                pointer-events: none;
                user-select: none;
                text-shadow: 0 0 3px black;
            }
            
            .damage-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 0, 0, 0.3);
                pointer-events: none;
                z-index: 999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .victory-screen, .game-over-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                color: white;
                font-family: 'Arial', sans-serif;
            }
            
            .victory-screen h1 {
                font-size: 48px;
                color: #ffcc00;
                text-shadow: 0 0 10px #ff9900;
                margin-bottom: 20px;
            }
            
            .game-over-screen h1 {
                font-size: 48px;
                color: #ff3333;
                text-shadow: 0 0 10px #ff0000;
                margin-bottom: 20px;
            }
            
            .victory-screen p, .game-over-screen p {
                font-size: 24px;
                margin: 10px 0;
            }
            
            #restart-button {
                margin-top: 30px;
                padding: 10px 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 18px;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            #restart-button:hover {
                background: #45a049;
            }
        `;
        document.head.appendChild(style);
    }
    
    updateHealth(health) {
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        
        if (healthFill && healthText) {
            const healthPercent = Math.max(0, Math.min(100, health)) / 100;
            healthFill.style.width = `${healthPercent * 100}%`;
            healthText.innerText = Math.round(health);
            
            // Change color based on health
            if (health > 60) {
                healthFill.style.background = 'linear-gradient(to right, #ff0000, #ff5e00)';
            } else if (health > 30) {
                healthFill.style.background = 'linear-gradient(to right, #ff0000, #ffcc00)';
            } else {
                healthFill.style.background = '#ff0000';
            }
        }
    }
    
    updateAmmo(current, total) {
        const ammoText = document.getElementById('ammo-text');
        
        if (ammoText) {
            ammoText.innerText = `${current} / ${total}`;
            
            // Highlight when low on ammo
            if (current <= 5) {
                ammoText.style.color = '#ff3333';
            } else {
                ammoText.style.color = 'white';
            }
        }
    }
    
    updateKills(kills) {
        const killsText = document.getElementById('kills-text');
        
        if (killsText) {
            killsText.innerText = kills;
        }
    }
    
    updatePlayersLeft(count) {
        const playersText = document.getElementById('players-text');
        
        if (playersText) {
            playersText.innerText = count;
            
            // Highlight when few players remain
            if (count <= 5) {
                playersText.style.color = '#ffcc00';
            } else {
                playersText.style.color = 'white';
            }
        }
    }
    
    showGameOverScreen(isVictory) {
        // Create game over/victory screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.top = '0';
        gameOverScreen.style.left = '0';
        gameOverScreen.style.width = '100%';
        gameOverScreen.style.height = '100%';
        gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.flexDirection = 'column';
        gameOverScreen.style.justifyContent = 'center';
        gameOverScreen.style.alignItems = 'center';
        gameOverScreen.style.color = 'white';
        gameOverScreen.style.zIndex = '1000';
        
        const message = document.createElement('h1');
        message.textContent = isVictory ? 'Victory Royale!' : 'Game Over';
        message.style.fontSize = '4rem';
        message.style.marginBottom = '2rem';
        message.style.color = isVictory ? '#f8c300' : '#e74c3c';
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Play Again';
        restartButton.style.padding = '15px 30px';
        restartButton.style.fontSize = '1.5rem';
        restartButton.style.backgroundColor = '#f8c300';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        
        restartButton.addEventListener('click', () => {
            document.body.removeChild(gameOverScreen);
            // Trigger game restart
            const event = new CustomEvent('restartGame');
            document.dispatchEvent(event);
        });
        
        gameOverScreen.appendChild(message);
        gameOverScreen.appendChild(restartButton);
        document.body.appendChild(gameOverScreen);
    }
    
    showStormWarning() {
        // Create a storm warning message
        const warningMessage = document.createElement('div');
        warningMessage.className = 'storm-warning';
        warningMessage.style.position = 'absolute';
        warningMessage.style.top = '20%';
        warningMessage.style.left = '50%';
        warningMessage.style.transform = 'translateX(-50%)';
        warningMessage.style.backgroundColor = 'rgba(200, 0, 0, 0.7)';
        warningMessage.style.color = 'white';
        warningMessage.style.padding = '15px 30px';
        warningMessage.style.borderRadius = '5px';
        warningMessage.style.fontSize = '1.5rem';
        warningMessage.style.textAlign = 'center';
        warningMessage.style.zIndex = '100';
        warningMessage.textContent = 'Storm approaching! Move to the safe zone!';
        
        document.body.appendChild(warningMessage);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(warningMessage)) {
                document.body.removeChild(warningMessage);
            }
        }, 5000);
    }
    
    showDamageIndicator(direction) {
        // Create a damage indicator in the direction of the damage
        const damageIndicator = document.createElement('div');
        damageIndicator.className = 'damage-indicator';
        damageIndicator.style.position = 'absolute';
        damageIndicator.style.width = '100px';
        damageIndicator.style.height = '100px';
        damageIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        damageIndicator.style.zIndex = '50';
        
        // Position based on direction
        switch (direction) {
            case 'front':
                damageIndicator.style.top = '0';
                damageIndicator.style.left = '50%';
                damageIndicator.style.transform = 'translateX(-50%)';
                break;
            case 'back':
                damageIndicator.style.bottom = '0';
                damageIndicator.style.left = '50%';
                damageIndicator.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                damageIndicator.style.top = '50%';
                damageIndicator.style.left = '0';
                damageIndicator.style.transform = 'translateY(-50%)';
                break;
            case 'right':
                damageIndicator.style.top = '50%';
                damageIndicator.style.right = '0';
                damageIndicator.style.transform = 'translateY(-50%)';
                break;
            default:
                // Default to center
                damageIndicator.style.top = '50%';
                damageIndicator.style.left = '50%';
                damageIndicator.style.transform = 'translate(-50%, -50%)';
        }
        
        document.body.appendChild(damageIndicator);
        
        // Remove after 0.5 seconds
        setTimeout(() => {
            if (document.body.contains(damageIndicator)) {
                document.body.removeChild(damageIndicator);
            }
        }, 500);
    }
    
    showPickupMessage(itemName) {
        // Show a message when an item is picked up
        const pickupMessage = document.createElement('div');
        pickupMessage.className = 'pickup-message';
        pickupMessage.style.position = 'absolute';
        pickupMessage.style.bottom = '30%';
        pickupMessage.style.left = '50%';
        pickupMessage.style.transform = 'translateX(-50%)';
        pickupMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        pickupMessage.style.color = 'white';
        pickupMessage.style.padding = '10px 20px';
        pickupMessage.style.borderRadius = '5px';
        pickupMessage.style.fontSize = '1.2rem';
        pickupMessage.style.zIndex = '100';
        pickupMessage.textContent = `Picked up ${itemName}`;
        
        document.body.appendChild(pickupMessage);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (document.body.contains(pickupMessage)) {
                document.body.removeChild(pickupMessage);
            }
        }, 2000);
    }
} 