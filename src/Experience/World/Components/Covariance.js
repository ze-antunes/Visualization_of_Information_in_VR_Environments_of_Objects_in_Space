import Experience from "../../Experience"

export default class Covariance {
    constructor(object, objectParameters) {
        this.experience = new Experience
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.object = object
        this.objectParameters = objectParameters

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry() {
        this.geometry = new THREE.SphereGeometry(0.5, 24, 16);
        this.geometry.rotateZ(Math.PI / 2);
        this.geometry.scale(4.6, 1.5, 1.2);
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: this.objectParameters.color,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.object.add(this.mesh)
    }
}