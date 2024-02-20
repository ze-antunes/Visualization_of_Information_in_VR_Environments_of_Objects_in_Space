// import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui'

/**
 * GUI
 */
let gui = new GUI()

// /**
//  * Base
//  */
// // Canvas
// let canvas = document.querySelector('canvas.webgl')

// // Scene
// let scene = new THREE.Scene()


AFRAME.registerComponent('custom-three-js-object', {
    init: function () {
        // Create a Three.js mesh
        let geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
        let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 1, -3);

        gui.add(mesh.position, 'y').min(1).max(3).step(0.01).name('globe y-pos');
        gui.add(material, 'wireframe');

        // Access the A-Frame object3D property to attach the Three.js mesh
        this.el.setObject3D('mesh', mesh);  
    }
});

// /**
//  * Object
//  */
// let geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
// let material = new THREE.MeshBasicMaterial({ color: '#ff0000' })
// let mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)
// // let entity = document.getElementById("globe")
// // let threeObject = entity.getObject3D('mesh')

// // setTimeout(() => {
// //     gui.add(entity.getAttribute('position'), 'y').min(1).max(3).step(0.01).name('globe y-pos')
// // }, 5000)

// /**
//  * Sizes
//  */
// let sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }

// window.addEventListener('resize', () =>
// {
//     // Update sizes
//     sizes.width = window.innerWidth
//     sizes.height = window.innerHeight

//     // Update camera
//     camera.aspect = sizes.width / sizes.height
//     camera.updateProjectionMatrix()

//     // Update renderer
//     renderer.setSize(sizes.width, sizes.height)
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// })

// /**
//  * Camera
//  */
// // Base camera
// let camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.position.x = 1
// camera.position.y = 1
// camera.position.z = 2
// scene.add(camera)

// // Controls
// let controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

// /**
//  * Renderer
//  */
// let renderer = new THREE.WebGLRenderer({
//     canvas: canvas
// })
// renderer.setSize(sizes.width, sizes.height)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// /**
//  * Animate
//  */
// let clock = new THREE.Clock()

// let tick = () =>
// {
//     let elapsedTime = clock.getElapsedTime()

//     // Update controls
//     controls.update()

//     // Render
//     renderer.render(scene, camera)

//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }

// tick()