// import * as THREE from 'three'
import Experience from "./Experience"

export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.aframeScene = this.experience.aframeScene
        this.camera = this.experience.camera

        this.setInstance()
    }

    setInstance() {
        setTimeout(() => {
            this.renderer = this.aframeScene.renderer
            this.renderer.setClearColor('#000011')
            this.renderer.antialias = true
        }, 100)
    }

    resize() {
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
}