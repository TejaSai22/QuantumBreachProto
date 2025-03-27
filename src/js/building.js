import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Building {
    constructor(scene, world, x, y, z, size, height) {
        this.scene = scene;
        this.world = world;
        this.position = new THREE.Vector3(x, y, z);
        this.size = size;
        this.height = height;
        
        // Create the building
        this.createBuilding();
    }
    
    createBuilding() {
        // Create a simple box building
        const geometry = new THREE.BoxGeometry(this.size, this.height, this.size);
        const material = new THREE.MeshLambertMaterial({ 
            color: Math.random() > 0.5 ? 0x888888 : 0x666666
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            this.position.x, 
            this.position.y + this.height / 2, 
            this.position.z
        );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Create physics body
        const shape = new CANNON.Box(
            new CANNON.Vec3(this.size / 2, this.height / 2, this.size / 2)
        );
        
        this.body = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y + this.height / 2,
                this.position.z
            ),
            shape: shape
        });
        
        this.world.addBody(this.body);
    }
    
    update() {
        // Nothing to update for static buildings
    }
} 