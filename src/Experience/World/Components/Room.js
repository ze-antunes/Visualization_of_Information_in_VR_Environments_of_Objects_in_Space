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
        this.roomConjunction = document.querySelector('#room-conjunction')
        this.roomTarget = document.querySelector('#room-target')
        this.roomTargetPosManoeuvre = document.querySelector('#room-target-posmanoeuvre')
        this.roomChaser = document.querySelector('#room-chaser')

        // Setup 
        this.modelSize = 2

        this.target = new Objects(this.roomTarget.object3D, this.roomTarget, this.resources.items.target1Model, 'target', 'lightgreen', this.modelSize)
        this.chaser = new Objects(this.roomChaser.object3D, this.roomChaser, this.resources.items.chaser1Model, 'chaser', 'lightblue', this.modelSize)
        this.targetPosManoeuvre = new Objects(this.roomTargetPosManoeuvre.object3D, this.roomTargetPosManoeuvre, this.resources.items.targetPosManoeuvre1Model, 'target', '#FFBE0B', this.modelSize)

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

        // Define the initial points
        this.points = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(-1, 0, 0)
        ];

        // Create the geometry and set the vertices
        this.lineGeometry = new THREE.BufferGeometry().setFromPoints(this.points);

        // Create the line material
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

        // Create the line
        this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);
        this.roomView.add(this.line)
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

        let a = targetStateVector.x - chaserStateVector.x;
        let b = targetStateVector.y - chaserStateVector.y;
        let c = targetStateVector.z - chaserStateVector.z;
        let distance = Math.sqrt(a * a + b * b + c * c);

        // Half a distance to center the conjunction to the middle of the room
        let x = (targetPosition.x - chaserPosition.x) / 2
        let y = (targetPosition.y - chaserPosition.y) / 2
        let z = (targetPosition.z - chaserPosition.z) / 2
        // console.log(distance)

        let halfDistances = [x, y, z]
        let mappedDistances = this.mapToRoom(halfDistances);
        // console.log(mappedDistances)

        // Animate line points using GSAP
        gsap.to(this.points[0], {
            x: mappedDistances[0],
            y: mappedDistances[1],
            z: mappedDistances[2],
            duration: 1,
            ease: "easeInOut",
            onUpdate: this.updateLine.bind(this)
        });

        gsap.to(this.points[1], {
            x: -mappedDistances[0],
            y: -mappedDistances[1],
            z: -mappedDistances[2],
            duration: 1,
            ease: "easeInOut",
            onUpdate: this.updateLine.bind(this)
        });

        if (this.target && this.chaser) {
            gsap.to(this.target.view.position, 1, { x: mappedDistances[0], y: mappedDistances[1], z: mappedDistances[2], ease: "easeInOut" })
            gsap.to(this.chaser.view.position, 1, { x: -mappedDistances[0], y: -mappedDistances[1], z: -mappedDistances[2], ease: "easeInOut" })
            // console.log(this.target.view.position, this.chaser.view.position)
            // gsap.to(this.target.model.scale, 1, { x: mappedDistances[0], y: mappedDistances[1], z: mappedDistances[2], ease: "easeInOut" })
            // gsap.to(this.chaser.model.scale, 1, { x: -mappedDistances[0], y: -mappedDistances[1], z: -mappedDistances[2], ease: "easeInOut" })
            this.target.covarianceData = dataToDisplay.details.target.covariance
            this.chaser.covarianceData = dataToDisplay.details.chaser.covariance
        }

        this.updateManoeuvre(conjunction, 0)
    }

    updateManoeuvre(conjunction, manoeuvre) {
        let dataToDisplay = this.data.conjunctions[conjunction]
        // console.log(dataToDisplay.manoeuvres[manoeuvre].collision_avoidance.state_vector_tca)

        let targetPosManoeuvreStateVector = dataToDisplay.manoeuvres[manoeuvre].collision_avoidance.state_vector_tca;

        // Half a distance to center the conjunction to the middle of the room
        let x = targetPosManoeuvreStateVector.x
        let y = targetPosManoeuvreStateVector.y
        let z = targetPosManoeuvreStateVector.z
        // console.log(distance)

        let halfDistances = [x, y, z]
        let mappedDistances = this.mapToRoom(halfDistances);
        // console.log(mappedDistances)

        let targetPosManoeuvrePosition = new THREE.Vector3(targetPosManoeuvreStateVector.x, targetPosManoeuvreStateVector.y, targetPosManoeuvreStateVector.z);
        console.log(mappedDistances[0], mappedDistances[1], mappedDistances[2])

        if (this.targetPosManoeuvre) {
            gsap.to(this.targetPosManoeuvre.view.position, 1, { x: mappedDistances[0], y: mappedDistances[1], z: mappedDistances[2], ease: "easeInOut" })
        }
    }

    // Update the line geometry
    updateLine() {
        this.lineGeometry.setFromPoints(this.points);
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

    mapRange(x, a1, a2, b1, b2) {
        return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
    }

    mapToRoom(distances) {
        const originalMin = Math.min(...distances);
        const originalMax = Math.max(...distances);

        return distances.map(distance => (this.mapRange(distance, originalMin, originalMax, 0, 1)));
    }
}