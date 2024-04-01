import * as THREE from 'three';
import GUI from 'lil-gui';
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

window.addEventListener('keydown', (e) => {
    if (e.key == "h")
        gui.show(gui._hidden);
});

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');
// console.log(aframeScene);

// Access the underlying Three.js scene object
let scene = aframeScene.object3D;
scene.castShadow = true;
scene.shadow = true;

// Get the A-Frame camera element
let aframeCamera = document.querySelector('#myCamera');

// Access the underlying Three.js camera object
let cameraComponent = aframeCamera.components;
let camera

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Earth
 */
let earthParameters = {}
earthParameters.atmosphereDayColor = '#00aaff'
earthParameters.atmosphereTwilightColor = '#ff6600'

gui
    .addColor(earthParameters, 'atmosphereDayColor')
    .onChange(() => {
        earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
        atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
    })

gui
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
const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
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
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
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
let sunSpherical = new THREE.Spherical(1, Math.PI * 0.5)
let sunDirection = new THREE.Vector3()

// Debug 
let debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
)

// scene.add(debugSun)

AFRAME.registerComponent('three-js-globe', {
    init: function () {
        let globeEntity = document.querySelector('#globe');
        let globeObject3D = globeEntity.object3D;
        globeObject3D.add(earth, atmosphere, debugSun)
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

console.log(debugSun.position)

// Tweaks 
gui
    .add(sunSpherical, 'phi')
    .min(0)
    .max(Math.PI)
    .onChange(updateSun)
gui
    .add(sunSpherical, 'theta')
    .min(- Math.PI)
    .max(Math.PI)
    .onChange(updateSun)


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
// // pointLightHelper.visible = false
// pointLightCameraHelper.visible = false
// scene.add(pointLightCameraHelper)
// scene.add(pointLight, pointSphereMesh, pointLightHelper);

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

    // // Update camera
    // camera.aspect = sizes.width / sizes.height
    // camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

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

    earth.rotation.y = elapsedTime * 0.1

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()