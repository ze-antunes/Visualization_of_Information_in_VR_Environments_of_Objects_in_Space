import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { CSG } from 'three-csg-ts';
import ThreeMeshUI from 'three-mesh-ui'

// Import Shaders 
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'

// Debug object
let debugObject = {};

// Debug GUI
let gui = new GUI({
    width: 300,
    title: "Debug UI",
    closeFolders: true
});

//Controllers 
let toggleState = true
let rightHand = document.getElementById("rightController")
let leftHand = document.getElementById("leftController")

AFRAME.registerComponent('thumbstick-logging', {
    init: function () {
        this.el.addEventListener('thumbstickmoved', () => {

        });
        this.el.addEventListener('triggerdown', () => {

        });
        this.el.addEventListener('abuttondown', () => {
            if (toggleState) {
                console.log("toggleState: ", toggleState)
                rightHand.setAttribute("super-hands", '')
                rightHand.setAttribute("sphere-collider", 'objects: a-box')
                rightHand.removeAttribute("oculus-touch-controls")

                leftHand.setAttribute("super-hands", '')
                leftHand.setAttribute("sphere-collider", 'objects: a-box')
                leftHand.removeAttribute("oculus-touch-controls")
                console.log("Attributes: ", rightHand.attributes)
            } else {
                console.log("toggleState: ", toggleState)
                rightHand.setAttribute("oculus-touch-controls", 'hand: right')
                rightHand.removeAttribute("super-hands")
                rightHand.removeAttribute("sphere-collider")

                leftHand.setAttribute("oculus-touch-controls", 'hand: left')
                leftHand.removeAttribute("super-hands")
                leftHand.removeAttribute("sphere-collider")
                console.log("Attributes: ", rightHand.attributes)
            }
            toggleState = !toggleState
        });

    }
});

window.addEventListener('keydown', (e) => {
    if (e.key == "h")
        gui.show(gui._hidden);
    // if (e.key == "e") {
    //     if (toggleState) {
    //         console.log("toggleState: ", toggleState)
    //         rightHand.setAttribute("data-test", '')
    //         console.log("Attributes: ", rightHand.attributes)
    //     } else {
    //         console.log("toggleState: ",toggleState)
    //         rightHand.removeAttribute("data-test")
    //         console.log("Attributes: ",rightHand.attributes)
    //     }
    //     toggleState = !toggleState
    // }
});

/**
 * Sizes
 */
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');
// console.log(aframeScene);

// Access the underlying Three.js scene object
let scene = aframeScene.object3D;
scene.castShadow = true;
scene.shadow = true;

// Camera 
// Get the A-Frame camera element
let aframeCamera = document.querySelector('#myCamera');

// Access the underlying Three.js camera object
let cameraComponent = aframeCamera.components;
let camera

// Loaders
let textureLoader = new THREE.TextureLoader()
let gltfLoader = new GLTFLoader()

//Objects Parameters
//Target Parameters
let targetTweaks = gui.addFolder("Target")
let targetParameters = {}
targetParameters.trajectoryGeometry = null
targetParameters.trajectoryMaterial = null
targetParameters.trajectoryPoints = null
targetParameters.trajectoryThetaAngle = Math.PI * 2.4
targetParameters.trajectoryPhiAngle = Math.PI * 0.4
targetParameters.trajectoryRadius = 1.5
targetParameters.color = '#26F7FD'
targetParameters.velocity = 0.05

//Chaser Parameters
let chaserTweaks = gui.addFolder("Chaser")
let chaserParameters = {}
chaserParameters.trajectoryGeometry = null
chaserParameters.trajectoryMaterial = null
chaserParameters.trajectoryPoints = null
chaserParameters.trajectoryThetaAngle = Math.PI * 2.1
chaserParameters.trajectoryPhiAngle = Math.PI * 0
chaserParameters.trajectoryRadius = 1.5
chaserParameters.color = 'lightgreen'
chaserParameters.velocity = 0.05

// Models
let chaser
gltfLoader.load(
    'https://raw.githubusercontent.com/ze-antunes/ARVI_Assets/main/3D_Models/Chaser/scene.gltf',
    (gltf) => {
        // console.log(gltf.scene.children[0].children[0].children[0].material)
        chaser = gltf.scene.children[0]
        chaser.children[0].children[0].material = new THREE.MeshBasicMaterial({ color: chaserParameters.color })
        chaser.scale.set(0.005, 0.005, 0.005)
        chaser.add(chaserCovarianceMesh)
    },
    () => {
        console.log("progress")
    },
    (error) => {
        console.log(error)
    },
)

let target
gltfLoader.load(
    'https://raw.githubusercontent.com/ze-antunes/ARVI_Assets/main/3D_Models/Target/scene.gltf',
    (gltf) => {
        target = gltf.scene.children[0]
        target.children[0].children[0].children[0].material = new THREE.MeshBasicMaterial({ color: targetParameters.color })
        target.children[0].children[1].children[0].material = new THREE.MeshBasicMaterial({ color: targetParameters.color })
        target.children[0].children[1].children[1].material = new THREE.MeshBasicMaterial({ color: targetParameters.color })
        target.scale.set(0.05, 0.05, 0.05)
        target.position.z = 1.4
        target.position.y = 0.1
        target.add(targetCovarianceMesh)
        // console.log(target)
    },
    () => {
        console.log("progress")
    },
    (error) => {
        console.log(error)
    },
)

// Trajectories 
let count = 100


//Elliptical Trajectories
// let geometry = null;
// let material = null;
// let a = 10; // Semi-major axis
// let b = 5; // Semi-minor axis
// let theta = Math.PI * 2.1; // Full angular span (360 degrees)

// let makeEllipticalTrajectory = (geometry, material, count, a, b, theta) => {
//     // Geometry
//     geometry = new THREE.BufferGeometry();
//     let positions = new Float32Array(count * 3);

//     for (let i = 0; i < count; i++) {
//         let angle = (i / count) * theta;
//         let x = a * Math.cos(angle);
//         let y = b * Math.sin(angle);
//         let z = 0; // For simplicity, assume the trajectory lies in the xy-plane

//         // Calculate the index for the current point
//         let index = i * 3;

//         // Store the coordinates in the array
//         positions[index] = x;
//         positions[index + 1] = y;
//         positions[index + 2] = z;
//     }

//     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

//     // Material
//     material = new THREE.LineDashedMaterial({
//         color: 'red',
//         scale: 1,
//         dashSize: 0.05,
//         gapSize: 0.05
//     })

//     // Line
//     let trajectoryLine = new THREE.Line(geo metry, material);
//     trajectoryLine.computeLineDistances()
//     trajectoryLine.scale.set(1, 1, 1)

//     return trajectoryLine;
// };

// let trajectory = makeEllipticalTrajectory(geometry, material, count, a, b, theta);
// scene.add(trajectory);

let makeTrajectory = (geometry, material, points, theta, phi, radius, color) => {
    console.log(geometry, material, points, theta, phi, radius, color)

    // // Destroy trajectory 
    // if (points != null) {
    //     geometry.dispose()
    //     material.dispose()
    //     scene.remove(points)
    // }

    // Geometry 
    geometry = new THREE.BufferGeometry()
    let positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
        let thetaAngle = (i / count) * theta;
        let y = Math.sin(thetaAngle) * Math.sin(phi) * radius
        let x = Math.cos(thetaAngle) * radius
        let z = Math.sin(thetaAngle) * Math.cos(phi) * radius

        // Calculate the index for the current point
        let index = i * 3;

        // Store the coordinates in the array
        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Material
    material = new THREE.LineDashedMaterial({
        color,
        scale: 1,
        dashSize: 0.05,
        gapSize: 0.05
    })

    // Line
    let trajectoryLine = new THREE.Line(geometry, material);
    trajectoryLine.computeLineDistances()
    trajectoryLine.scale.set(1, 1, 1)

    return trajectoryLine
}

targetTweaks
    .add(targetParameters, 'trajectoryThetaAngle')
    .min(0)
    .max(Math.PI * 2)
    .step(0.1)
    .name('trajectory theta')
    .onFinishChange(
        () => {
            // Destroy trajectory
            targetTrajectory.geometry.dispose()
            targetTrajectory.material.dispose()
            globeObject3D.remove(targetTrajectory)

            targetTrajectory = makeTrajectory(
                targetParameters.trajectoryGeometry,
                targetParameters.trajectoryMaterial,
                targetParameters.trajectoryPoints,
                targetParameters.trajectoryThetaAngle,
                targetParameters.trajectoryPhiAngle,
                targetParameters.trajectoryRadius,
                targetParameters.color
            )

            globeObject3D.add(targetTrajectory)
        }
    )

targetTweaks
    .add(targetParameters, 'trajectoryPhiAngle')
    .min(0)
    .max(Math.PI * 2)
    .step(0.1)
    .name('trajectory phi')
    .onFinishChange(
        () => {
            // Destroy trajectory
            targetTrajectory.geometry.dispose()
            targetTrajectory.material.dispose()
            globeObject3D.remove(targetTrajectory)

            targetTrajectory = makeTrajectory(
                targetParameters.trajectoryGeometry,
                targetParameters.trajectoryMaterial,
                targetParameters.trajectoryPoints,
                targetParameters.trajectoryThetaAngle,
                targetParameters.trajectoryPhiAngle,
                targetParameters.trajectoryRadius,
                targetParameters.color
            )

            globeObject3D.add(targetTrajectory)
        }
    )

targetTweaks
    .add(targetParameters, 'velocity')
    .min(0)
    .max(2)
    .step(0.01)
    .name('velocity')


chaserTweaks
    .add(chaserParameters, 'trajectoryThetaAngle')
    .min(0)
    .max(Math.PI * 2)
    .step(0.1)
    .name('trajectory theta')
    .onFinishChange(
        () => {
            // Destroy trajectory
            chaserTrajectory.geometry.dispose()
            chaserTrajectory.material.dispose()
            globeObject3D.remove(chaserTrajectory)

            chaserTrajectory = makeTrajectory(
                chaserParameters.trajectoryGeometry,
                chaserParameters.trajectoryMaterial,
                chaserParameters.trajectoryPoints,
                chaserParameters.trajectoryThetaAngle,
                chaserParameters.trajectoryPhiAngle,
                chaserParameters.trajectoryRadius,
                chaserParameters.color
            )

            globeObject3D.add(chaserTrajectory)
        }
    )

chaserTweaks
    .add(chaserParameters, 'trajectoryPhiAngle')
    .min(0)
    .max(Math.PI * 2)
    .step(0.1)
    .name('trajectory phi')
    .onFinishChange(
        () => {
            // Destroy trajectory
            chaserTrajectory.geometry.dispose()
            chaserTrajectory.material.dispose()
            globeObject3D.remove(chaserTrajectory)

            chaserTrajectory = makeTrajectory(
                chaserParameters.trajectoryGeometry,
                chaserParameters.trajectoryMaterial,
                chaserParameters.trajectoryPoints,
                chaserParameters.trajectoryThetaAngle,
                chaserParameters.trajectoryPhiAngle,
                chaserParameters.trajectoryRadius,
                chaserParameters.color
            )

            globeObject3D.add(chaserTrajectory)
        }
    )

chaserTweaks
    .add(chaserParameters, 'velocity')
    .min(0)
    .max(2)
    .step(0.01)
    .name('velocity')


let chaserCovarianceGeometry = new THREE.SphereGeometry(0.5, 24, 16);
chaserCovarianceGeometry.rotateZ(Math.PI / 2);
chaserCovarianceGeometry.scale(40, 12, 40);

let chaserCovarianceMaterial = new THREE.MeshStandardMaterial({
    color: chaserParameters.color,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});

let chaserCovarianceMesh = new THREE.Mesh(chaserCovarianceGeometry, chaserCovarianceMaterial);
chaserCovarianceMesh.position.set(0.7, 1, -1);
chaserCovarianceMesh.rotation.set(2, 10, -3);

let targetCovarianceGeometry = new THREE.SphereGeometry(0.5, 24, 16);
targetCovarianceGeometry.rotateZ(Math.PI / 2);
targetCovarianceGeometry.scale(4.6, 1.5, 1.2);

let targetCovarianceMaterial = new THREE.MeshStandardMaterial({
    color: targetParameters.color,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});

let targetCovarianceMesh = new THREE.Mesh(targetCovarianceGeometry, targetCovarianceMaterial);

/**
 * Earth
 */
let earthTweaks = gui.addFolder("Earth")
let earthParameters = {}
earthParameters.atmosphereDayColor = '#7ed1fb'
earthParameters.atmosphereTwilightColor = '#ffbc8f'

earthTweaks
    .addColor(earthParameters, 'atmosphereDayColor')
    .onChange(() => {
        earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
        atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
    })

earthTweaks
    .addColor(earthParameters, 'atmosphereTwilightColor')
    .onChange(() => {
        earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
        atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
    })

// Textures 
let earthDayTexture = textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8

let earthNightTexture = textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8

let earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg')
earthSpecularCloudsTexture.anisotropy = 8

// Mesh
let earthGeometry = new THREE.SphereGeometry(1, 64, 64)
let earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
    }
})
// let earthMaterial = new THREE.MeshBasicMaterial({color: 'red'})
let earth = new THREE.Mesh(earthGeometry, earthMaterial)
// scene.add(earth)


// Atmosphere 
let atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms:
    {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
    },
    side: THREE.BackSide,
    transparent: true
});

let atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.04, 1.04, 1.04);
// scene.add(atmosphere)

// Sun 
let sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, -1.4)
let sunDirection = new THREE.Vector3()

// Debug 
let debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
)

// scene.add(debugSun)

let globeObject3D
let targetTrajectory
let chaserTrajectory

AFRAME.registerComponent('three-js-globe', {
    init: function () {
        let globeEntity = document.querySelector('#globe');
        globeObject3D = globeEntity.object3D;
        targetTrajectory = makeTrajectory(
            targetParameters.trajectoryGeometry,
            targetParameters.trajectoryMaterial,
            targetParameters.trajectoryPoints,
            targetParameters.trajectoryThetaAngle,
            targetParameters.trajectoryPhiAngle,
            targetParameters.trajectoryRadius,
            targetParameters.color
        );
        chaserTrajectory = makeTrajectory(
            chaserParameters.trajectoryGeometry,
            chaserParameters.trajectoryMaterial,
            chaserParameters.trajectoryPoints,
            chaserParameters.trajectoryThetaAngle,
            chaserParameters.trajectoryPhiAngle,
            chaserParameters.trajectoryRadius,
            chaserParameters.color
        );
        globeObject3D.add(earth, atmosphere, debugSun, chaserTrajectory, targetTrajectory)
        // globeObject3D.add(earth, atmosphere, debugSun, targetTrajectory)
    }
});


// Update 
let updateSun = () => {
    // Sun direction 
    sunDirection.setFromSpherical(sunSpherical);

    // Debug 
    debugSun.position.copy(sunDirection).multiplyScalar(5)

    // Uniforms 
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)
}

updateSun()

earthTweaks
    .add(sunSpherical, 'phi')
    .min(0)
    .max(Math.PI)
    .onChange(updateSun)
earthTweaks
    .add(sunSpherical, 'theta')
    .min(- Math.PI)
    .max(Math.PI)
    .onChange(updateSun)


//Intersection 
// let intRes = CSG.intersect(targetCovarianceMesh, chaserCovarianceMesh);
// intRes.material = new THREE.MeshBasicMaterial({
//     color: 'red',
//     side: THREE.DoubleSide
// });
// intRes.position.set(-0.7, 1, -1);
// intRes.scale.set(0.999, 0.999, 0.999);

// function checkTwoShapeIntersect(object1, object2) {
//     /**
//      * This function check if two object3d intersect or not
//      * @param {THREE.Object3D} object1
//      * @param {THREE.Object3D} object2
//      * @returns {Boolean}
//     */

//     // Check for intersection using bounding box intersection test
//     let bBox1 = new THREE.Box3().setFromObject(object1);
//     let bBox2 = new THREE.Box3().setFromObject(object2);

//     let intersection = bBox1.intersectsBox(bBox2);
//     // let intersection = mesh1.geometry.boundingBox.intersectsBox(mesh2.geometry.boundingBox);

//     if (intersection) { // The shape geometries intersect.
//         // console.log("intersection: yes")
//         return true
//     } else { // The shape geometries do not intersect.
//         // console.log("intersection: no")
//         return false
//     }
// }

//Update the intersection after changes
function handleIntersectionUpdate() {
    // Remove the intRes object from the scene
    scene.remove(intRes);
    // Dispose of the geometry to free up memory
    intRes.geometry.dispose();
    // Optionally, dispose of the material as well if it's not used elsewhere
    intRes.material.dispose();
    // Set intRes to null to remove references
    intRes = null;

    intRes = CSG.intersect(targetCovarianceMesh, chaserCovarianceMesh);
    console.log(intRes);
    intRes.material = new THREE.MeshBasicMaterial({
        color: 'red',
        side: THREE.DoubleSide
    });

    intRes.position.set(targetCovarianceMesh.position.x, 1, -1);
    intRes.scale.set(0.999, 0.999, 0.999);
    // scene.add(intRes)
    targetCovarianceMesh.add(intRes)
}


// Lights 
let lightsTweaks = gui.addFolder("Lights")

let ambientLight = new THREE.AmbientLight(0xffffff, .6)
lightsTweaks.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name("ambientLight intensity")
scene.add(ambientLight)

// // Point light 
// let pointLight = new THREE.PointLight(0xffffff, 0.4, 100);
// pointLight.position.set(1, 2, - 1.5);
// pointLight.castShadow = true;
// pointLight.shadow.mapSize.width = 1024
// pointLight.shadow.mapSize.heightwidth = 1024
// pointLight.shadow.camera.near = .1
// pointLight.shadow.camera.far = 3

// let pointSphereGeometry = new THREE.SphereGeometry(0.1, 24, 16);
// let pointSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
// let pointSphereMesh = new THREE.Mesh(pointSphereGeometry, pointSphereMaterial);
// pointSphereMesh.position.set(1, 2, - 1.5);

// lightsTweaks.add(pointLight, 'intensity').min(0).max(3).step(0.001).name("pointLight intensity")
// lightsTweaks.add(pointLight.position, 'x').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.x = value })
// lightsTweaks.add(pointLight.position, 'y').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.y = value })
// lightsTweaks.add(pointLight.position, 'z').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.z = value })

// let sphereSize = 1;
// let pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
// let pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
// pointLightHelper.visible = false
// pointLightCameraHelper.visible = false
// scene.add(pointLightCameraHelper)
// scene.add(pointLight, pointSphereMesh, pointLightHelper);

// Access the underlying Three.js renderer object
let renderer

setTimeout(() => {
    camera = cameraComponent.camera.camera;

    renderer = aframeScene.renderer;
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
    renderer.setClearColor('#000011')
}, 100)

/**
 * Animate
 */
let clock = new THREE.Clock()

let tick = () => {
    let elapsedTime = clock.getElapsedTime()

    // Update chaser
    if (chaser != undefined) {
        let thetaAngle = elapsedTime * chaserParameters.velocity
        chaser.position.x = Math.cos(thetaAngle) * chaserParameters.trajectoryRadius
        chaser.position.y = Math.sin(thetaAngle) * Math.sin(chaserParameters.trajectoryPhiAngle) * chaserParameters.trajectoryRadius
        chaser.position.z = Math.sin(thetaAngle) * Math.cos(chaserParameters.trajectoryPhiAngle) * chaserParameters.trajectoryRadius

        globeObject3D.add(chaser)
    }

    // Update chaser
    if (target != undefined) {
        let thetaAngle = elapsedTime * targetParameters.velocity
        target.position.x = Math.cos(thetaAngle) * targetParameters.trajectoryRadius
        target.position.y = Math.sin(thetaAngle) * Math.sin(targetParameters.trajectoryPhiAngle) * targetParameters.trajectoryRadius
        target.position.z = Math.sin(thetaAngle) * Math.cos(targetParameters.trajectoryPhiAngle) * targetParameters.trajectoryRadius

        globeObject3D.add(target)
    }

    // Update chaser
    if (chaserTrajectory != undefined) {
        // console.log(chaserTrajectory)

    }


    // Update intersection 
    // targetCovarianceMesh.updateMatrix()
    // chaserCovarianceMesh.updateMatrix()
    // let chekcIntersection = checkTwoShapeIntersect(targetCovarianceMesh, chaserCovarianceMesh)
    // if (chekcIntersection) {
    //     handleIntersectionUpdate()
    // }

    earth.rotation.y = elapsedTime * 0.05

    // Don't forget, ThreeMeshUI must be updated manually.
    // This has been introduced in version 3.0.0 in order
    // to improve performance
    ThreeMeshUI.update();

    meshContainer.rotation.z += 0.01;
    meshContainer.rotation.y += 0.01;

    updateButtons();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

// tick()


// function makeTextPanel() {

//     const container = new ThreeMeshUI.Block({
//         width: 1.2,
//         height: 0.5,
//         padding: 0.05,
//         justifyContent: 'center',
//         alignContent: 'left',
//         fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
//         fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
//     });

//     container.position.set(0, 0, 0);
//     container.rotation.x = -0.3;
//     scene.add(container);

//     //

//     container.add(

//         new ThreeMeshUI.Text({
//             content: "Ze",
//             fontSize: 0.08
//         }),
//     );

// }

// makeTextPanel();

import FontJSON from './assets/Roboto-msdf.json';
import FontImage from './assets/Roboto-msdf.png';

let meshContainer, meshes, currentMesh;
const objsToTest = [];

// compute mouse position in normalized device coordinates
// (-1 to +1) for both directions.
// Used to raycasting against the interactive elements

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;

window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('pointerdown', () => {
    selectState = true;
});

window.addEventListener('pointerup', () => {
    selectState = false;
});

window.addEventListener('touchstart', (event) => {
    selectState = true;
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('touchend', () => {
    selectState = false;
    mouse.x = null;
    mouse.y = null;
});

//

////////////////////
// Primitive Meshes
////////////////////

meshContainer = new THREE.Group();
meshContainer.position.set(0, 1, -1.9);
scene.add(meshContainer);

const sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.3, 1),
    new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true })
);

const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.45, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x643de3, flatShading: true })
);

const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.5, 10),
    new THREE.MeshStandardMaterial({ color: 0xe33d4e, flatShading: true })
);

//

sphere.visible = box.visible = cone.visible = false;

meshContainer.position.set(0, 1.5, 1);
meshContainer.add(sphere, box, cone);

meshes = [sphere, box, cone];
currentMesh = 0;

showMesh(currentMesh);

//////////
// Panel
//////////

makePanel();

// Shows the primitive mesh with the passed ID and hide the others

function showMesh(id) {

    meshes.forEach((mesh, i) => {

        mesh.visible = i === id ? true : false;

    });

}

///////////////////
// UI contruction
///////////////////

function makePanel() {

    // Container block, in which we put the two buttons.
    // We don't define width and height, it will be set automatically from the children's dimensions
    // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

    const container = new ThreeMeshUI.Block({
        justifyContent: 'center',
        contentDirection: 'row-reverse',
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11
    });

    container.position.set(0, 0.6, 1.2);
    container.rotation.x = -0.55;
    scene.add(container);

    // BUTTONS

    // We start by creating objects containing options that we will use with the two buttons,
    // in order to write less code.

    const buttonOptions = {
        width: 0.4,
        height: 0.15,
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        borderRadius: 0.075
    };

    // Options for component.setupState().
    // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

    const hoveredStateAttributes = {
        state: 'hovered',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 1,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    const idleStateAttributes = {
        state: 'idle',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x666666),
            backgroundOpacity: 0.3,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    // Buttons creation, with the options objects passed in parameters.

    const buttonNext = new ThreeMeshUI.Block(buttonOptions);
    const buttonPrevious = new ThreeMeshUI.Block(buttonOptions);

    // Add text to buttons

    buttonNext.add(
        new ThreeMeshUI.Text({ content: 'next' })
    );

    buttonPrevious.add(
        new ThreeMeshUI.Text({ content: 'previous' })
    );

    // Create states for the buttons.
    // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

    const selectedAttributes = {
        offset: 0.02,
        backgroundColor: new THREE.Color(0x777777),
        fontColor: new THREE.Color(0x222222)
    };

    buttonNext.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {

            currentMesh = (currentMesh + 1) % 3;
            showMesh(currentMesh);

        }
    });
    buttonNext.setupState(hoveredStateAttributes);
    buttonNext.setupState(idleStateAttributes);

    //

    buttonPrevious.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {

            currentMesh -= 1;
            if (currentMesh < 0) currentMesh = 2;
            showMesh(currentMesh);

        }
    });
    buttonPrevious.setupState(hoveredStateAttributes);
    buttonPrevious.setupState(idleStateAttributes);

    buttonNext.mixin = 'box'
    buttonNext['intersect-color-change'] = ''
    // buttonPrevious.setAttribute('mixin', 'box');

    console.log(buttonNext)
    console.log(document.getElementById("box"))

    //

    container.add(buttonNext, buttonPrevious);
    objsToTest.push(buttonNext, buttonPrevious);

}

// Called in the loop, get intersection with either the mouse or the VR controllers,
// then update the buttons states according to result

function updateButtons() {

    // Find closest intersecting object

    let intersect;

    if (renderer != undefined && renderer.xr.isPresenting) {

        vrControl.setFromController(0, raycaster.ray);

        intersect = raycast();

        // Position the little white dot at the end of the controller pointing ray
        if (intersect) vrControl.setPointerAt(0, intersect.point);

    } else if (mouse.x !== null && mouse.y !== null) {

        raycaster.setFromCamera(mouse, camera);

        intersect = raycast();

    }

    // Update targeted button state (if any)

    if (intersect && intersect.object.isUI) {

        if (selectState) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            intersect.object.setState('selected');

        } else {

            // Component.setState internally call component.set with the options you defined in component.setupState
            intersect.object.setState('hovered');

        }

    }

    // Update non-targeted buttons state

    objsToTest.forEach((obj) => {

        if ((!intersect || obj !== intersect.object) && obj.isUI) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            obj.setState('idle');

        }

    });

}

//

function raycast() {

    return objsToTest.reduce((closestIntersection, obj) => {

        const intersection = raycaster.intersectObject(obj, true);

        if (!intersection[0]) return closestIntersection;

        if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {

            intersection[0].object = obj;

            return intersection[0];

        }

        return closestIntersection;

    }, null);

}


tick()


AFRAME.registerComponent('boxes', {
    init: function () {
        var box;
        var columns = 20;
        var el = this.el;
        var i;
        var j;
        var rows = 15;

        if (el.sceneEl.isMobile) {
            columns = 10;
            rows = 5;
        };

        for (let x = columns / -2; x < columns / 2; x++) {
            for (let y = 0.5; y < rows; y++) {
                box = document.createElement('a-entity');
                box.setAttribute('mixin', 'box');
                box.setAttribute('position', { x: x * .6, y: y * .6, z: 1.5 });
                el.appendChild(box);
            }
        }
    }
});

AFRAME.registerComponent('shadow-if-mobile', {
    init: function () {
        if (!this.el.sceneEl.isMobile) {
            this.el.setAttribute('light', {
                castShadow: true,
                shadowMapWidth: 2048,
                shadowMapHeight: 1024
            });
        }
    }
});

AFRAME.registerComponent('intersectColorChange', {
    init: function () {
        var el = this.el;
        var material = el.getAttribute('material');
        var initialColor = material.color;
        var self = this;

        el.addEventListener('mousedown', function (evt) {
            el.setAttribute('material', 'color', '#EF2D5E');
        });

        el.addEventListener('mouseup', function (evt) {
            el.setAttribute('material', 'color', self.isMouseEnter ? '#24CAFF' : initialColor);
        });

        el.addEventListener('mouseenter', function () {
            el.setAttribute('material', 'color', '#24CAFF');
            self.isMouseEnter = true;
        });

        el.addEventListener('mouseleave', function () {
            el.setAttribute('material', 'color', initialColor);
            self.isMouseEnter = false;
        });
    }
});