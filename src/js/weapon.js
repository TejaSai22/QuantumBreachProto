import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Weapon {
    constructor(scene, world, x, y, z, type) {
        this.scene = scene;
        this.world = world;
        this.position = new THREE.Vector3(x, y, z);
        this.type = type;
        
        // Weapon stats based on type
        this.stats = this.getWeaponStats();
        
        // Create the weapon
        this.createWeapon();
    }
    
    getWeaponStats() {
        // Define different weapon types
        const weaponStats = {
            pistol: {
                damage: 15,
                fireRate: 0.5, // shots per second
                magazineSize: 15,
                reloadTime: 1.5,
                range: 50
            },
            shotgun: {
                damage: 40,
                fireRate: 1.0,
                magazineSize: 6,
                reloadTime: 2.5,
                range: 20
            },
            assault_rifle: {
                damage: 25,
                fireRate: 0.1,
                magazineSize: 30,
                reloadTime: 2.0,
                range: 100
            },
            sniper: {
                damage: 80,
                fireRate: 1.5,
                magazineSize: 5,
                reloadTime: 3.0,
                range: 200
            }
        };
        
        return weaponStats[this.type] || weaponStats.pistol;
    }
    
    createWeapon() {
        // Create a simple weapon model
        let color;
        let size = { x: 0.2, y: 0.2, z: 0.8 };
        
        switch (this.type) {
            case 'pistol':
                color = 0x444444;
                size = { x: 0.15, y: 0.15, z: 0.4 };
                break;
            case 'shotgun':
                color = 0x8B4513;
                size = { x: 0.2, y: 0.2, z: 0.8 };
                break;
            case 'assault_rifle':
                color = 0x999999;
                size = { x: 0.15, y: 0.15, z: 0.9 };
                break;
            case 'sniper':
                color = 0x000000;
                size = { x: 0.15, y: 0.15, z: 1.2 };
                break;
            default:
                color = 0x444444;
        }
        
        // Main gun body
        const gunGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const gunMaterial = new THREE.MeshLambertMaterial({ color: color });
        this.mesh = new THREE.Mesh(gunGeometry, gunMaterial);
        
        // Position slightly above ground
        this.mesh.position.copy(this.position);
        this.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0); // Random rotation
        
        // Add a small handle
        const handleGeometry = new THREE.BoxGeometry(size.x, size.y * 2, size.x);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, -size.y, -size.z * 0.2);
        this.mesh.add(handle);
        
        // Add to scene
        this.scene.add(this.mesh);
        
        // Add a small physics body
        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        this.body = new CANNON.Body({
            mass: 5, // Light but not static
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            shape: shape
        });
        
        this.world.addBody(this.body);
        
        // Add pickup glow effect
        this.addGlowEffect();
    }
    
    addGlowEffect() {
        // Create a glowing outline to indicate this is a pickup
        const glowGeometry = new THREE.BoxGeometry(0.4, 0.4, 1.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glow.position.set(0, 0, 0);
        this.mesh.add(this.glow);
    }
    
    update() {
        // Update mesh position from physics
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        
        // Rotate the weapon slowly to make it more visible
        this.mesh.rotation.y += 0.01;
        
        // Make the glow effect pulse
        const pulseFactor = (Math.sin(Date.now() * 0.003) + 1) / 2; // Value between 0 and 1
        this.glow.material.opacity = 0.2 + pulseFactor * 0.3;
    }
    
    pickup() {
        // When player picks up the weapon
        this.scene.remove(this.mesh);
        this.world.removeBody(this.body);
        
        return {
            type: this.type,
            stats: this.stats
        };
    }
} 