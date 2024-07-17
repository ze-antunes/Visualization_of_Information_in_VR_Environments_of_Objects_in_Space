import * as THREE from 'three'
import Experience from '../../Experience'
import Objects from './Objects'
import gsap from 'gsap'

import earthVertexShader from '../../Shaders/earth/vertex.glsl'
import earthFragmentShader from '../../Shaders/earth/fragment.glsl'
import atmosphereVertexShader from '../../Shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from '../../Shaders/atmosphere/fragment.glsl'

export default class Globe {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.data = this.experience.data
        this.debug = this.experience.debug
        this.globeView = this.experience.globeView
        this.globeTarget = document.querySelector('#globe-target')
        this.globeTargetPosManoeuvre = document.querySelector('#globe-target-posmanoeuvre')
        this.globeChaser = document.querySelector('#globe-chaser')

        // console.log(this.data)

        // document.querySelector('#globe-target').addEventListener("click", () => { console.log("ola") })
        // document.querySelector('#globe-target').addEventListener("mouseleave", () => { console.log("adeus") })

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Globe')
            this.debugFolder
                .add(this.globeView.rotation, 'y')
                .min(0)
                .max(Math.PI * 2)
                .name("globe entity rotation y")
        }

        // Setup 
        this.modelSize = 2

        this.target = new Objects(this.globeTarget.object3D, this.globeTarget, this.resources.items.targetModel, 'target', 'lightgreen', this.modelSize)
        this.chaser = new Objects(this.globeChaser.object3D, this.globeChaser, this.resources.items.chaserModel, 'chaser', 'lightblue', this.modelSize)
        this.targetPosManoeuvre = new Objects(this.globeTargetPosManoeuvre.object3D, this.globeTargetPosManoeuvre, this.resources.items.targetPosManoeuvreModel, 'target-posmanoeuvre', '#FFBE0B', this.modelSize)

        this.setGeometries()
        this.setTextures()
        this.setMaterials()
        this.setMesh()
        this.setSun()
    }

    setGeometries() {
        this.earthGeometry = new THREE.SphereGeometry(1, 32, 32)
    }

    setTextures() {
        this.textures = {}

        this.textures.earthDayTexture = this.resources.items.earthDayTexture
        this.textures.earthDayTexture.colorSpace = THREE.SRGBColorSpace
        this.textures.earthDayTexture.anisotropy = 8

        this.textures.earthNightTexture = this.resources.items.earthNightTexture
        this.textures.earthNightTexture.colorSpace = THREE.SRGBColorSpace
        this.textures.earthNightTexture.anisotropy = 8

        this.textures.earthSpecularCloudsTexture = this.resources.items.earthSpecularCloudsTexture
        this.textures.earthSpecularCloudsTexture.colorSpace = THREE.SRGBColorSpace
        this.textures.earthSpecularCloudsTexture.anisotropy = 8
    }

    setMaterials() {
        this.earthParameters = {}
        this.earthParameters.atmosphereDayColor = '#7ed1fb'
        this.earthParameters.atmosphereTwilightColor = '#ffbc8f'

        this.earthMaterial = new THREE.ShaderMaterial({
            vertexShader: earthVertexShader,
            fragmentShader: earthFragmentShader,
            uniforms:
            {
                uDayTexture: new THREE.Uniform(this.textures.earthDayTexture),
                uNightTexture: new THREE.Uniform(this.textures.earthNightTexture),
                uSpecularCloudsTexture: new THREE.Uniform(this.textures.earthSpecularCloudsTexture),
                uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(this.earthParameters.atmosphereDayColor)),
                uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(this.earthParameters.atmosphereTwilightColor)),
            }
        })

        this.atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            uniforms:
            {
                uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(this.earthParameters.atmosphereDayColor)),
                uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(this.earthParameters.atmosphereTwilightColor)),
            },
            side: THREE.BackSide,
            transparent: true
        });

        // Debug
        if (this.debug.active) {
            this.debugFolder
                .addColor(this.earthParameters, 'atmosphereDayColor')
                .onChange(() => {
                    this.earthMaterial.uniforms.uAtmosphereDayColor.value.set(this.earthParameters.atmosphereDayColor)
                    this.atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(this.earthParameters.atmosphereDayColor)
                })

            this.debugFolder
                .addColor(this.earthParameters, 'atmosphereTwilightColor')
                .onChange(() => {
                    this.earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(this.earthParameters.atmosphereTwilightColor)
                    this.atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(this.earthParameters.atmosphereTwilightColor)
                })
        }
    }

    setMesh() {
        this.earth = new THREE.Mesh(this.earthGeometry, this.earthMaterial)
        // this.earth.position.set(0, 1.6, -3)
        this.atmosphere = new THREE.Mesh(this.earthGeometry, this.atmosphereMaterial);
        // this.atmosphere.position.set(0, 1.6, -3)
        this.atmosphere.scale.set(1.06, 1.06, 1.06);
        this.globeView.add(this.atmosphere, this.earth)
    }

    setSun() {
        // Sun 
        this.sun = {}
        this.sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, -1.4)
        this.sunDirection = new THREE.Vector3()

        // Debug 
        this.debugSun = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.1, 2),
            new THREE.MeshBasicMaterial()
        )

        this.debugSun.material.visible = false

        this.globeView.add(this.debugSun)

        this.sun.updateSun = () => {
            // Sun direction 
            this.sunDirection.setFromSpherical(this.sunSpherical);

            // Debug 
            this.debugSun.position.copy(this.sunDirection).multiplyScalar(5)

            // Uniforms 
            this.earthMaterial.uniforms.uSunDirection.value.copy(this.sunDirection)
            this.atmosphereMaterial.uniforms.uSunDirection.value.copy(this.sunDirection)
        }

        this.sun.updateSun()

        // Debug
        if (this.debug.active) {
            this.debugFolder
                .add(this.sunSpherical, 'phi')
                .min(0)
                .max(Math.PI)
                .onChange(this.sun.updateSun())
            this.debugFolder
                .add(this.sunSpherical, 'theta')
                .min(- Math.PI)
                .max(Math.PI)
                .onChange(this.sun.updateSun())
            this.debugFolder
                .add(this.debugSun.material, 'visible')
        }
    }

    update() {
        this.sun.updateSun()

        let secondsInADay = 86400; // Number of seconds in a day
        let rotationAnglePerSecond = (2 * Math.PI) / secondsInADay; // Full rotation (2π radians) per day

        let now = Date.now(); // Current time in milliseconds since Unix epoch
        let referenceTime = new Date('2024-01-01T00:00:00Z').getTime(); // Reference time in milliseconds

        let elapsedTime = (now - referenceTime) / 1000; // Elapsed time in seconds

        this.earth.rotation.y = elapsedTime * rotationAnglePerSecond;

        // Update target and chaser objects
        if (this.target) this.target.update();
        if (this.chaser) this.chaser.update();
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

        // Globe Entity rotation
        // TODO: Update sunSpherical after the globe rotation
        let rotationAngle = this.calculateRotationAngle(targetStateVector.x, targetStateVector.z)

        gsap.to(this.globeView.rotation, 1, { y: THREE.MathUtils.degToRad(rotationAngle), ease: "easeInOut" })

        let newSunSpherical = new THREE.Spherical(1, Math.PI * 0.5, -1.4 + THREE.MathUtils.degToRad(rotationAngle));
        this.sunSpherical.copy(newSunSpherical);
        this.sun.updateSun();

        let a = targetStateVector.x - chaserStateVector.x;
        let b = targetStateVector.y - chaserStateVector.y;
        let c = targetStateVector.z - chaserStateVector.z;

        let distance = Math.sqrt(a * a + b * b + c * c);

        let massScale = this.scaleMass(target.mass.current)
        // console.log(this.target.covariance.ellipsoid.scale.y * 0.2)

        // Scale the positions to fit the 1 unit radius Earth model (2 unit diameter model)
        let scaledTargetPosition = this.scaleCoordinatesToModel([targetStateVector])[0];
        let scaledChaserPosition = this.scaleCoordinatesToModel([chaserStateVector])[0];

        if (this.target && this.chaser) {
            gsap.to(this.target.view.position, 1, { x: scaledTargetPosition.x, y: scaledTargetPosition.y, z: scaledTargetPosition.z, ease: "easeInOut" })
            gsap.to(this.chaser.view.position, 1, { x: scaledChaserPosition.x, y: scaledChaserPosition.y, z: scaledChaserPosition.z, ease: "easeInOut" })
            // console.log(this.target.popup.mesh.position)
            gsap.to(this.target.popup.mesh.position, 1, { x: scaledTargetPosition.x, y: scaledTargetPosition.y, z: scaledTargetPosition.z, ease: "easeInOut" })
            gsap.to(this.chaser.popup.mesh.position, 1, { x: scaledChaserPosition.x, y: scaledChaserPosition.y, z: scaledChaserPosition.z, ease: "easeInOut" })
            gsap.to(this.target.model.scale, 1, { x: 0.2 , y: 0.2 , z: 0.2 , ease: "easeInOut" })
            gsap.to(this.chaser.model.scale, 1, { x: 0.2 , y: 0.2 , z: 0.2 , ease: "easeInOut" })
            // gsap.to(this.target.covariance.ellipsoid.scale, 1, { x: this.target.covariance.ellipsoid.scale.x * 0.005 , y: this.target.covariance.ellipsoid.scale.y * 0.005 , z: this.target.covariance.ellipsoid.scale.z * 0.005 , ease: "easeInOut" })
            // gsap.to(this.chaser.covariance.ellipsoid.scale, 1, { x: this.chaser.covariance.ellipsoid.scale.x * 0.005, y: this.chaser.covariance.ellipsoid.scale.y * 0.005, z: this.chaser.covariance.ellipsoid.scale.z * 0.005 , ease: "easeInOut" })
            this.target.covarianceData = dataToDisplay.details.target.covariance
            this.chaser.covarianceData = dataToDisplay.details.chaser.covariance
        }
    }

    updateManoeuvre(conjunction) {
        let dataToDisplay = this.data.conjunctions[conjunction]

        let targetPosManoeuvreStateVector = dataToDisplay.manoeuvres[0].state_vector;
        // console.log(targetPosManoeuvreStateVector)

        let scaledTargetPosManoeuvrePosition = this.scaleCoordinatesToModel([targetPosManoeuvreStateVector])[0];

        if (this.targetPosManoeuvre) {
            gsap.to(this.targetPosManoeuvre.view.position, 1, { x: scaledTargetPosManoeuvrePosition.x, y: scaledTargetPosManoeuvrePosition.y, z: scaledTargetPosManoeuvrePosition.z, ease: "easeInOut" })
        }
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

    scaleMass(originalMass) {
        let volumeEarth = (4 / 3) * Math.PI * Math.pow(6371000, 3);
        let volumeModel = Math.pow(this.modelSize, 3);
        let volumeScalingFactor = volumeModel / volumeEarth;
        let scaledMass = originalMass * volumeScalingFactor;
        return scaledMass;
    }

    calculateRotationAngle(x, y) {
        // Calculate the angle in radians
        let angleRad = Math.atan2(x, y);

        // Convert the angle to degrees
        let angleDeg = - angleRad * (180 / Math.PI);

        // Adjust the angle to make sure it is in the range [0, 360]
        if (angleDeg < 0) {
            angleDeg += 360;
        }

        return angleDeg;
    }

    show() {
        gsap.to(this.globeView.position, 1, { x: 0, ease: "easeInOut" })
        gsap.to(this.globeView.scale, { x: 0.7, y: 0.7, z: 0.7 })
    }

    hide() {
        gsap.to(this.globeView.position, 1, { x: -5, ease: "easeInOut" })
        gsap.to(this.globeView.scale, { x: 0, y: 0, z: 0 })
    }

    destroy() {
        console.log("destroy")
        this.globeView.remove(this.earth)
        this.earth.geometry.dispose()
        this.earth.material.dispose()
        this.earth = null
    }
}