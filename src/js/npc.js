import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class NPC {
    constructor(scene, world, x, z) {
        this.scene = scene;
        this.world = world;
        this.position = new THREE.Vector3(x, 1, z);
        this.health = 100;
        this.maxHealth = 100;
        this.isActive = true;
        this.moveSpeed = 2 + Math.random() * 2; // Random speed between 2-4
        this.isAggressive = Math.random() > 0.3; // 70% chance to be aggressive
        this.lastShootTime = 0;
        this.shootInterval = 1 + Math.random() * 2; // Shoot every 1-3 seconds when in range
        this.detectionRange = 30; // How far the NPC can see the player
        this.shootRange = 15; // Maximum shooting range
        
        // Create NPC model and physics
        this.createNPC();
        
        // Create health bar
        this.createHealthBar();
        
        // AI state
        this.aiState = 'idle'; // idle, patrolling, chasing, shooting
        this.targetPosition = new THREE.Vector3(x, 1, z); // Current movement target
        this.updatePatrolTarget(); // Set initial patrol target
        this.lastStateChange = Date.now();
    }
    
    createNPC() {
        // Create a simple colored box for the NPC
        const bodyColor = this.isAggressive ? 0xff0000 : 0x0000ff; // Red for aggressive, blue for passive
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: bodyColor });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.copy(this.position);
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.scene.add(this.body);
        
        // Head (slightly different color)
        const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: bodyColor * 0.8 });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.set(0, 1.4, 0); // Position on top of body
        this.body.add(this.head);
        
        // Simple weapon
        const weaponGeometry = new THREE.BoxGeometry(0.2, 0.2, 1);
        const weaponMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        this.weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        this.weapon.position.set(0.5, 0, 0.5); // Position at the right side
        this.body.add(this.weapon);
        
        // Physics body for collision
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
        this.physicsBody = new CANNON.Body({
            mass: 70,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            shape: shape
        });
        
        // Prevent NPC from rotating when moving
        this.physicsBody.fixedRotation = true;
        this.physicsBody.updateMassProperties();
        
        this.world.addBody(this.physicsBody);
    }
    
    createHealthBar() {
        // Create a health bar that floats above the NPC
        const healthBarWidth = 1;
        const healthBarHeight = 0.1;
        
        // Background bar (red)
        const bgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
        const bgMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            side: THREE.DoubleSide,
            depthTest: false 
        });
        this.healthBarBg = new THREE.Mesh(bgGeometry, bgMaterial);
        this.healthBarBg.position.set(0, 2.2, 0); // Position above head
        this.healthBarBg.rotation.x = Math.PI / 2; // Make it horizontal
        this.body.add(this.healthBarBg);
        
        // Foreground bar (green)
        const fgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
        const fgMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            side: THREE.DoubleSide,
            depthTest: false 
        });
        this.healthBarFg = new THREE.Mesh(fgGeometry, fgMaterial);
        this.healthBarFg.position.set(0, 0.01, 0); // Slightly in front of the background
        this.healthBarBg.add(this.healthBarFg);
        
        // Update health bar scale based on current health
        this.updateHealthBar();
    }
    
    updateHealthBar() {
        if (!this.isActive) return;
        
        const healthPercent = this.health / this.maxHealth;
        this.healthBarFg.scale.set(healthPercent, 1, 1);
        
        // Position the scaling from left to right
        this.healthBarFg.position.x = (healthPercent - 1) * 0.5;
        
        // Change color based on health
        if (healthPercent > 0.6) {
            this.healthBarFg.material.color.setHex(0x00ff00); // Green
        } else if (healthPercent > 0.3) {
            this.healthBarFg.material.color.setHex(0xffff00); // Yellow
        } else {
            this.healthBarFg.material.color.setHex(0xff0000); // Red
        }
    }
    
    takeDamage(amount) {
        if (!this.isActive) return;
        
        this.health -= amount;
        this.updateHealthBar();
        
        if (this.health <= 0) {
            this.die();
        } else {
            // If hit but not dead, always become aggressive and chase player
            this.aiState = 'chasing';
            this.isAggressive = true;
        }
    }
    
    die() {
        this.isActive = false;
        
        // Hide the NPC and health bar
        this.body.visible = false;
        this.healthBarBg.visible = false;
        
        // Put physics body far away
        this.physicsBody.position.set(0, -100, 0);
        this.physicsBody.sleep();
    }
    
    revive(x, z) {
        this.health = this.maxHealth;
        this.position.set(x, 1, z);
        this.physicsBody.position.set(x, 1, z);
        this.physicsBody.wakeUp();
        this.isActive = true;
        this.body.visible = true;
        this.healthBarBg.visible = true;
        this.updateHealthBar();
        this.aiState = 'idle';
        this.updatePatrolTarget();
    }
    
    updatePatrolTarget() {
        // Set a random patrol position within 20 units of current position
        const patrolDistance = 20;
        this.targetPosition.set(
            this.position.x + (Math.random() * 2 - 1) * patrolDistance,
            1,
            this.position.z + (Math.random() * 2 - 1) * patrolDistance
        );
    }
    
    moveTowards(target, delta) {
        // Calculate direction to target
        const direction = new THREE.Vector3();
        direction.subVectors(target, this.position);
        direction.y = 0; // Keep movement on XZ plane
        
        // Only move if not already at target
        if (direction.length() > 0.5) {
            direction.normalize();
            
            // Move towards target
            const movement = direction.multiplyScalar(this.moveSpeed * delta);
            
            // Update position
            this.position.add(movement);
            this.physicsBody.position.x = this.position.x;
            this.physicsBody.position.z = this.position.z;
            
            // Set body rotation to face movement direction
            this.body.rotation.y = Math.atan2(direction.x, direction.z);
        } else {
            // We've reached the patrol target, set a new one
            if (this.aiState === 'patrolling') {
                this.updatePatrolTarget();
            }
        }
    }
    
    shootAt(target) {
        if (!this.isActive || !this.isAggressive) return;
        
        const now = Date.now();
        if (now - this.lastShootTime < this.shootInterval * 1000) return;
        
        this.lastShootTime = now;
        
        // Create a simple bullet
        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        // Position bullet at weapon
        const bulletPos = new THREE.Vector3();
        this.weapon.getWorldPosition(bulletPos);
        bullet.position.copy(bulletPos);
        
        // Calculate direction to target
        const bulletDir = new THREE.Vector3();
        bulletDir.subVectors(target, bulletPos).normalize();
        
        // Add some randomness to shots (accuracy based on distance)
        const distanceToTarget = this.position.distanceTo(target);
        const accuracy = Math.max(0.5, 1 - distanceToTarget / this.shootRange);
        bulletDir.x += (Math.random() - 0.5) * (1 - accuracy);
        bulletDir.y += (Math.random() - 0.5) * (1 - accuracy);
        bulletDir.z += (Math.random() - 0.5) * (1 - accuracy);
        bulletDir.normalize();
        
        this.scene.add(bullet);
        
        // Animate bullet
        const bulletSpeed = 30;
        const bulletLifetime = 1000; // ms
        const bulletDamage = 5 + Math.random() * 5; // Random damage between 5-10
        const bulletStartTime = Date.now();
        
        // Store reference to player for collision check
        const player = this.player;
        
        function animateBullet() {
            const now = Date.now();
            const delta = (now - bulletStartTime) / 1000; // seconds
            
            // Move bullet
            bullet.position.x += bulletDir.x * bulletSpeed * delta;
            bullet.position.y += bulletDir.y * bulletSpeed * delta;
            bullet.position.z += bulletDir.z * bulletSpeed * delta;
            
            // Check for collision with player
            if (player && player.isActive) {
                const distToPlayer = bullet.position.distanceTo(player.position);
                if (distToPlayer < 1) {
                    player.takeDamage(bulletDamage);
                    this.scene.remove(bullet);
                    return;
                }
            }
            
            // Remove bullet after lifetime
            if (now - bulletStartTime > bulletLifetime) {
                this.scene.remove(bullet);
            } else {
                requestAnimationFrame(animateBullet.bind(this));
            }
        }
        
        animateBullet.bind(this)();
    }
    
    setPlayer(player) {
        this.player = player;
    }
    
    update(delta) {
        if (!this.isActive || !this.player) return;
        
        // Update position from physics
        this.position.copy(this.physicsBody.position);
        this.body.position.copy(this.position);
        
        // Get distance to player
        const distanceToPlayer = this.position.distanceTo(this.player.position);
        
        // AI state transitions
        const now = Date.now();
        const timeSinceLastStateChange = now - this.lastStateChange;
        
        switch (this.aiState) {
            case 'idle':
                // Transition: idle -> patrolling after 2-5 seconds
                if (timeSinceLastStateChange > 2000 + Math.random() * 3000) {
                    this.aiState = 'patrolling';
                    this.updatePatrolTarget();
                    this.lastStateChange = now;
                }
                
                // Transition: idle -> chasing if player is in detection range and NPC is aggressive
                if (this.isAggressive && distanceToPlayer < this.detectionRange) {
                    this.aiState = 'chasing';
                    this.lastStateChange = now;
                }
                break;
                
            case 'patrolling':
                // Move towards patrol target
                this.moveTowards(this.targetPosition, delta);
                
                // Transition: patrolling -> idle occasionally
                if (timeSinceLastStateChange > 10000 + Math.random() * 5000) {
                    this.aiState = 'idle';
                    this.lastStateChange = now;
                }
                
                // Transition: patrolling -> chasing if player is in detection range and NPC is aggressive
                if (this.isAggressive && distanceToPlayer < this.detectionRange) {
                    this.aiState = 'chasing';
                    this.lastStateChange = now;
                }
                break;
                
            case 'chasing':
                // Move towards player
                this.moveTowards(this.player.position, delta);
                
                // Transition: chasing -> shooting if player is in shooting range
                if (distanceToPlayer < this.shootRange) {
                    this.aiState = 'shooting';
                    this.lastStateChange = now;
                }
                
                // Transition: chasing -> patrolling if player is too far away
                if (distanceToPlayer > this.detectionRange * 1.5) {
                    this.aiState = 'patrolling';
                    this.updatePatrolTarget();
                    this.lastStateChange = now;
                }
                break;
                
            case 'shooting':
                // Face the player
                const direction = new THREE.Vector3();
                direction.subVectors(this.player.position, this.position);
                direction.y = 0;
                this.body.rotation.y = Math.atan2(direction.x, direction.z);
                
                // Shoot at player
                this.shootAt(this.player.position);
                
                // Transition: shooting -> chasing if player is too far to shoot
                if (distanceToPlayer > this.shootRange) {
                    this.aiState = 'chasing';
                    this.lastStateChange = now;
                }
                break;
        }
        
        // Always make health bar face the camera
        this.healthBarBg.lookAt(this.player.camera.position);
    }
} 