import Experience from "../../Experience"

export default class Trajectory {
    constructor(object, objectParameters, trajectoryData) {
        this.experience = new Experience
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.object = object
        this.objectParameters = objectParameters
        this.globeView = this.experience.globeView

        // Setup
        this.trajectoryData = trajectoryData
        this.mu = 398600.4418; //  μ=398600.4418km^3/s^2 (standard gravitational parameter for Earth)
        // Time span for the integration (e.g., 24 hours)
        this.tSpan = [0, 24 * 3600]; // seconds
        this.dt = 60; // time step in seconds
        // Scaling factor
        this.realLifeDiameter = 12742000;
        this.modelDiameter = 2;
        this.scalingFactor = this.modelDiameter / this.realLifeDiameter;

        // TODO: Update trajectory data
        // Initial state vector [x0, y0, z0, vx0, vy0, vz0]
        this.state0 = [
            -250507.26675750024,
            1283546.6341141113,
            -6678070.351454438,
            -4140.747635843861,
            -6354.201326360324,
            -1044.7307851585606
        ];

        this.trajectory = this.propagate(this.state0, this.tSpan, this.dt);

        this.setMaterial()
        this.setTrajectory()
        this.setMesh()
    }

    setMaterial() {
        this.material = new THREE.LineDashedMaterial({
            color: this.objectParameters.color,
            scale: 1,
            dashSize: 0.05,
            gapSize: 0.05
        })
    }

    setTrajectory() {
        this.geometry = new THREE.BufferGeometry()
        let count = 100

        // // Convert trajectory points to THREE.js format
        let positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = this.trajectory.trajectory[i][0] * this.scalingFactor;
            positions[i * 3 + 1] = this.trajectory.trajectory[i][1] * this.scalingFactor;
            positions[i * 3 + 2] = this.trajectory.trajectory[i][2] * this.scalingFactor;
        }

        // Calculated and scaled positions from the orbital propagation
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    }

    setMesh() {
        this.mesh = new THREE.Line(this.geometry, this.material);
        this.mesh.computeLineDistances()
        this.mesh.scale.set(1, 1, 1)
        this.globeView.add(this.mesh)
    }

    equationsOfMotion(t, state) {
        const [x, y, z, vx, vy, vz] = state;
        const r = Math.sqrt(x * x + y * y + z * z);
        const ax = -this.mu * x / (r * r * r);
        const ay = -this.mu * y / (r * r * r);
        const az = -this.mu * z / (r * r * r);
        return [vx, vy, vz, ax, ay, az];
    }

    rk4Step(t, state, dt) {
        const k1 = this.equationsOfMotion(t, state);
        const k2 = this.equationsOfMotion(t + dt / 2, this.addVectors(state, this.multiplyVectorByScalar(k1, dt / 2)));
        const k3 = this.equationsOfMotion(t + dt / 2, this.addVectors(state, this.multiplyVectorByScalar(k2, dt / 2)));
        const k4 = this.equationsOfMotion(t + dt, this.addVectors(state, this.multiplyVectorByScalar(k3, dt)));

        const deltaState = this.multiplyVectorByScalar(
            this.addVectors(this.addVectors(k1, this.multiplyVectorByScalar(k2, 2)), this.addVectors(this.multiplyVectorByScalar(k3, 2), k4)),
            dt / 6
        );

        return this.addVectors(state, deltaState);
    }

    propagate(state0, tSpan, dt) {
        let t = tSpan[0];
        let state = state0.slice();
        const trajectory = [[...state]];
        const times = [t];

        while (t < tSpan[1]) {
            state = this.rk4Step(t, state, dt);
            t += dt;
            trajectory.push([...state]);
            times.push(t);
        }

        return { times, trajectory };
    }

    addVectors(v1, v2) {
        return v1.map((val, i) => val + v2[i]);
    }

    multiplyVectorByScalar(v, scalar) {
        return v.map(val => val * scalar);
    }
}