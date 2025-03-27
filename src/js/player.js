import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
    constructor(scene, world, camera) {
        this.scene = scene;
        this.world = world;
        this.camera = camera;
        
        // Player state
        this.health = 100;
        this.materials = {
            wood: 50,
            brick: 20,
            metal: 10
        };
        this.currentWeapon = {
            type: 'assault_rifle',
            stats: {
                damage: 25,
                fireRate: 0.1,
                magazineSize: 30,
                reloadTime: 2,
                range: 100
            }
        };
        this.isActive = true; // Start active by default
        this.isJumping = false;
        this.canBuild = true;
        this.buildCooldown = 0.5; // seconds
        this.buildTimer = 0;
        
        // Movement
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.rotateLeft = false;
        this.rotateRight = false;
        this.rotateCameraUp = false;
        this.rotateCameraDown = false;
        this.jump = false;
        
        // Position and velocity
        this.position = new THREE.Vector3(0, 5, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        
        // Player physics body
        this.createPhysicsBody();
        
        // Player model
        this.createPlayerModel();
        
        // Setup controls
        this.setupControls();
        
        // Wake up physics body
        this.body.wakeUp();
        
        console.log("Player initialized and activated!");
    }
    
    createPhysicsBody() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
        this.body = new CANNON.Body({
            mass: 70, // kg
            position: new CANNON.Vec3(0, 5, 0), // Start a bit above ground
            shape: shape,
            material: new CANNON.Material({
                friction: 0.1,
                restitution: 0.2
            })
        });
        
        // Add contact material to handle player-ground friction
        const playerGroundContact = new CANNON.ContactMaterial(
            this.body.material,
            new CANNON.Material(),
            {
                friction: 0.1,
                restitution: 0.2
            }
        );
        this.world.addContactMaterial(playerGroundContact);
        
        // Prevent player from rotation
        this.body.fixedRotation = true;
        this.body.updateMassProperties();
        
        // Add body to the world
        this.world.addBody(this.body);
    }
    
    createPlayerModel() {
        // For simplicity, we'll use a simple box mesh for our player
        // In a real game, you'd load a detailed 3D model with animations
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Position the camera at the player's eye level
        this.camera.position.set(0, 1.7, 0);
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = true;
                    console.log("W key pressed - moveForward:", this.moveForward);
                    break;
                case 'KeyS':
                    this.moveBackward = true;
                    console.log("S key pressed - moveBackward:", this.moveBackward);
                    break;
                case 'KeyA':
                    this.moveLeft = true;
                    console.log("A key pressed - moveLeft:", this.moveLeft);
                    break;
                case 'KeyD':
                    this.moveRight = true;
                    console.log("D key pressed - moveRight:", this.moveRight);
                    break;
                case 'ArrowLeft':
                    this.rotateLeft = true;
                    break;
                case 'ArrowRight':
                    this.rotateRight = true;
                    break;
                case 'ArrowUp':
                    this.rotateCameraUp = true;
                    break;
                case 'ArrowDown':
                    this.rotateCameraDown = true;
                    break;
                case 'Space':
                    if (!this.isJumping) {
                        this.jump = true;
                    }
                    break;
                case 'KeyF':
                    this.build();
                    break;
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                    // Weapon selection would go here
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = false;
                    console.log("W key released - moveForward:", this.moveForward);
                    break;
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                    this.moveRight = false;
                    break;
                case 'ArrowLeft':
                    this.rotateLeft = false;
                    break;
                case 'ArrowRight':
                    this.rotateRight = false;
                    break;
                case 'ArrowUp':
                    this.rotateCameraUp = false;
                    break;
                case 'ArrowDown':
                    this.rotateCameraDown = false;
                    break;
            }
        });
        
        // Mouse controls for looking around
        document.addEventListener('mousemove', (event) => {
            // Only use mouse look if pointer is locked
            if (document.pointerLockElement !== document.getElementById('game-canvas')) return;
            
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;
            
            // Rotate the camera based on mouse movement
            this.camera.rotation.y -= movementX * 0.002;
            
            // Limit vertical rotation to avoid flipping
            const verticalRotation = this.camera.rotation.x - movementY * 0.002;
            this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, verticalRotation));
        });
        
        // Mouse click for shooting
        document.addEventListener('click', () => {
            this.shoot();
        });
    }
    
    activate() {
        this.isActive = true;
        this.body.wakeUp();
        console.log("Player activated!");
    }
    
    reset() {
        this.health = 100;
        this.materials = {
            wood: 50,
            brick: 20,
            metal: 10
        };
        this.isActive = true;
        this.isJumping = false;
        
        // Reset position
        this.position.set(0, 5, 0);
        this.velocity.set(0, 0, 0);
        this.body.position.set(0, 5, 0);
        this.body.velocity.set(0, 0, 0);
        this.body.wakeUp();
        
        // Reset camera
        this.camera.position.set(0, 1.7, 0);
        this.camera.rotation.set(0, 0, 0);
    }
    
    build() {
        console.log("Build method called");
        console.log("Can build:", this.canBuild);
        console.log("Materials:", this.materials);
        
        if (!this.canBuild) {
            console.log("Cannot build - on cooldown");
            return;
        }
        
        // Check if we have materials
        if (this.materials.wood < 10 && this.materials.brick < 10 && this.materials.metal < 10) {
            console.log("Not enough materials to build!");
            return;
        }
        
        // Determine which material to use (priority: wood > brick > metal)
        let materialType = 'wood';
        if (this.materials.wood < 10) {
            materialType = this.materials.brick >= 10 ? 'brick' : 'metal';
        }
        
        // Get build position (in front of player)
        const buildPos = new THREE.Vector3();
        const buildDir = new THREE.Vector3();
        
        // Get current position and direction
        this.camera.getWorldPosition(buildPos);
        this.camera.getWorldDirection(buildDir);
        
        console.log("Current position:", buildPos);
        console.log("Build direction:", buildDir);
        
        // Move position 3 units in front of player
        buildPos.add(buildDir.multiplyScalar(3));
        
        // Round positions to grid
        buildPos.x = Math.round(buildPos.x);
        buildPos.y = Math.round(buildPos.y);
        buildPos.z = Math.round(buildPos.z);
        
        console.log("Building wall at position:", buildPos);
        console.log("Using material:", materialType);
        
        // Create a wall
        this.createWall(buildPos, materialType);
        
        // Use materials
        this.materials[materialType] -= 10;
        
        // Start cooldown
        this.canBuild = false;
        this.buildTimer = this.buildCooldown;
    }
    
    createWall(position, materialType) {
        console.log("Creating wall at:", position, "with material:", materialType);
        
        // In a real game, this would be more complex with proper wall placement logic
        // For MVP, we'll just create a simple cube at the position
        
        // First, determine the rotation based on player's view direction
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        
        // Calculate rotation to face the wall perpendicular to the camera direction
        const rotation = new THREE.Euler(0, Math.atan2(cameraDirection.x, cameraDirection.z), 0);
        
        console.log("Wall rotation:", rotation);
        
        // Create wall geometry
        const geometry = new THREE.BoxGeometry(3, 3, 0.2);
        
        // Different materials based on type
        let material;
        switch (materialType) {
            case 'brick':
                material = new THREE.MeshLambertMaterial({ color: 0xaa5555 });
                break;
            case 'metal':
                material = new THREE.MeshLambertMaterial({ color: 0x888888 });
                break;
            case 'wood':
            default:
                material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                break;
        }
        
        // Create mesh
        const wall = new THREE.Mesh(geometry, material);
        wall.position.copy(position);
        wall.rotation.copy(rotation);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
        
        console.log("Wall added to scene at:", wall.position);
        
        // Create physics body for the wall
        const wallShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 0.1));
        const wallBody = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(position.x, position.y, position.z),
            shape: wallShape
        });
        
        // Apply the same rotation to physics body
        wallBody.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
        
        this.world.addBody(wallBody);
        
        console.log("Wall physics body added");
    }
    
    update(delta) {
        console.log("Player update called with delta:", delta);
        console.log("Movement state:", { 
            forward: this.moveForward, 
            backward: this.moveBackward, 
            left: this.moveLeft, 
            right: this.moveRight 
        });
        
        // Handle build cooldown
        if (!this.canBuild) {
            this.buildTimer -= delta;
            if (this.buildTimer <= 0) {
                this.canBuild = true;
            }
        }
        
        // Apply keyboard-based camera rotation
        const rotationSpeed = 2.0;
        if (this.rotateLeft) {
            this.camera.rotation.y += rotationSpeed * delta;
        }
        if (this.rotateRight) {
            this.camera.rotation.y -= rotationSpeed * delta;
        }
        if (this.rotateCameraUp) {
            this.camera.rotation.x = Math.max(-Math.PI / 2, this.camera.rotation.x - rotationSpeed * delta);
        }
        if (this.rotateCameraDown) {
            this.camera.rotation.x = Math.min(Math.PI / 2, this.camera.rotation.x + rotationSpeed * delta);
        }
        
        // Get camera direction for movement
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Keep movement on XZ plane
        cameraDirection.normalize();
        
        // Calculate movement direction
        const moveDirection = new THREE.Vector3(0, 0, 0);
        
        if (this.moveForward) {
            moveDirection.add(cameraDirection);
        }
        if (this.moveBackward) {
            moveDirection.sub(cameraDirection);
        }
        
        // Calculate strafe direction (perpendicular to camera direction)
        const strafeDirection = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x);
        
        if (this.moveRight) {
            moveDirection.add(strafeDirection);
        }
        if (this.moveLeft) {
            moveDirection.sub(strafeDirection);
        }
        
        // Normalize for consistent speed in all directions
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
        }
        
        // Apply movement with direct position updates (bypassing physics for testing)
        const speed = 10; // units per second
        const movement = moveDirection.multiplyScalar(speed * delta);
        
        // Update our position directly first
        this.position.x += movement.x;
        this.position.z += movement.z;
        
        // Then apply to physics body
        this.body.position.x = this.position.x;
        this.body.position.z = this.position.z;
        
        // Also set velocity for physics interactions
        this.body.velocity.x = movement.x / delta;
        this.body.velocity.z = movement.z / delta;
        
        // Apply gravity
        this.velocity.y -= 9.82 * delta;
        this.position.y += this.velocity.y * delta;
        
        // Floor collision (simple)
        if (this.position.y < 1.0) {
            this.position.y = 1.0;
            this.velocity.y = 0;
            this.isJumping = false;
        }
        
        // Jumping
        if (this.jump && !this.isJumping) {
            this.velocity.y = 7; // Jump velocity
            this.isJumping = true;
            this.jump = false;
        }
        
        // Update physics body Y position
        this.body.position.y = this.position.y;
        
        // Update player mesh position
        this.mesh.position.copy(this.position);
        
        // Update camera position
        this.camera.position.x = this.position.x;
        this.camera.position.y = this.position.y + 1.7; // Eye height
        this.camera.position.z = this.position.z;
        
        console.log("Updated position:", this.position);
    }
}