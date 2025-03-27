import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Terrain {
    constructor(scene, world) {
        // Create a simple flat ground plane
        const groundSize = 1000;
        
        // THREE.js visual representation
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x88bb44,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(groundGeometry, groundMaterial);
        this.mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.mesh.position.y = 0; // At ground level
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);
        
        // CANNON physics body
        const groundShape = new CANNON.Plane();
        this.body = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(0, 0, 0),
            shape: groundShape,
            material: new CANNON.Material({
                friction: 0.3,
                restitution: 0.3
            })
        });
        
        // Rotate to be horizontal (different coordinate system than THREE)
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        world.addBody(this.body);
        
        console.log("Terrain initialized");
    }
    
    update() {
        // Nothing to update for static terrain
    }
} 