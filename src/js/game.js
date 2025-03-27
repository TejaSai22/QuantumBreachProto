import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class Game {
    constructor() {
        console.log("Game initializing...");
        
        // DOM elements
        this.canvas = document.getElementById('game-canvas');
        this.startScreen = document.getElementById('start-screen');
        this.startButton = document.getElementById('start-button');
        this.healthValue = document.getElementById('health-value');
        this.healthFill = document.getElementById('health-fill');
        this.ammoValue = document.getElementById('ammo-value');
        this.totalAmmoValue = document.getElementById('total-ammo-value');
        this.playersLeftValue = document.getElementById('players-left-value');
        
        // Game state
        this.isRunning = false;
        this.playerHealth = 1000;
        this.playerAmmo = 300;
        this.playerTotalAmmo = 900;
        this.playersLeft = 100;
        this.playerPosition = new THREE.Vector3(0, 2, 0);
        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();
        this.canJump = true;
        
        // Movement controls
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.isShooting = false;
        this.lastShot = 0;
        this.shotCooldown = 200; // milliseconds
        
        // Setup Three.js scene
        this.setupScene();
        
        // Setup physics
        this.setupPhysics();
        
        // Create environment
        this.createTerrain();
        this.createSkybox();
        
        // Create player
        this.createPlayer();
        
        // Create NPCs (bots)
        this.npcs = [];
        
        // Add event listeners
        this.addEventListeners();
        
        // Animation loop
        this.clock = new THREE.Clock();
        this.animate();
        
        console.log("Game initialization complete");
    }
    
    setupScene() {
        console.log("Setting up scene...");
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue background
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        
        // Create lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    setupPhysics() {
        console.log("Setting up physics...");
        
        // Create physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -20, 0); // Stronger gravity for better ground detection
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        
        // Add contact material to improve player-ground contact
        const groundMaterial = new CANNON.Material('ground');
        const playerMaterial = new CANNON.Material('player');
        
        const contactMaterial = new CANNON.ContactMaterial(
            groundMaterial,
            playerMaterial,
            {
                friction: 0.3,
                restitution: 0.1,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }
        );
        
        this.world.addContactMaterial(contactMaterial);
        this.groundMaterial = groundMaterial;
        this.playerMaterial = playerMaterial;
    }
    
    createTerrain() {
        console.log("Creating terrain...");
        
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x44aa44,
            roughness: 0.8,
            metalness: 0.2
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        
        // Create ground physics body
        const groundShape = new CANNON.Plane();
        this.groundBody = new CANNON.Body({
            mass: 0, // static body
            shape: groundShape,
            material: this.groundMaterial
        });
        this.groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.addBody(this.groundBody);
    }
    
    createSkybox() {
        console.log("Creating skybox...");
        
        // Simple skybox
        const skyGeometry = new THREE.BoxGeometry(900, 900, 900);
        const skyMaterials = [
            new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // right
            new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // left
            new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // top
            new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // bottom
            new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // front
            new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide })  // back
        ];
        const skybox = new THREE.Mesh(skyGeometry, skyMaterials);
        this.scene.add(skybox);
    }
    
    createPlayer() {
        console.log("Creating player...");
        
        // Player character (invisible in FPS mode)
        const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.playerMesh.position.copy(this.playerPosition);
        this.playerMesh.visible = false; // Invisible in FPS mode
        this.scene.add(this.playerMesh);
        
        // Player physics body
        const playerShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
        this.playerBody = new CANNON.Body({
            mass: 80,
            shape: playerShape,
            material: this.playerMaterial,
            position: new CANNON.Vec3(0, 2, 0),
            fixedRotation: true // Prevent player from tipping over
        });
        
        // Add player body to world
        this.world.addBody(this.playerBody);
        
        // Create weapon model for player
        this.createWeaponModel();
    }
    
    createWeaponModel() {
        // Create a simple weapon model
        this.weaponGroup = new THREE.Group();
        
        // Gun body
        const gunBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 0.5),
            new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        gunBody.position.set(0.3, -0.3, -0.5);
        this.weaponGroup.add(gunBody);
        
        // Gun handle
        const gunHandle = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.2, 0.08),
            new THREE.MeshLambertMaterial({ color: 0x222222 })
        );
        gunHandle.position.set(0.3, -0.4, -0.3);
        this.weaponGroup.add(gunHandle);
        
        // Add to camera
        this.camera.add(this.weaponGroup);
        this.scene.add(this.camera);
    }
    
    createNPC(x, z) {
        // Create NPC mesh
        const npcGeometry = new THREE.BoxGeometry(1, 2, 1);
        const npcMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        const npcMesh = new THREE.Mesh(npcGeometry, npcMaterial);
        npcMesh.position.set(x, 1, z);
        npcMesh.castShadow = true;
        this.scene.add(npcMesh);
        
        // Create NPC physics body
        const npcShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
        const npcBody = new CANNON.Body({
            mass: 80,
            shape: npcShape
        });
        npcBody.position.set(x, 1, z);
        this.world.addBody(npcBody);
        
        // Create health bar for NPC
        const healthBarGroup = new THREE.Group();
        
        // Health bar background
        const healthBarBg = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        healthBarGroup.add(healthBarBg);
        
        // Health bar fill
        const healthBarFill = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 0.15),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        healthBarFill.position.z = 0.01;
        healthBarGroup.add(healthBarFill);
        
        // Position health bar above NPC
        healthBarGroup.position.y = 2.5;
        healthBarGroup.rotation.x = -Math.PI / 6; // Tilt slightly toward camera
        npcMesh.add(healthBarGroup);
        
        // NPC data
        const npc = {
            mesh: npcMesh,
            body: npcBody,
            health: 100,
            healthBar: healthBarFill,
            isActive: true,
            lastShot: 0,
            shootCooldown: 1000 + Math.random() * 2000 // Randomize shooting
        };
        
        this.npcs.push(npc);
        
        return npc;
    }
    
    spawnNPCs() {
        console.log("Spawning NPCs...");
        
        // Spawn NPCs around the map
        for (let i = 0; i < this.playersLeft - 1; i++) {
            // Random position within a radius
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 80; // Between 20 and 100 units away
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            this.createNPC(x, z);
        }
    }
    
    addEventListeners() {
        console.log("Adding event listeners...");
        
        // Start button
        this.startButton.addEventListener('click', () => {
            console.log("Start button clicked");
            this.startGame();
        });
        
        // Canvas click (for pointer lock)
        this.canvas.addEventListener('click', () => {
            if (this.isRunning && document.pointerLockElement !== this.canvas) {
                console.log("Canvas clicked, requesting pointer lock");
                this.canvas.requestPointerLock();
            }
        });
        
        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this.canvas) {
                console.log("Pointer locked");
            } else if (this.isRunning) {
                console.log("Pointer unlocked");
            }
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (!this.isRunning) return;
            
            switch (event.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'Space': 
                    if (this.canJump) {
                        console.log("Jump!");
                        this.playerBody.velocity.y = 10;
                        this.canJump = false;
                    }
                    break;
                case 'KeyR': this.reloadWeapon(); break;
                case 'Escape':
                    if (document.pointerLockElement === this.canvas) {
                        document.exitPointerLock();
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            if (!this.isRunning) return;
            
            switch (event.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyD': this.moveRight = false; break;
            }
        });
        
        // Mouse controls for looking around
        document.addEventListener('mousemove', (event) => {
            if (!this.isRunning) return;
            
            if (document.pointerLockElement === this.canvas) {
                // Mouse movement creates rotation
                this.camera.rotation.y -= event.movementX * 0.002;
                this.camera.rotation.x -= event.movementY * 0.002;
                
                // Clamp vertical rotation to avoid flipping
                this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
            }
        });
        
        // Mouse click for shooting
        document.addEventListener('mousedown', (event) => {
            if (!this.isRunning) return;
            
            if (event.button === 0) { // left click
                this.isShooting = true;
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (!this.isRunning) return;
            
            if (event.button === 0) {
                this.isShooting = false;
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    startGame() {
        console.log("Starting game...");
        
        // Hide start screen
        this.startScreen.classList.add('hidden');
        
        // Lock pointer
        this.canvas.requestPointerLock();
        
        // Start the game
        this.isRunning = true;
        
        // Spawn NPCs
        this.spawnNPCs();
        
        // Start with full health and ammo
        this.updateHealth(1000);
        this.updateAmmo(300, 900);
        this.updatePlayersLeft(this.playersLeft);
        
        console.log("Game started!");
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown || this.playerAmmo <= 0) {
            return;
        }
        
        this.lastShot = now;
        
        // Decrease ammo
        this.playerAmmo--;
        this.updateAmmo(this.playerAmmo, this.playerTotalAmmo);
        
        // Create bullet
        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        // Position bullet at camera position
        bullet.position.copy(this.camera.position);
        
        // Direction from camera
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        
        // Set velocity
        bullet.userData.velocity = direction.multiplyScalar(50);
        bullet.userData.lifetime = 2000; // 2 seconds
        bullet.userData.born = now;
        
        // Add to scene
        this.scene.add(bullet);
        
        // Store bullet
        if (!this.bullets) {
            this.bullets = [];
        }
        this.bullets.push(bullet);
    }
    
    reloadWeapon() {
        if (this.playerTotalAmmo <= 0 || this.playerAmmo >= 30) {
            return;
        }
        
        // Calculate ammo to reload
        const ammoNeeded = 30 - this.playerAmmo;
        const ammoToReload = Math.min(ammoNeeded, this.playerTotalAmmo);
        
        this.playerAmmo += ammoToReload;
        this.playerTotalAmmo -= ammoToReload;
        
        this.updateAmmo(this.playerAmmo, this.playerTotalAmmo);
    }
    
    updateBullets(deltaTime) {
        if (!this.bullets || this.bullets.length === 0) {
            return;
        }
        
        const now = Date.now();
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Move bullet
            bullet.position.x += bullet.userData.velocity.x * deltaTime;
            bullet.position.y += bullet.userData.velocity.y * deltaTime;
            bullet.position.z += bullet.userData.velocity.z * deltaTime;
            
            // Check lifetime
            if (now - bullet.userData.born > bullet.userData.lifetime) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Check collisions with NPCs
            this.npcs.forEach(npc => {
                if (!npc.isActive) return;
                
                const distance = bullet.position.distanceTo(npc.mesh.position);
                if (distance < 1.5) {
                    // Hit NPC
                    npc.health -= 25; // Damage amount
                    
                    // Update health bar
                    npc.healthBar.scale.x = Math.max(0, npc.health / 100);
                    
                    // Check if NPC is dead
                    if (npc.health <= 0) {
                        npc.isActive = false;
                        npc.mesh.visible = false;
                        this.world.removeBody(npc.body);
                        
                        // Update players left
                        this.playersLeft--;
                        this.updatePlayersLeft(this.playersLeft);
                        
                        // Check if player won
                        if (this.playersLeft <= 1) {
                            this.victory();
                        }
                    }
                    
                    // Remove bullet
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);
                    return;
                }
            });
        }
    }
    
    updateNPCs(deltaTime) {
        this.npcs.forEach(npc => {
            if (!npc.isActive) return;
            
            // Update mesh position from physics body
            npc.mesh.position.copy(npc.body.position);
            npc.mesh.quaternion.copy(npc.body.quaternion);
            
            // Make NPC face player
            const dirToPlayer = new THREE.Vector3()
                .subVectors(this.camera.position, npc.mesh.position)
                .normalize();
            npc.mesh.lookAt(this.camera.position);
            
            // Make NPC move toward player if close
            const distanceToPlayer = npc.mesh.position.distanceTo(this.camera.position);
            
            if (distanceToPlayer < 30) {
                // Move toward player
                const moveSpeed = 2 * deltaTime;
                const moveDir = new THREE.Vector3()
                    .subVectors(this.camera.position, npc.mesh.position)
                    .normalize()
                    .multiplyScalar(moveSpeed);
                
                // Apply movement to physics body
                npc.body.velocity.x = moveDir.x;
                npc.body.velocity.z = moveDir.z;
                
                // Try to shoot player if in range
                if (distanceToPlayer < 20) {
                    const now = Date.now();
                    if (now - npc.lastShot > npc.shootCooldown) {
                        this.npcShoot(npc);
                        npc.lastShot = now;
                    }
                }
            }
        });
    }
    
    npcShoot(npc) {
        // Create bullet
        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        // Position bullet at NPC position, raised to match gun height
        bullet.position.copy(npc.mesh.position);
        bullet.position.y += 1;
        
        // Direction toward player with some random spread
        const direction = new THREE.Vector3()
            .subVectors(this.camera.position, bullet.position)
            .normalize();
        
        // Add some randomness to the direction (spread)
        direction.x += (Math.random() - 0.5) * 0.1;
        direction.y += (Math.random() - 0.5) * 0.1;
        direction.z += (Math.random() - 0.5) * 0.1;
        direction.normalize();
        
        // Set velocity
        bullet.userData.velocity = direction.multiplyScalar(30);
        bullet.userData.lifetime = 2000; // 2 seconds
        bullet.userData.born = Date.now();
        bullet.userData.fromNPC = true;
        
        // Add to scene
        this.scene.add(bullet);
        
        // Store bullet
        if (!this.npcBullets) {
            this.npcBullets = [];
        }
        this.npcBullets.push(bullet);
    }
    
    updateNPCBullets(deltaTime) {
        if (!this.npcBullets || this.npcBullets.length === 0) {
            return;
        }
        
        const now = Date.now();
        
        for (let i = this.npcBullets.length - 1; i >= 0; i--) {
            const bullet = this.npcBullets[i];
            
            // Move bullet
            bullet.position.x += bullet.userData.velocity.x * deltaTime;
            bullet.position.y += bullet.userData.velocity.y * deltaTime;
            bullet.position.z += bullet.userData.velocity.z * deltaTime;
            
            // Check lifetime
            if (now - bullet.userData.born > bullet.userData.lifetime) {
                this.scene.remove(bullet);
                this.npcBullets.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            const distance = bullet.position.distanceTo(this.camera.position);
            if (distance < 1) {
                // Hit player
                this.playerHealth -= 10; // Damage amount
                this.updateHealth(this.playerHealth);
                
                // Check if player is dead
                if (this.playerHealth <= 0) {
                    this.gameOver();
                }
                
                // Remove bullet
                this.scene.remove(bullet);
                this.npcBullets.splice(i, 1);
            }
        }
    }
    
    updateHealth(value) {
        this.playerHealth = value;
        this.healthValue.textContent = value;
        this.healthFill.style.width = `${value}%`;
        
        // Change color based on health
        if (value > 60) {
            this.healthFill.style.backgroundColor = '#ff3333';
        } else if (value > 30) {
            this.healthFill.style.backgroundColor = '#ff9933';
        } else {
            this.healthFill.style.backgroundColor = '#ff0000';
        }
    }
    
    updateAmmo(current, total) {
        this.playerAmmo = current;
        this.playerTotalAmmo = total;
        this.ammoValue.textContent = current;
        this.totalAmmoValue.textContent = total;
    }
    
    updatePlayersLeft(count) {
        this.playersLeft = count;
        this.playersLeftValue.textContent = count;
    }
    
    victory() {
        this.isRunning = false;
        document.exitPointerLock();
        
        // Show victory message
        const victoryMessage = document.createElement('div');
        victoryMessage.style.position = 'fixed';
        victoryMessage.style.top = '50%';
        victoryMessage.style.left = '50%';
        victoryMessage.style.transform = 'translate(-50%, -50%)';
        victoryMessage.style.color = 'white';
        victoryMessage.style.fontSize = '48px';
        victoryMessage.style.fontWeight = 'bold';
        victoryMessage.style.textAlign = 'center';
        victoryMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        victoryMessage.style.padding = '40px';
        victoryMessage.style.borderRadius = '10px';
        victoryMessage.style.zIndex = '1000';
        victoryMessage.innerHTML = `
            <div>VICTORY!</div>
            <div style="font-size: 24px; margin-top: 20px;">You survived and won the battle!</div>
            <button id="play-again" style="margin-top: 30px; padding: 10px 20px; font-size: 18px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Play Again</button>
        `;
        document.body.appendChild(victoryMessage);
        
        // Add play again button listener
        document.getElementById('play-again').addEventListener('click', () => {
            document.body.removeChild(victoryMessage);
            window.location.reload();
        });
    }
    
    gameOver() {
        this.isRunning = false;
        document.exitPointerLock();
        
        // Show game over message
        const gameOverMessage = document.createElement('div');
        gameOverMessage.style.position = 'fixed';
        gameOverMessage.style.top = '50%';
        gameOverMessage.style.left = '50%';
        gameOverMessage.style.transform = 'translate(-50%, -50%)';
        gameOverMessage.style.color = 'white';
        gameOverMessage.style.fontSize = '48px';
        gameOverMessage.style.fontWeight = 'bold';
        gameOverMessage.style.textAlign = 'center';
        gameOverMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        gameOverMessage.style.padding = '40px';
        gameOverMessage.style.borderRadius = '10px';
        gameOverMessage.style.zIndex = '1000';
        gameOverMessage.innerHTML = `
            <div>GAME OVER</div>
            <div style="font-size: 24px; margin-top: 20px;">You were eliminated!</div>
            <button id="try-again" style="margin-top: 30px; padding: 10px 20px; font-size: 18px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
        `;
        document.body.appendChild(gameOverMessage);
        
        // Add try again button listener
        document.getElementById('try-again').addEventListener('click', () => {
            document.body.removeChild(gameOverMessage);
            window.location.reload();
        });
    }
    
    update() {
        const delta = this.clock.getDelta();
        
        // Update physics
        this.world.step(1/60);
        
        // Update player position from physics body
        this.camera.position.copy(this.playerBody.position);
        
        // Only update gameplay if the game is running
        if (this.isRunning) {
            // Handle shooting
            if (this.isShooting) {
                this.shoot();
            }
            
            // Update movement
            this.updatePlayerMovement(delta);
            
            // Update bullets
            this.updateBullets(delta);
            
            // Update NPC bullets
            if (this.npcBullets && this.npcBullets.length > 0) {
                this.updateNPCBullets(delta);
            }
            
            // Update NPCs
            if (this.npcs.length > 0) {
                this.updateNPCs(delta);
            }
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    updatePlayerMovement(delta) {
        // Calculate movement based on camera direction
        const moveSpeed = 50; // Base movement speed
        
        // Get camera direction
        this.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0; // Keep movement horizontal
        this.playerDirection.normalize();
        
        // Calculate movement vector
        const moveVector = new THREE.Vector3();
        
        // Forward/backward movement
        if (this.moveForward) {
            moveVector.add(this.playerDirection);
        }
        if (this.moveBackward) {
            moveVector.sub(this.playerDirection);
        }
        
        // Left/right movement
        const rightVector = new THREE.Vector3();
        rightVector.crossVectors(new THREE.Vector3(0, 1, 0), this.playerDirection).normalize();
        
        if (this.moveRight) {
            moveVector.sub(rightVector);
        }
        if (this.moveLeft) {
            moveVector.add(rightVector);
        }
        
        // Normalize movement vector if moving diagonally
        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.multiplyScalar(moveSpeed);
            
            // Apply movement to physics body
            this.playerBody.velocity.x = moveVector.x;
            this.playerBody.velocity.z = moveVector.z;
        } else {
            // Apply damping when not moving
            this.playerBody.velocity.x *= 0.8;
            this.playerBody.velocity.z *= 0.8;
            
            // Stop completely if moving very slowly
            if (Math.abs(this.playerBody.velocity.x) < 0.1) this.playerBody.velocity.x = 0;
            if (Math.abs(this.playerBody.velocity.z) < 0.1) this.playerBody.velocity.z = 0;
        }
        
        // Keep vertical velocity (for jumping)
        this.playerBody.velocity.y = this.playerBody.velocity.y;
        
        // Ground detection for jumping
        if (this.playerBody.position.y < 1.1) {
            this.canJump = true;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
    }
}

// Create and start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, creating game...");
    const game = new Game();
}); 