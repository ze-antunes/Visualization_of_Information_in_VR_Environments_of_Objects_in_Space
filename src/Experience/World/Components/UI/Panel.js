import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import FontJSON from '../../../../fonts/Roboto-msdf.json'
import FontImage from '../../../../fonts/Roboto-msdf.png'
import Header from './Header'
import Grid from './Grid'
import Views from './Views'
import Pages from './Pages'

export default class Panel {
    constructor(title, cardType, maxCardsLength) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Setup 
        this.title = title
        this.cardType = cardType
        this.maxCardsLength = maxCardsLength

        this.setMesh()
    }

    setMesh() {
        this.mesh = new ThreeMeshUI.Block({
            backgroundColor: new THREE.Color("#121212"),
            justifyContent: 'center',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11,
            backgroundOpacity: 1,
        });

        this.scene.add(this.mesh);
    }

    setHeader() {
        this.header = new Header(this.mesh, this.title, this.cardType)
    }

    setGrid(numbCards) {
        this.grid = new Grid(this.mesh, this.cardType, this.maxCardsLength, numbCards)
    }

    setViews() {
        this.views = new Views(this.mesh)
    }
}