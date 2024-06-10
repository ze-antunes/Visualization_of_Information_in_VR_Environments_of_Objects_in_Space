import Experience from "./Experience/Experience";

// Get the A-Frame scene element
let aframeScene = document.querySelector('#myScene');
// console.log(aframeScene);

// Scene
// Access the underlying Three.js scene object
let scene = aframeScene.object3D;
scene.castShadow = true;
scene.shadow = true;


let aframeCamera = document.getElementById("myCamera")
let rightHand = document.getElementById("rightController")
let leftHand = document.getElementById("leftController")

setTimeout(() => {
    let experience = new Experience(aframeScene, scene, aframeCamera, rightHand, leftHand)
}, 100)

// document.addEventListener("keydown", function (e) {
//     if (e.key === "e") {
//     }
// });