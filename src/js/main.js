import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import { Player } from './player.js';
import { Terrain } from './terrain.js';
import { Building } from './building.js';
import { Weapon } from './weapon.js';
import { GameState } from './gameState.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        console.log("Game constructor started");
        
        // DOM elements
        this.canvas = document.getElementById('game-canvas');
        this.startScreen = document.getElementById('start-screen');
        this.startButton = document.getElementById('start-button');
        this.uiOverlay = document.getElementById('ui-overlay');
        
        // Game state
        this.gameState = new GameState();
        this.isGameRunning = true; // Start running immediately
        this.frameCount = 0; // Add frame counter
        
        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        // Physics world with reduced gravity for testing
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });
        
        // Disable OrbitControls for FPS mode
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.enabled = false;
        
        // Game elements
        this.player = null;
        this.terrain = null;
        this.buildings = [];
        this.weapons = [];
        this.npcs = [];
        
        // UI manager
        this.ui = new UI();
        
        // Lighting
        this.setupLights();
        
        // Event listeners
        this.setupEventListeners();
        
        // Clock for animations and game logic
        this.clock = new THREE.Clock();
        
        // Initial game setup
        this.init();
        
        // Hide start screen immediately
        this.startScreen.classList.add('hidden');
        
        // Update UI immediately
        this.ui.updateHealth(100);
        this.ui.updateMaterials({wood: 50, brick: 20, metal: 10});
        this.ui.updateWeapon({type: 'assault_rifle'});
        this.ui.updatePlayersLeft(100);
        
        console.log("Game constructor completed");
    }
    
    init() {
        console.log("Game init started");
        
        // Create terrain
        this.terrain = new Terrain(this.scene, this.world);
        
        // Setup skybox
        this.setupSkybox();
        
        // Add some initial buildings
        this.generateBuildings(20);
        
        // Add weapons for pickup
        this.generateWeapons(15);
        
        // Add NPCs (AI players)
        this.generateNPCs(99); // 99 other players for total of 100
        
        // Setup player (initially active)
        this.player = new Player(this.scene, this.world, this.camera);
        
        // Start animation loop
        this.animate();
        
        console.log("Game init completed");
    }
    
    setupLights() {
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
    }
    
    setupSkybox() {
        const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
        const skyboxMaterials = [
            new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide })
        ];
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
        this.scene.add(skybox);
    }
    
    generateBuildings(count) {
        for (let i = 0; i < count; i++) {
            // Random position within the map bounds
            const x = Math.random() * 400 - 200;
            const z = Math.random() * 400 - 200;
            const size = Math.random() * 5 + 5;
            const height = Math.random() * 10 + 5;
            
            const building = new Building(this.scene, this.world, x, 0, z, size, height);
            this.buildings.push(building);
        }
    }
    
    generateWeapons(count) {
        const weaponTypes = ['pistol', 'shotgun', 'assault_rifle', 'sniper'];
        
        for (let i = 0; i < count; i++) {
            // Random position within the map bounds
            const x = Math.random() * 400 - 200;
            const z = Math.random() * 400 - 200;
            const type = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
            
            const weapon = new Weapon(this.scene, this.world, x, 1, z, type);
            this.weapons.push(weapon);
        }
    }
    
    generateNPCs(count) {
        for (let i = 0; i < count; i++) {
            // NPCs will be implemented in npc.js
            // Here we'd create them and add them to the npcs array
            // For MVP, we'll just add placeholder data
            this.npcs.push({
                position: new THREE.Vector3(
                    Math.random() * 400 - 200,
                    1,
                    Math.random() * 400 - 200
                ),
                health: 100,
                isActive: true
            });
        }
    }
    
    startGame() {
        this.isGameRunning = true;
        this.startScreen.classList.add('hidden');
        
        // Activate player
        this.player.activate();
        
        // Lock pointer for FPS controls
        this.canvas.requestPointerLock();
        
        // Start the storm shrinking
        this.startStormShrinking();
        
        // Update UI with initial values
        this.ui.updateHealth(this.player.health);
        this.ui.updateMaterials(this.player.materials);
        this.ui.updatePlayersLeft(this.npcs.filter(npc => npc.isActive).length + 1);
    }
    
    startStormShrinking() {
        // This would implement the storm/circle shrinking mechanic
        // For MVP we'll just simulate it with a timer
        this.stormInterval = setInterval(() => {
            // Remove some NPCs to simulate them dying to the storm
            const activeNpcs = this.npcs.filter(npc => npc.isActive);
            if (activeNpcs.length > 0) {
                const randomIndex = Math.floor(Math.random() * activeNpcs.length);
                activeNpcs[randomIndex].isActive = false;
                
                // Update player count
                this.ui.updatePlayersLeft(this.npcs.filter(npc => npc.isActive).length + 1);
                
                // Check for victory
                if (this.npcs.filter(npc => npc.isActive).length === 0) {
                    this.victory();
                }
            }
        }, 5000); // Every 5 seconds
    }
    
    victory() {
        clearInterval(this.stormInterval);
        alert("Victory Royale!");
        // In a real game, we'd show a victory screen here
    }
    
    gameOver() {
        clearInterval(this.stormInterval);
        alert("Game Over!");
        // In a real game, we'd show a game over screen here
        // and allow the player to restart
        this.resetGame();
    }
    
    resetGame() {
        // Reset game state
        this.isGameRunning = false;
        this.startScreen.classList.remove('hidden');
        
        // Reset player
        this.player.reset();
        
        // Reset NPCs
        this.npcs.forEach(npc => {
            npc.isActive = true;
            npc.health = 100;
        });
        
        // Exit pointer lock
        document.exitPointerLock();
    }
    
    setupEventListeners() {
        // Start button click
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this.canvas) {
                // Pointer is locked, we're in FPS mode
                console.log("Pointer locked - FPS mode active");
            } else {
                console.log("Pointer unlocked - FPS mode inactive");
            }
        });
        
        // Add click handler to request pointer lock
        this.canvas.addEventListener('click', () => {
            if (document.pointerLockElement !== this.canvas) {
                this.canvas.requestPointerLock();
            }
        });
    }
    
    update() {
        const delta = Math.min(this.clock.getDelta(), 0.1); // Cap delta to avoid huge jumps
        this.frameCount++; // Increment frame counter
        
        // Update physics world
        this.world.step(1/60);
        
        // Always update player
        if (this.player) {
            this.player.update(delta);
            
            // Update UI
            this.ui.updateHealth(this.player.health);
            this.ui.updateMaterials(this.player.materials);
        }
        
        // Update other game elements
        this.weapons.forEach(weapon => weapon.update());
        this.terrain.update();
        
        // Update buildings only when needed
        if (this.frameCount % 10 === 0) {
            this.buildings.forEach(building => building.update());
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing game");
    const game = new Game();
});