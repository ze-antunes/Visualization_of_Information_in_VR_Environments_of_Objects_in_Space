import Experience from "../../Experience"
import * as MATHJS from 'mathjs';

export default class Covariance {
    constructor(object, objectParameters, type, data) {
        this.experience = new Experience
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Setup 
        this.object = object
        this.objectParameters = objectParameters
        this.type = type
        this.data = data
        this.modelSize = 2

        // console.log(this.data)
        this.setCovariance()
    }

    setCovariance() {
        // Define the covariance matrix P (ensure it is a square 3x3 matrix)
        const P = [
            [this.data.cr_r, this.data.ct_r, this.data.cn_r],
            [this.data.ct_r, this.data.ct_t, this.data.cn_t],
            [this.data.cn_r, this.data.cn_t, this.data.cn_n]
        ];

        // Perform eigenvalue decomposition
        const eigResult = MATHJS.eigs(P);
        const eigenvalues = eigResult.values;
        const eigenvectors = eigResult.eigenvectors;

        // Calculate the lengths of the semi-axes
        const semiAxesLengths = eigenvalues.map(Math.sqrt);
        // console.log(P)

        // Create the ellipsoid
        const ellipsoidGeometry = new THREE.SphereGeometry(1, 32, 32);
        // const ellipsoidMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff, wireframe: false });
        const ellipsoidMaterial = new THREE.MeshStandardMaterial({
            color: this.objectParameters.color,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const ellipsoid = new THREE.Mesh(ellipsoidGeometry, ellipsoidMaterial);
        ellipsoid.position.set(0, 0, 0)

        // Scale the ellipsoid
        // Desired model size (2 meters)
        const scaledSemiAxesLengths = this.scaleToModel(semiAxesLengths, this.modelSize);
        // console.log('Scaled Semi-Axes Lengths:', scaledSemiAxesLengths);
        // ellipsoid.scale.set(scaledSemiAxesLengths[0], scaledSemiAxesLengths[1], scaledSemiAxesLengths[2]);
        ellipsoid.scale.set(semiAxesLengths[0] * 0.01, semiAxesLengths[1] * 0.01, semiAxesLengths[2] * 0.0001);
 
        // Apply rotation to align with eigenvectors
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.set(
            eigenvectors[0].vector[0], eigenvectors[0].vector[1], eigenvectors[0].vector[2], 0,
            eigenvectors[1].vector[0], eigenvectors[1].vector[1], eigenvectors[1].vector[2], 0,
            eigenvectors[2].vector[0], eigenvectors[2].vector[1], eigenvectors[2].vector[2], 0,
            0, 0, 0, 1
        );
        ellipsoid.applyMatrix4(rotationMatrix);
        // console.log(rotationMatrix)


        // ---------------- 

        // this.geometry = new THREE.SphereGeometry(0.5, 24, 16);
        // this.geometry.rotateZ(Math.PI / 2);
        // if (this.type === "target")
        //     this.geometry.scale(4.6, 1.5, 1.2);
        // else
        //     this.geometry.scale(4.6 * 10, 1.5 * 10, 1.2 * 10);

        // this.material = new THREE.MeshStandardMaterial({
        //     color: this.objectParameters.color,
        //     transparent: true,
        //     opacity: 0.2,
        //     side: THREE.DoubleSide
        // });

        // this.mesh = new THREE.Mesh(this.geometry, this.material)
        

        // ---------------- 

        this.object.add(ellipsoid)
    }

    scaleToModel(semiAxesLengths, modelSize) {
        const maxSemiAxisLength = Math.max(...semiAxesLengths);
        const scaleFactor = modelSize / maxSemiAxisLength;
        return semiAxesLengths.map(length => length * scaleFactor);
    }
}