import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import Experience from '../../Experience'
import Objects from './Objects'
import gsap from 'gsap'

export default class Room {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.data = this.experience.data
        this.roomView = this.experience.roomView
        this.roomConjunction = document.querySelector('#room-conjunction').object3D

        // Setup 
        this.modelSize = 2

        this.target = new Objects(this.roomConjunction, this.resources.items.target1Model, 'target', 'lightgreen', this.modelSize)
        this.chaser = new Objects(this.roomConjunction, this.resources.items.chaser1Model, 'chaser', 'lightblue', this.modelSize)
        this.targetPosManoeuvre = new Objects(this.roomConjunction, this.resources.items.targetPosManoeuvre1Model, 'target', '#FFBE0B', this.modelSize)

        this.setRoom()
    }

    setRoom() {
        // Walls
        let wallGeometry = new THREE.PlaneGeometry(4, 4)
        let wallMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('#000') })
        // wallMaterial.wireframe = true

        // Floor 
        let floor = new THREE.Mesh(
            wallGeometry,
            wallMaterial
        )
        floor.rotation.x = - Math.PI * 0.5
        floor.position.y = -2
        // floor.castShadow = true; //default is false
        floor.receiveShadow = true;

        // Front Wall 
        let frontW = new THREE.Mesh(
            wallGeometry,
            wallMaterial
        )
        frontW.position.z = -2
        // frontW.castShadow = true; //default is false
        frontW.receiveShadow = true;

        // Back Wall 
        let backW = new THREE.Mesh(
            wallGeometry,
            wallMaterial
        )
        backW.rotation.y = Math.PI
        backW.position.z = 2
        // backW.castShadow = true; //default is false
        backW.receiveShadow = true;

        // Left Wall 
        let leftW = new THREE.Mesh(
            wallGeometry,
            wallMaterial
        )
        leftW.rotation.x = - Math.PI * 0.5
        leftW.rotation.y = Math.PI * 0.5
        leftW.position.x = -2
        // leftW.castShadow = true; //default is false
        leftW.receiveShadow = true;

        // Right Wall 
        let rightW = new THREE.Mesh(
            wallGeometry,
            wallMaterial
        )
        rightW.rotation.x = - Math.PI * 0.5
        rightW.rotation.y = - Math.PI * 0.5
        rightW.position.x = 2
        // rightW.castShadow = true; //default is false
        rightW.receiveShadow = true;

        this.roomView.add(floor, frontW, backW, leftW, rightW)
    }

    updateVisualization(conjunction) {
        let dataToDisplay = this.data.conjunctions[conjunction]
        // console.log(dataToDisplay)
        // Information about the target and chaser space objects
        let target = dataToDisplay.target;
        let chaser = dataToDisplay.chaser;

        // State vectors for target and chaser
        let targetStateVector = dataToDisplay.details.target.state_vector;
        let chaserStateVector = dataToDisplay.details.chaser.state_vector;

        // Create position vectors for target and chaser
        let targetPosition = new THREE.Vector3(targetStateVector.x, targetStateVector.y, targetStateVector.z);
        let chaserPosition = new THREE.Vector3(chaserStateVector.x, chaserStateVector.y, chaserStateVector.z);

        // Scale the positions to fit the 1 unit radius Earth model (2 unit diameter model)
        let scaledTargetPosition = this.scaleCoordinatesToModel([targetStateVector])[0];
        let scaledChaserPosition = this.scaleCoordinatesToModel([chaserStateVector])[0];

        let a = scaledTargetPosition.x - scaledChaserPosition.x;
        let b = scaledTargetPosition.y - scaledChaserPosition.y;
        let c = scaledTargetPosition.z - scaledChaserPosition.z;

        let distance = Math.sqrt(a * a + b * b + c * c);
        // console.log(distance)

        if (this.target && this.chaser) {
            this.target.model.position.set(a/2, b/2, c/2)
            this.chaser.model.position.set(-a/2, -b/2, -c/2)
            this.target.covarianceData = dataToDisplay.details.target.covariance
            this.chaser.covarianceData = dataToDisplay.details.chaser.covariance
        }

        this.roomConjunction.scale.set(10,10,10)
    }

    scaleCoordinatesToModel(positions) {
        // Define scaling factor based on real-life dimensions
        let realLifeDiameter = 12742000;
        let modelDiameter = this.modelSize;
        let scalingFactor = modelDiameter / realLifeDiameter;

        // Scale and convert positions
        let scaledPositions = positions.map(position => {
            return {
                x: position.x * scalingFactor,
                y: position.y * scalingFactor,
                z: position.z * scalingFactor
            };
        });

        return scaledPositions;
    }

    show() {
        gsap.to(this.roomView.position, 1, { x: 0, ease: "easeInOut" })
        gsap.to(this.roomView.scale, { x: 1, y: 1, z: 1 })
    }

    hide() {
        gsap.to(this.roomView.position, 1, { x: 5, ease: "easeInOut" })
        gsap.to(this.roomView.scale, { x: 0, y: 0, z: 0 })
    }

    update() {
        // Update target and chaser objects
        if (this.target) this.target.update();
        if (this.chaser) this.chaser.update();
    }
}