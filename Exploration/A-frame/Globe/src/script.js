import * as THREE from 'three';
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as GeometryUtils from 'three/examples/jsm/utils/GeometryUtils'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');

// Access the underlying Three.js scene object
let scene = aframeScene.object3D;

// Debug 
let gui = new GUI({
    width: 300,
    title: "Debug UI",
    closeFolders: true
});
// gui.close()
// gui.hide()

window.addEventListener('keydown', (e) => {
    if (e.key == "h")
        gui.show(gui._hidden)
})

// Loader and Models
let gltfLoader = new GLTFLoader()
let globe
let globeTweaks = gui.addFolder("Globe")

gltfLoader.load(
    'https://raw.githubusercontent.com/ze-antunes/ARVI_Assets/main/3D_Models/earth_globe/scene.gltf',
    (gltf) => {
        console.log('success')
        // console.log(gltf)

        globe = gltf.scene.children[0].children[0].children[0].children[0]
        globe.position.set(1, 1, -3);
        globe.scale.set(0.05, 0.05, 0.05)

        globeTweaks
            .add(globe.position, 'x')
            .min(-3)
            .max(3)
            .step(0.01)
            .name('cube x-pos');

        globeTweaks
            .add(globe.position, 'y')
            .min(1)
            .max(3)
            .step(0.01)
            .name('cube y-pos');

        globeTweaks
            .add(globe.position, 'z')
            .min(-3)
            .max(3)
            .step(0.01)
            .name('cube z-pos');

        // Access materials of the loaded GLTF model
        globe.traverse((child) => {
            if (child.isMesh && child.material.map && child.material.map.normalMap) {
                console.log(child.material); // log the material of each mesh
                let texture = new THREE.TextureLoader().load('assets/' + child.material.map.normalMap);
                let material = new THREE.MeshBasicMaterial({ map: texture });
                child.material = material

                globeTweaks
                    .add(child.material, 'visible').name(`material id ${child.material.id}`);;
            }
        });

        scene.add(globe)
    },
    (progress) => {
        console.log('progress')
        // console.log(progress)
    },
    (error) => {
        console.log('error')
        // console.log(error)
    },
)

/**
 * Object
 */
// Cube 
let cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
let cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
cubeMesh.position.set(-1, 1, -3);
scene.add(cubeMesh);

// Line
// let linePoints = []
// linePoints.push(new THREE.Vector3(-1, 1, 1))
// linePoints.push(new THREE.Vector3(0, 0, 0))
// linePoints.push(new THREE.Vector3(1, -1, -1))

// let lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints)
// let lineMaterial = new THREE.LineBasicMaterial({
//     color: 0xffffff,
//     linewidth: 10
// })
// let line = new THREE.Line(lineGeometry, lineMaterial)
// line.position.set(0, 1, -3)
// scene.add(line)

// Curved Line 
//Create a closed wavey loop
let curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2, 4, -5),
    new THREE.Vector3(0, 4, -5),
    new THREE.Vector3(-2, 4, -5)
]);

let curvePoints = curve.getPoints(50);
let curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

let curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

// Create the final object to add to the scene
let curveObject = new THREE.Line(curveGeometry, curveMaterial);
scene.add(curveObject)


// GUI  
let cubeTweaks = gui.addFolder("Cube")
let curveTweaks = gui.addFolder("Curve")


cubeTweaks
    .add(cubeMesh.position, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('cube x-pos');

cubeTweaks
    .add(cubeMesh.position, 'y')
    .min(1)
    .max(3)
    .step(0.01)
    .name('cube y-pos');

cubeTweaks
    .add(cubeMesh.position, 'z')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('cube z-pos');

cubeTweaks
    .add(cubeMaterial, 'visible');

cubeTweaks
    .add(cubeMaterial, 'wireframe');
