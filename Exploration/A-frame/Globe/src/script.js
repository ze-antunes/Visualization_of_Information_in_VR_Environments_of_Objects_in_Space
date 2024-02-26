// import * as THREE from 'three'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');

// Access the underlying Three.js scene object
let scene = aframeScene.object3D;

// Debug 
const gui = new GUI({
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
        console.log(gltf)

        globe = gltf.scene.children[0].children[0].children[0].children[0]
        globe.position.set(1, 1, -3);
        globe.scale.set(0.05, 0.05, 0.05)
        scene.add(globe)

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
            if (child.isMesh) {
                console.log(child.material); // log the material of each mesh

                globeTweaks
                    .add(child.material, 'visible').name(`material id ${child.material.id}`);;
            }
        });
    },
    (progress) => {
        console.log('progress')
        console.log(progress)
    },
    (error) => {
        console.log('error')
        console.log(error)
    },
)

/**
 * Object
 */
let geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let mesh = new THREE.Mesh(geometry, material);
mesh.position.set(-1, 1, -3);

let cubeTweaks = gui.addFolder("Cube")

cubeTweaks
    .add(mesh.position, 'x')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('cube x-pos');

cubeTweaks
    .add(mesh.position, 'y')
    .min(1)
    .max(3)
    .step(0.01)
    .name('cube y-pos');

cubeTweaks
    .add(mesh.position, 'z')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('cube z-pos');

cubeTweaks
    .add(material, 'visible');
    
cubeTweaks
    .add(material, 'wireframe');

// Access the A-Frame object3D property to attach the Three.js mesh
scene.add(mesh);  
