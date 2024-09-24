"use strict"
import Experience from "./Experience/Experience";


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