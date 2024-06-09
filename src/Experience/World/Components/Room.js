import * as THREE from 'three'
import Experience from '../../Experience'
import Objects from './Objects'

export default class Room {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.roomView = this.experience.roomView

        this.target = new Objects(this.roomView, this.resources.items.target1Model,'target', 'lightgreen', Math.PI * 2.4, Math.PI * 0.4, 1.5, 0.0001)
        this.chaser = new Objects(this.roomView, this.resources.items.chaser1Model,'chaser', 'lightblue', Math.PI * 2.1, Math.PI * 0, 1.5, 0.00015)

        this.setRoom()
    }

    setRoom() {
        // Walls 
        // Floor 
        let floor = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            new THREE.MeshStandardMaterial({ color: 'lightgrey' })
        )
        floor.rotation.x = - Math.PI * 0.5
        floor.position.y = -2
        // floor.castShadow = true; //default is false
        floor.receiveShadow = true;

        // Front Wall 
        let frontW = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            new THREE.MeshStandardMaterial({ color: 'lightgrey' })
        )
        frontW.position.z = -2
        // frontW.castShadow = true; //default is false
        frontW.receiveShadow = true;

        // Back Wall 
        let backW = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            new THREE.MeshStandardMaterial({ color: 'lightgrey' })
        )
        backW.rotation.y = Math.PI
        backW.position.z = 2
        // backW.castShadow = true; //default is false
        backW.receiveShadow = true;

        // Left Wall 
        let leftW = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            new THREE.MeshStandardMaterial({ color: 'lightgrey' })
        )
        leftW.rotation.x = - Math.PI * 0.5
        leftW.rotation.y = Math.PI * 0.5
        leftW.position.x = -2
        // leftW.castShadow = true; //default is false
        leftW.receiveShadow = true;

        // Right Wall 
        let rightW = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            new THREE.MeshStandardMaterial({ color: 'lightgrey' })
        )
        rightW.rotation.x = - Math.PI * 0.5
        rightW.rotation.y = - Math.PI * 0.5
        rightW.position.x = 2
        // rightW.castShadow = true; //default is false
        rightW.receiveShadow = true;

        this.roomView.add(floor, frontW, backW, leftW, rightW)
    }

    update() {
        console.log("room update")
    }
}