import * as THREE from 'three'
import Experience from '../../Experience'
import Covariance from './Covariance'
import Trajectory from './Trajectory'
import ObjectPopup from './UI/ObjectPopup'

export default class Objects {
    constructor(view, resource, type, color, modelSize) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Setup 
        this.resource = resource
        this.type = type
        this.color = color
        this.view = view
        this.modelSize = modelSize
        this.objsToTest = this.experience.raycaster.objsToTest

        this.isPopupOpen = false
        if (this.type === "target") {
            this.covarianceData = this.experience.data.conjunctions[0].details.target.covariance
            console.log(this.experience.data.conjunctions[0].details.target)
        }
        else {
            this.covarianceData = this.experience.data.conjunctions[0].details.chaser.covariance
            console.log(this.experience.data.conjunctions[0].details.target)
        }

        this.setModel()

        if (this.model && this.modelParameters) {
            this.covariance = new Covariance(this.model, this.modelParameters, this.type, this.covarianceData, this.modelSize)
            this.trajectory = new Trajectory(this.model, this.modelParameters, this.trajectoryData)
        }
    }

    setModel() {
        this.model = this.resource.scene
        this.modelParameters = {}
        // this.modelParameters.trajectoryThetaAngle = this.theta
        // this.modelParameters.trajectoryPhiAngle = this.phi
        // this.modelParameters.trajectoryRadius = this.radius
        this.modelParameters.color = new THREE.Color(this.color)
        // this.modelParameters.velocity = this.velocity
        // console.log(this.modelParameters.color)

        this.model.scale.set(0.05, 0.05, 0.05)
        // if (this.type === "target")
        //     this.model.scale.set(0.05, 0.05, 0.05)
        // else
        //     this.model.scale.set(0.005, 0.005, 0.005)
        this.model.hasStates = true
        this.model.states = {}

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
            if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material = new THREE.MeshBasicMaterial({ color: this.modelParameters.color })
            }
        })

        this.model.states.hovered = ({
            state: 'hovered',
            onSet: () => {
                console.log("ola")
            }
        });

        this.view.add(this.model)
        this.setPopup()
        this.objsToTest.push(this.model)
    }

    setPopup() {
        this.popup = new ObjectPopup(this.type, "LEMUR-2-ZACHARY", this);
        this.model.popup = this.popup
    }

    update() {
        // this.model.thetaAngle = this.time.elapsed * this.modelParameters.velocity
        // this.model.position.x = Math.cos(this.model.thetaAngle) * this.modelParameters.trajectoryRadius
        // this.model.position.y = Math.sin(this.model.thetaAngle) * Math.sin(this.modelParameters.trajectoryPhiAngle) * this.modelParameters.trajectoryRadius
        // this.model.position.z = Math.sin(this.model.thetaAngle) * Math.cos(this.modelParameters.trajectoryPhiAngle) * this.modelParameters.trajectoryRadius
        this.popup.update()
    }

    scaleObjectByMass(object) {
        let scaleFactor = object.userData.mass; // Adjust as needed
        object.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
}