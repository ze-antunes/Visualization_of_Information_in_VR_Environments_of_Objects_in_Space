import * as THREE from 'three'
import Experience from "../Experience";
import Globe from './Components/Globe';
import Room from './Components/Room';
import Panel from './Components/UI/Panel';
import Environment from './Environment';

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.aframeScene = this.experience.aframeScene
        this.resources = this.experience.resources
        this.data = this.experience.data
        this.globeView = this.experience.globeView
        this.roomView = this.experience.roomView
        this.rightHand = this.experience.rightHand
        this.leftHand = this.experience.leftHand
        
        // Wait for resources
        // when the resources are ready we can instanciate the environment
        this.resources.on('ready', () => {
            document.getElementById("loader").style.display = "none"

            //Setup
            this.globe = new Globe()
            this.room = new Room()
            this.setConjunctionsMenu()
            this.setManoeuvresMenu()
            this.environment = new Environment()
        })

    }

    setConjunctionsMenu() {
        // console.log(this.data.conjunctions.length)
        this.conjunctionsMenu = new Panel("Conjunctions", "conjunctionCard", this.data.conjunctions.length)
        this.conjunctionsMenu.mesh.position.set(-1.4, 1.6, -1.2);
        this.conjunctionsMenu.mesh.rotation.y = 0.25;
        // this.conjunctionsMenu.mesh.scale.set(0.1, 0.1, 0.1)
        this.conjunctionsMenu.mesh.scale.set(0.5, 0.5, 0.5)
        this.conjunctionsMenu.setHeader()
        this.conjunctionsMenu.setGrid(4)
        this.conjunctionsMenu.setViews()
    }

    setManoeuvresMenu() {
        // console.log(this.data.conjunctions[0].manoeuvres)
        this.manoeuvresMenu = new Panel("Manoeuvres", "manoeuvreCard", this.data.conjunctions[0].manoeuvres.length)
        // this.manoeuvresMenu.mesh.position.set(0, 1.6, -1);
        this.manoeuvresMenu.mesh.position.set(1.4, 1.6, -1.2);
        this.manoeuvresMenu.mesh.rotation.y = -0.25;
        // this.manoeuvresMenu.mesh.scale.set(0.1, 0.1, 0.1)
        this.manoeuvresMenu.mesh.scale.set(0.5, 0.5, 0.5)
        this.manoeuvresMenu.setHeader()
        this.manoeuvresMenu.setGrid(7)
    }

    update() {
        if (this.globe)
            this.globe.update()
        // if (this.leftHand && this.conjunctionsMenu) {
        //     this.conjunctionsMenu.mesh.position.set(this.leftHand.object3D.position.x + 0.1, this.leftHand.object3D.position.y, this.leftHand.object3D.position.z - 0.2)
        //     // console.log(this.rightHand.object3D.rotation)
        //     // this.conjunctionsMenu.mesh.rotation.set(this.leftHand.object3D.rotation.x - 55, this.leftHand.object3D.rotation.y + 180, 0)
        //     this.conjunctionsMenu.mesh.lookAt(this.camera.object3D.position.x, this.camera.object3D.position.y, this.camera.object3D.position.z)
        // }
        // if (this.rightHand && this.manoeuvresMenu) {
        //     this.manoeuvresMenu.mesh.position.set(this.rightHand.object3D.position.x - 0.1, this.rightHand.object3D.position.y, this.rightHand.object3D.position.z - 0.2)
        //     // console.log(this.leftHand.object3D.rotation)
        //     // this.manoeuvresMenu.mesh.rotation.set(this.rightHand.object3D.rotation.x - 55, this.rightHand.object3D.rotation.y + 180, 0)
        //     this.manoeuvresMenu.mesh.lookAt(this.camera.object3D.position.x, this.camera.object3D.position.y, this.camera.object3D.position.z)
        // }
    }
}