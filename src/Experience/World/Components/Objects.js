import * as THREE from 'three'
import Experience from '../../Experience'
import Covariance from './Covariance'
import Trajectory from './Trajectory'
import ThreeMeshUI from 'three-mesh-ui'
import ObjectPopup from './UI/ObjectPopup'

export default class Objects {
    constructor(view, resource, type, color, theta, phi, radius, velocity) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug
        
        // Debug
        // if (this.debug.active) {
        //     this.debugFolder = this.debug.ui.addFolder('Objects')
        // }
        
        // Setup 
        this.resource = resource
        this.type = type
        this.color = color
        this.view = view
        this.theta = theta
        this.phi = phi
        this.radius = radius
        this.velocity = velocity
        this.objsToTest = this.experience.raycaster.objsToTest
        this.isPopupOpen = false

        this.setModel()

        if (this.model && this.modelParameters) {
            this.covariance = new Covariance(this.model, this.modelParameters)
            this.trajectory = new Trajectory(this.model, this.modelParameters)
        }
    }

    setModel() {
        this.model = this.resource.scene
        this.modelParameters = {}
        this.modelParameters.trajectoryThetaAngle = this.theta
        this.modelParameters.trajectoryPhiAngle = this.phi
        this.modelParameters.trajectoryRadius = this.radius
        this.modelParameters.color = this.color
        this.modelParameters.velocity = this.velocity
        this.model.scale.set(0.05, 0.05, 0.05)
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
        // this.setPopup()
        this.objsToTest.push(this.model)
    }

    // setPopup() {
    //     this.popup = new ObjectPopup(this.type, "LEMUR-2-ZACHARY", this);
    //     this.model.popup = this.popup
    // }

    update() {
        this.model.thetaAngle = this.time.elapsed * this.modelParameters.velocity
        this.model.position.x = Math.cos(this.model.thetaAngle) * this.modelParameters.trajectoryRadius
        this.model.position.y = Math.sin(this.model.thetaAngle) * Math.sin(this.modelParameters.trajectoryPhiAngle) * this.modelParameters.trajectoryRadius
        this.model.position.z = Math.sin(this.model.thetaAngle) * Math.cos(this.modelParameters.trajectoryPhiAngle) * this.modelParameters.trajectoryRadius
        // this.popup.update()
    }
}