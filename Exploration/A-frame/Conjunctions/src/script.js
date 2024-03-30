import * as THREE from 'three';
import GUI from 'lil-gui';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CSG } from 'three-csg-ts';

let conjunctionData;

fetch("exp_conjunctions.json")
    .then(response => response.json())
    .then(data => {
        console.log(data);
        conjunctionData = data;
    })
    .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('There was a problem with the fetch operation:', error);
    });


// Debug object
let debugObject = {};

// Debug GUI
let gui = new GUI({
    width: 300,
    title: "Debug UI",
    closeFolders: true
});

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');
console.log(aframeScene);

// Access the underlying Three.js scene object
let scene = aframeScene.object3D;
scene.castShadow = true;
scene.shadow = true;

// Get the A-Frame camera element
let aframeCamera = document.querySelector('#myCamera');

// Access the underlying Three.js camera object
let cameraComponent = aframeCamera.components;
let camera

// Access the underlying Three.js renderer object
let renderer
console.log(renderer, 1)
setTimeout(() => {
    camera = cameraComponent.camera.camera;

    renderer = aframeScene.renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // targetObject3D.children[0].geometry = targetCovarianceGeometry
    // targetObject3D.children[0].material.opacity = 0;
    // chaserObject3D.children[0].geometry = chaserCovarianceGeometry
    // chaserObject3D.children[0].rotation.set(2, 10, -3);
    // chaserObject3D.children[0].material.opacity = 0;
}, 1000)

window.addEventListener('keydown', (e) => {
    if (e.key == "h")
        gui.show(gui._hidden);
});


// Target
let targetEntity = document.querySelector('#target');
let targetObject3D = targetEntity.object3D;

let targetGeometry = new THREE.SphereGeometry(.1, 24, 16);
let targetMaterial = new THREE.MeshStandardMaterial({ color: '#03fc28' });
let targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
// targetMesh.position.set(-0.7, 1, -3);
targetMesh.castShadow = true; //default is false
targetMesh.receiveShadow = true;

let targetCovarianceGeometry = new THREE.SphereGeometry(0.5, 24, 16);
targetCovarianceGeometry.rotateZ(Math.PI / 2);
targetCovarianceGeometry.scale(2.3, .5, .4);

let targetCovarianceMaterial = new THREE.MeshStandardMaterial({
    color: '#03fc28',
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});

let targetCovarianceMesh = new THREE.Mesh(targetCovarianceGeometry, targetCovarianceMaterial);
// targetCovarianceMesh.position.set(-0.7, 1, -3);

// target.add(targetMesh, targetCovarianceMesh)
targetObject3D.add(targetMesh, targetCovarianceMesh)
// scene.add(targetMesh, targetCovarianceMesh);

// //Test Object
// let sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
// let sphereMesh = new THREE.Mesh(sphereGeometry, targetMaterial);
// sphereMesh.position.set(0, 0, 0)
// sphereMesh.castShadow = true; //default is false
// sphereMesh.receiveShadow = true;
// let aframeEntity = document.querySelector('#myEntityTest');
// let entityObject3D = aframeEntity.object3D;
// entityObject3D.castShadow = true; //default is false
// entityObject3D.receiveShadow = true;
// entityObject3D.material = targetMaterial;
// entityObject3D.add(sphereMesh);

// gui
//     .add(entityObject3D.position, 'z')
//     .min(-5)
//     .max(1)
//     .step(0.01)
//     .name('test object x-pos')
//     .onChange((value) => {
//         console.log(value)
//     })


// Chaser
let chaserEntity = document.querySelector('#chaser');
let chaserObject3D = chaserEntity.object3D;

let chaserGeometry = new THREE.SphereGeometry(.1, 24, 16);
let chaserMaterial = new THREE.MeshStandardMaterial({ color: '#0388fc' });
let chaserMesh = new THREE.Mesh(chaserGeometry, chaserMaterial);
// chaserMesh.position.set(0.7, 1, -3);
chaserMesh.castShadow = true; //default is false
chaserMesh.receiveShadow = true;
// scene.add(chaserMesh);

let chaserCovarianceGeometry = new THREE.SphereGeometry(0.5, 24, 16);
chaserCovarianceGeometry.rotateZ(Math.PI / 2);
chaserCovarianceGeometry.scale(2, 0.6, 2);

let chaserCovarianceMaterial = new THREE.MeshStandardMaterial({
    color: '#0388fc',
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});

let chaserCovarianceMesh = new THREE.Mesh(chaserCovarianceGeometry, chaserCovarianceMaterial);
// chaserCovarianceMesh.position.set(0.7, 1, -3);
chaserCovarianceMesh.rotation.set(2, 10, -3);
// scene.add(chaserCovarianceMesh);

chaserObject3D.add(chaserMesh, chaserCovarianceMesh)

// AFRAME.registerComponent('three-js-chaser', {
//     init: function () {
//         this.el.setAttribute('scale', '2 1 0.5'); // Set the scale of the entity
//     }
// });


// Target / Chaser Intersection 
function checkTwoShapeIntersect(object1, object2) {
    /**
     * This function check if two object3d intersect or not
     * @param {THREE.Object3D} object1
     * @param {THREE.Object3D} object2
     * @returns {Boolean} 
    */

    // Check for intersection using bounding box intersection test
    let bBox1 = new THREE.Box3().setFromObject(object1);
    let bBox2 = new THREE.Box3().setFromObject(object2);

    let intersection = bBox1.intersectsBox(bBox2);
    // let intersection = mesh1.geometry.boundingBox.intersectsBox(mesh2.geometry.boundingBox);

    if (intersection) { // The shape geometries intersect.
        console.log("intersection: yes")
        return true
    } else { // The shape geometries do not intersect.
        console.log("intersection: no")
        return false
    }
}

// checkTwoShapeIntersect(target, chaserCovarianceMesh)

targetCovarianceMesh.updateMatrix();
chaserCovarianceMesh.updateMatrix();
let intRes = CSG.intersect(targetCovarianceMesh, chaserCovarianceMesh);
intRes.material = new THREE.MeshBasicMaterial({
    color: 'red',
    side: THREE.DoubleSide
});
// console.log(intRes.material)
intRes.position.set(0, 1, -3);
intRes.castShadow = true; //default is false
intRes.receiveShadow = true;
scene.add(intRes)

//Update the intersection after changes
function handleIntersectionUpdate(xPos, object) {
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
    if (object == 0)
        intRes.position.set(xPos, 1, -3);
    if (object == 1) {
        intRes.position.set(targetCovarianceMesh.position.x, 1, -3);
    }
    scene.add(intRes)
}


// Walls 
// Floor 
let floor = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 5),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
floor.rotation.x = - Math.PI * 0.5
floor.position.z = -2.5
// floor.castShadow = true; //default is false
floor.receiveShadow = true;

// Front Wall 
let frontW = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 5),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
frontW.position.z = -5
frontW.position.y = 2.5
// frontW.castShadow = true; //default is false
frontW.receiveShadow = true;

// Front Wall 
let backW = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 5),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
backW.rotation.y = Math.PI
backW.position.z = 0
backW.position.y = 2.5
// backW.castShadow = true; //default is false
backW.receiveShadow = true;

// Left Wall 
let leftW = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
leftW.rotation.x = - Math.PI * 0.5
leftW.rotation.y = Math.PI * 0.5
leftW.position.x = -3.5
leftW.position.y = 2.5
leftW.position.z = -2.5
// leftW.castShadow = true; //default is false
leftW.receiveShadow = true;

// Right Wall 
let rightW = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshStandardMaterial({ color: 'lightgrey' })
)
rightW.rotation.x = - Math.PI * 0.5
rightW.rotation.y = - Math.PI * 0.5
rightW.position.x = 3.5
rightW.position.y = 2.5
rightW.position.z = -2.5
// rightW.castShadow = true; //default is false
rightW.receiveShadow = true;


scene.add(floor, frontW, backW, leftW, rightW)

//Lights
let lightsTweaks = gui.addFolder("Lights")
let ambientLight = new THREE.AmbientLight(0xffffff, 0)
lightsTweaks.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name("ambientLight intensity")
scene.add(ambientLight)

// // Directional light
// let directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
// directionalLight.position.set(2, 2, - 1)
// lightsTweaks.add(directionalLight, 'intensity').min(0).max(3).step(0.001).name("directionalLight intensity")
// lightsTweaks.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
// lightsTweaks.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
// lightsTweaks.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
// scene.add(directionalLight)

// Point light 
const pointLight = new THREE.PointLight(0xffffff, 0.4, 100);
pointLight.position.set(2, 2, - 1);
pointLight.castShadow = true;

const pointSphereGeometry = new THREE.SphereGeometry(0.1, 24, 16);
const pointSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const pointSphereMesh = new THREE.Mesh(pointSphereGeometry, pointSphereMaterial);
pointSphereMesh.position.set(2, 2, - 1);

lightsTweaks.add(pointLight, 'intensity').min(0).max(3).step(0.001).name("pointLight intensity")
lightsTweaks.add(pointLight.position, 'x').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.x = value })
lightsTweaks.add(pointLight.position, 'y').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.y = value })
lightsTweaks.add(pointLight.position, 'z').min(- 5).max(5).step(0.001).onChange((value) => { pointSphereMesh.position.z = value })

const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
scene.add(pointLight, pointSphereMesh, pointLightHelper);

let targetTweaks = gui.addFolder("Target")
let chaserTweaks = gui.addFolder("Chaser")

targetTweaks
    .add(targetCovarianceMesh.position, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('x-pos')
    .onChange((value) => {
        targetMesh.position.set(value, 0, 0)
    })
    .onFinishChange((value) => {
        handleIntersectionUpdate(value, 0);
    })

chaserTweaks
    .add(chaserCovarianceMesh.position, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('x-pos')
    .onChange((value) => {
        chaserMesh.position.set(value, 0, 0)
    })
    .onFinishChange((value) => {
        handleIntersectionUpdate(value, 1);
    })