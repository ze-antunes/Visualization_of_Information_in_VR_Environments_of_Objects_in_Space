import Experience from "../../Experience"

export default class Covariance {
    constructor(object, objectParameters, type) {
        this.experience = new Experience
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Setup 
        this.object = object
        this.objectParameters = objectParameters
        this.type = type

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry() {
        this.geometry = new THREE.SphereGeometry(0.5, 24, 16);
        this.geometry.rotateZ(Math.PI / 2);
        if (this.type === "target")
            this.geometry.scale(4.6, 1.5, 1.2);
        else
            this.geometry.scale(4.6 * 10, 1.5 * 10, 1.2 * 10);
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