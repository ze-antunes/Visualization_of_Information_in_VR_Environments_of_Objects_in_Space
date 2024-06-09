import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import Experience from "../../../Experience"

export default class ConjunctionCard {
    constructor(grid, cardInfo, id) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources

        // Setup 
        this.grid = grid
        this.cardInfo = cardInfo
        this.id = id
        this.objsToTest = this.experience.raycaster.objsToTest

        this.setTextures()
        this.setCard()
        this.setInfo()
    }

    setTextures() {
        this.textures = {}

        this.textures.conjunctinoStatus = this.resources.items.conjunctionStatusIcon
    }

    setCard() {
        this.card = new ThreeMeshUI.Block({
            width: 1.2,
            height: 0.25,
            justifyContent: 'space-between',
            contentDirection: 'row',
            margin: 0.025,
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 1,
            padding: 0.02,
            borderRadius: 0.06,
        });

        let hoveredStateAttributes = {
            state: 'hovered',
            attributes: {
                offset: 0.035,
                backgroundColor: new THREE.Color("#949494"),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xffffff)
            },
        };

        let idleStateAttributes = {
            state: 'idle',
            attributes: {
                offset: 0.035,
                backgroundColor: new THREE.Color("#505050"),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xffffff),
                borderWidth: 0
            },
        };

        let selectedAttributes = {
            offset: 0.02,
            borderWidth: 0.005,
            borderColor: new THREE.Color("#FFBE0B"),
            backgroundOpacity: 0,
            borderOpacity: 1
        };

        this.card.setupState({
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {
                this.experience.world.conjunctionsMenu.grid.setActiveCard(this)
                // console.log(this.card)
            }
        });
        this.card.setupState(hoveredStateAttributes);
        this.card.setupState(idleStateAttributes);


        this.grid.add(this.card)
        this.objsToTest.push(this.card)
    }

    setInfo() {
        let CardNameNStatus = new ThreeMeshUI.Block({
            width: 0.5,
            height: 0.2,
            justifyContent: 'center',
            contentDirection: 'row',
            margin: 0.025,
            backgroundColor: new THREE.Color("#505050"),
            backgroundOpacity: 0,
            borderWidth: 0
        });

        let CardNameId = new ThreeMeshUI.Block({
            width: 0.3,
            height: 0.25,
            justifyContent: 'center',
            contentDirection: 'row',
            textAlign: 'left',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        CardNameId.add(
            new ThreeMeshUI.Text({ content: this.cardInfo.target.name }),
            // new ThreeMeshUI.Text({ content: this.id.toString() }),
            new ThreeMeshUI.Text({
                content: "\nDummy data",
                fontColor: new THREE.Color("#DEDEDE"),
                fontSize: 0.045
            }),
        );

        let CardStatus = new ThreeMeshUI.Block({
            width: 0.15,
            height: 0.15,
            backgroundColor: new THREE.Color("#DB0000"),
            backgroundOpacity: 1,
            borderWidth: 0
        });

        CardStatus.set({
            backgroundTexture: this.textures.conjunctinoStatus,
        });

        CardNameNStatus.add(CardStatus, CardNameId)

        let CardTCA = new ThreeMeshUI.Block({
            width: 0.45,
            height: 0.25,
            margin: 0.025,
            justifyContent: 'center',
            textAlign: 'right',
            backgroundOpacity: 0,
            borderWidth: 0
        });

        CardTCA.add(
            new ThreeMeshUI.Text({ content: this.setValueTCA(this.cardInfo.summary.tca_latest) }),
            new ThreeMeshUI.Text({
                content: "\nDummy data",
                fontColor: new THREE.Color("#DEDEDE"),
                fontSize: 0.045
            }),
        );

        this.card.add(CardNameNStatus, CardTCA)
    }

    setValueTCA(isoDateString) {
        const date = new Date(isoDateString);

        const options = {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };

        // Extract parts
        const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        // Combine parts into desired format
        const [monthDay, timePart] = formattedDate.split(' ');

        return `${monthDay} ${timePart}, ${time}`;
    }

    setActive(isActive) {
        this.card.active = isActive;
        if (isActive) {
            this.card.setState('selected');
        } else {
            this.card.setState('idle');
        }
    }

    // destroy() {
    //     this.grid.remove(this.card)
    // }

    // destroy() {
    //     console.log(this.mesh)
    //     // Traverse the whole mesh
    //     this.mesh.traverse((child) => {
    //         if (child instanceof ThreeMeshUI.Block) {
    //             // console.log(child)

    //             for (let i = 0; i < child.children.length; i++) {
    //                 // console.log(child.children[i])
    //                 if (child.children[i] instanceof ThreeMeshUI.Text) {
    //                     // child.children[i].geometry.dispose()
    //                     setTimeout(() => {
    //                         console.log(child.children[i].children[0].geometry)
    //                         child.children[i].children[0].geometry.dispose()
    //                         console.log("child.children[i].geometry.dispose()")

    //                         for (let key in child.children[i].children[0].material) {
    //                             let value = child.children[i].children[0].material[key]

    //                             if (value && value.dispose === 'function') {
    //                                 // value.dispose()
    //                                 console.log("value.dispose()")
    //                             }
    //                         }
    //                     }, 1);
    //                 }
    //             }
    //         }
    //     })
    // }
}