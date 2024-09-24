import Experience from "../../Experience"
import * as MATHJS from 'mathjs';

export default class Covariance {
    constructor(object, objectParameters, type, data, modelSize) {
        this.experience = new Experience
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Setup 
        this.object = object
        this.objectParameters = objectParameters
        this.type = type
        this.data = data
        this.modelSize = modelSize

        // console.log(this.data)
        this.setMaterial()
        this.setCovariance()
    }

    setMaterial() {
        this.ellipsoidMaterial = new THREE.MeshStandardMaterial({
            color: this.objectParameters.color,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
            // wireframe: true
        });
    }

    setCovariance() {
        // Define the covariance matrix P (ensure it is a square 3x3 matrix)
        let P = [
            [this.data.cr_r, this.data.ct_r, this.data.cn_r],
            [this.data.ct_r, this.data.ct_t, this.data.cn_t],
            [this.data.cn_r, this.data.cn_t, this.data.cn_n],
        ];
        // console.log(this.data)
        
        // Perform eigenvalue decomposition
        let eigResult = MATHJS.eigs(P);
        let eigenvalues = eigResult.values;
        let eigenvectors = eigResult.eigenvectors;
        // console.log(eigResult)

        // Calculate the lengths of the semi-axes
        let semiAxesLengths = eigenvalues.map(Math.sqrt);
        // console.log(semiAxesLengths)

        // Create the ellipsoid
        this.ellipsoidGeometry = new THREE.SphereGeometry(1, 32, 32);
        this.ellipsoid = new THREE.Mesh(this.ellipsoidGeometry, this.ellipsoidMaterial);
        this.ellipsoid.position.set(0, 0, 0)
        // this.ellipsoid.scale.set(semiAxesLengths[0], semiAxesLengths[1], semiAxesLengths[2]);
        this.ellipsoid.scale.set(semiAxesLengths[0] * 0.1, semiAxesLengths[1] * 0.1, semiAxesLengths[2] * 0.001);

        // Scale the ellipsoid
        // Model size (2 meters)
        let scaledSemiAxesLengths = this.scaleToModel(semiAxesLengths, this.modelSize);
        // ellipsoid.scale.set(scaledSemiAxesLengths[0], scaledSemiAxesLengths[1], scaledSemiAxesLengths[2]);

 
        // Apply rotation to align with eigenvectors
        let rotationMatrix = new THREE.Matrix4();
        rotationMatrix.set(
            eigenvectors[0].vector[0], eigenvectors[0].vector[1], eigenvectors[0].vector[2], 0,
            eigenvectors[1].vector[0], eigenvectors[1].vector[1], eigenvectors[1].vector[2], 0,
            eigenvectors[2].vector[0], eigenvectors[2].vector[1], eigenvectors[2].vector[2], 0,
            0, 0, 0, 1
        );
        this.ellipsoid.applyMatrix4(rotationMatrix);

        this.object.add(this.ellipsoid)
    }

    update(newData) {
        // Define the covariance matrix P (ensure it is a square 3x3 matrix)
        let P = [
            [newData.cr_r, newData.ct_r, newData.cn_r],
            [newData.ct_r, newData.ct_t, newData.cn_t],
            [newData.cn_r, newData.cn_t, newData.cn_n],
        ];

        // Perform eigenvalue decomposition
        let eigResult = MATHJS.eigs(P);
        let eigenvalues = eigResult.values;
        let eigenvectors = eigResult.eigenvectors;
        // console.log(eigResult)

        // Calculate the lengths of the semi-axes
        let semiAxesLengths = eigenvalues.map(Math.sqrt);
        // console.log(semiAxesLengths)

        // Create the ellipsoid
        // this.ellipsoid.scale.set(semiAxesLengths[0], semiAxesLengths[1], semiAxesLengths[2]);
        this.ellipsoid.scale.set(semiAxesLengths[0] * 0.1, semiAxesLengths[1] * 0.1, semiAxesLengths[2] * 0.001);

        // Scale the ellipsoid
        // Model size (2 meters)
        let scaledSemiAxesLengths = this.scaleToModel(semiAxesLengths, this.modelSize);
        // this.ellipsoid.scale.set(scaledSemiAxesLengths[0], scaledSemiAxesLengths[1], scaledSemiAxesLengths[2]);


        // Apply rotation to align with eigenvectors
        let rotationMatrix = new THREE.Matrix4();
        rotationMatrix.set(
            eigenvectors[0].vector[0], eigenvectors[0].vector[1], eigenvectors[0].vector[2], 0,
            eigenvectors[1].vector[0], eigenvectors[1].vector[1], eigenvectors[1].vector[2], 0,
            eigenvectors[2].vector[0], eigenvectors[2].vector[1], eigenvectors[2].vector[2], 0,
            0, 0, 0, 1
        );
        // this.ellipsoid.applyMatrix4(rotationMatrix);
    }

    scaleToModel(semiAxesLengths, modelSize) {
        let maxSemiAxisLength = Math.max(...semiAxesLengths);
        let scaleFactor = modelSize / maxSemiAxisLength;
        return semiAxesLengths.map(length => length * scaleFactor);
    }
}