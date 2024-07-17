import * as THREE from 'three'
import Experience from '../../Experience'
import Covariance from './Covariance'
import Trajectory from './Trajectory'
import ObjectPopup from './UI/ObjectPopup'

export default class Objects {
    constructor(view, htmlElement, resource, type, color, modelSize) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Setup 
        this.resource = resource
        this.type = type
        this.color = color
        this.view = view
        this.htmlElement = htmlElement
        this.modelSize = modelSize
        this.objsToTest = this.experience.raycaster.objsToTest

        // this.htmlElement.addEventListener("mouseenter", () => {
        //     if (this.popup)
        //         this.popup.show()
        // })

        this.isPopupOpen = false
        if (this.type === "target" || this.type === "target-posmanoeuvre") {
            this.covarianceData = this.experience.data.conjunctions[0].details.target.covariance
            // console.log(this.experience.data.conjunctions[0].manoeuvres[0])
            // console.log(this.experience.data.conjunctions[0].details.target)
        }
        else {
            this.covarianceData = this.experience.data.conjunctions[0].details.chaser.covariance
            // console.log(this.experience.data.conjunctions[0].details.target)
        }

        this.setModel()

        if (this.model && this.modelParameters) {
            this.covariance = new Covariance(this.view, this.modelParameters, this.type, this.covarianceData, this.modelSize)
            this.trajectory = new Trajectory(this.view, this.modelParameters, this.trajectoryData)
        }
    }

    setModel() {
        this.model = this.resource.scene
        this.modelParameters = {}
        this.modelParameters.color = new THREE.Color(this.color)
        this.view.scale.set(0.05, 0.05, 0.05)
        // this.model.scale.set(0.5, 0.5, 0.5)
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
        this.popup = new ObjectPopup(this.type, "LEMUR-2-ZACHARY", this, this.view);
        this.model.popup = this.popup
    }

    update() {
        this.popup.update()
    }

    scaleObjectByMass(object) {
        let scaleFactor = object.userData.mass; // Adjust as needed
        object.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
}