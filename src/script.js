"use strict"
import Experience from "./Experience/Experience";

// document.addEventListener('DOMContentLoaded', () => {
//     let rightHand = document.getElementById("rightController")
//     let leftHand = document.getElementById("leftController")

//     // Function to switch to super-hands
//     let enableSuperHands = () => {
//         console.log("enableSuperHands")
//         console.log(usingSuperHands, leftHand, rightHand)
//         leftHand.setAttribute('super-hands', '');
//         rightHand.setAttribute('super-hands', '');
//         leftHand.removeAttribute('oculus-touch-controls');
//         rightHand.removeAttribute('oculus-touch-controls');
//     };

//     // Function to switch to normal Oculus controllers
//     let disableSuperHands = () => {
//         console.log("disableSuperHands")
//         console.log(usingSuperHands, leftHand, rightHand)
//         leftHand.removeAttribute('super-hands');
//         rightHand.removeAttribute('super-hands');
//         leftHand.setAttribute('oculus-touch-controls', 'hand: left');
//         rightHand.setAttribute('oculus-touch-controls', 'hand: right');
//     };

//     let usingSuperHands = false;

//     document.addEventListener("keydown", function (e) {
//         if (e.key === "r") {
//             if (usingSuperHands) {
//                 disableSuperHands()
//             } else {
//                 enableSuperHands()
//             }
//             usingSuperHands = !usingSuperHands;
//         }
//     });

//     // Listen for buttondown event on the left hand controller
//     leftHand.addEventListener('buttondown', (e) => {
//         // console.log('Left hand button down:', e.detail);
//         if (e.detail.id == 5) {
//             if (usingSuperHands) {
//                 disableSuperHands()
//             } else {
//                 enableSuperHands()
//             }
//             usingSuperHands = !usingSuperHands;
//         }
//     });
// });

window.addEventListener("load", function (event) {

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

    let experience = new Experience(aframeScene, scene, aframeCamera, rightHand, leftHand)
});

let stats = false
let scene = document.querySelector('#myScene');

document.addEventListener("keydown", function (e) {
    if (e.key === "e") {
        if (stats == false) {
            // console.log(stats, "add")
            scene.setAttribute("stats", "")
        }
        else {
            // console.log(stats, "remove")
            scene.removeAttribute("stats")
        }
        stats = !stats
    }
});