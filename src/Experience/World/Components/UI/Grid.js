import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"
import ConjunctionCard from './ConjunctionCard'
import ManoeuvreCard from './ManoeuvreCard'
import Pages from "./Pages"
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default class Grid {
    constructor(panel, cardType, maxCardsLength, numbCards) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.data = this.experience.data

        // Setup 
        this.panel = panel
        this.cardType = cardType
        this.cardsCreated = 0
        this.maxCardsLength = maxCardsLength
        this.numbCards = numbCards
        this.startIndex = 0
        this.cards = []

        this.setMesh()
        this.setPages()
    }

    setMesh() {
        this.grid = new ThreeMeshUI.Block({
            width: 1.2,
            justifyContent: 'center',
            contentDirection: 'column',
            margin: 0.02,
            backgroundOpacity: 0
        });

        this.panel.add(this.grid)
        this.setCards(this.startIndex)
        // console.log(this.grid.children.length)
        // console.log(this.grid.children)
    }

    setCards(startIndex) {
        let id = 0;
        for (let i = startIndex; i < Math.min(startIndex + this.numbCards, this.maxCardsLength); i++) {
            if (this.cardType === 'manoeuvreCard') {
                this.createCard(this.data.conjunctions[1].manoeuvres[i], id);
            } else {
                this.createCard(this.data.conjunctions[i], id);
            }
            id++;
        }
        this.updateStatus(startIndex)
    }

    setPages() {
        this.pages = new Pages(this.panel, this.maxCardsLength, this.status, this)
    }

    createCard(cardInfo, id) {
        if (this.cardType === 'conjunctionCard') {
            this.card = new ConjunctionCard(this.grid, cardInfo, id)
        } else if (this.cardType === 'manoeuvreCard') {
            this.card = new ManoeuvreCard(this.grid, cardInfo, id)
        }
        this.cards.push(this.card)
        this.cardsCreated++

        // // this.mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
        // if (this.cardsCreated === this.maxCardsLength) {
        //     console.log("All cards created")
        // }
    }

    updateStatus(startIndex) {
        let endIndex = Math.min(startIndex + this.numbCards, this.maxCardsLength);
        this.status = `${startIndex + 1} - ${endIndex} of ${this.maxCardsLength}`;
    }

    previousCards() {
        this.startIndex = Math.max(this.startIndex - this.numbCards, 0);
        this.setCards(this.startIndex);
        // nextButton.disabled = false;
        if (this.startIndex === 0) {
            // prevButton.disabled = true;
            // console.log("prevButton.disabled = true")
        }
    }

    setActiveCard(selectedCard) {
        this.cards.forEach(card => {
            card.setActive(card === selectedCard);
        });
    }

    nextCards() {
        this.startIndex += this.numbCards;
        this.setCards(this.startIndex)
        // prevButton.disabled = false;
        if (this.startIndex + this.numbCards >= this.maxCardsLength) {
            // nextButton.disabled = true;
            // console.log("nextButton.disabled = true")
        }
    }
}