import {DOM} from "./DOM.js";

export class DecoratorDOM extends DOM {

    parentDOM = undefined
    childDOM = undefined
    childLimit = 0

    type = "decorator"


    /**
     * @param {DOM} dom
     */

    constructor(dom) {
        super()

        if (dom === undefined) {
            return
        }

        this.parentDOM = dom
        dom.children.push(this)
        this.element.appendChild(dom.getDOM())
    }


    /**
     * @returns {DOM}
     */
    getParentDOM() {
        if (this.parentDOM === undefined) {
            return this
        }

        if (this.parentDOM.type === "dom") {
            return this.parentDOM
        }

        return this.parentDOM.getParentDOM()
    }


    /**
     * @param {DOM} dom
     * @returns {DOM}
     */
    setParentDOM(dom) {
        this.parentDOM = dom
        this.element.appendChild(dom.getDOM())

        dom.children.push(this)

        return this
    }
}

export class ResizableDOM extends DecoratorDOM {

    createElement() {
        this.resizerArray = []
        this.element = document.createElement("div")
        this.setStyle("controllers")
        this.createControllers()
        this.setControllersVisibility("hidden")
        this.bindResize()

        document.addSelectListener(this);
    }

    bindResize() {
        const parent = this
        for (let i = 0; i < this.resizerArray.length; i++) {
            const resizer = this.resizerArray[i]
            resizer.addEventListener("mousedown", function (event) {
                document.resizer = resizer
                document.resizing = parent

                parent.orinialPosition = {
                    x: parent.element.getBoundingClientRect().left, y: parent.element.getBoundingClientRect().top
                }

                parent.clickPoint = {
                    x: event.pageX, y: event.pageY
                }

                parent.originalSize = {
                    width: parseFloat(getComputedStyle(parent.element, null).getPropertyValue('width').replace('px', '')),
                    height: parseFloat(getComputedStyle(parent.element, null).getPropertyValue('height').replace('px', ''))
                }
            })

            resizer.addEventListener("mouseup", function (event) {
                document.resizer = undefined
                document.resizing = undefined
            })
        }
    }

    getOverlappingGridBlock() {
        const overlappedBlocksHorizontal = Math.ceil((parseInt(this.element.style.width, 10) - 2) / this.originalSize.width)
        const overlappedBlocksVertical = Math.ceil((parseInt(this.element.style.height, 10) - 8) / this.originalSize.height)
        return {x: overlappedBlocksHorizontal, y: overlappedBlocksVertical}
    }


    selectNotify(element) {
        if (element.getParentDOM() !== this.getParentDOM()) {
            this.setControllersVisibility("hidden")
            return
        }

        this.setControllersVisibility("visible")
    }

    setControllersVisibility(visibility) {
        this.leftTopResizer.setAttribute("style", "visibility: " + visibility + ";")
        this.rightTopResizer.setAttribute("style", "visibility: " + visibility + ";")
        this.leftBotResizer.setAttribute("style", "visibility: " + visibility + ";")
        this.rightBotResizer.setAttribute("style", "visibility: " + visibility + ";")
    }

    createControllers() {
        console.log(this)
        this.leftTopResizer = document.createElement("div");
        this.leftTopResizer.setAttribute("class", "resizer top-left")
        this.resizerArray.push(this.leftTopResizer)

        this.rightTopResizer = document.createElement("div");
        this.rightTopResizer.setAttribute("class", "resizer top-right")
        this.resizerArray.push(this.rightTopResizer)

        this.leftBotResizer = document.createElement("div");
        this.leftBotResizer.setAttribute("class", "resizer bottom-left")
        this.resizerArray.push(this.leftBotResizer)

        this.rightBotResizer = document.createElement("div");
        this.rightBotResizer.setAttribute("class", "resizer bottom-right")
        this.resizerArray.push(this.rightBotResizer)

        for (let i = 0; i < this.resizerArray.length; i++) {
            this.element.appendChild(this.resizerArray[i])
        }

    }
}

export class SelectableDOM extends DecoratorDOM {
    createElement() {
        const parent = this;
        this.element = document.createElement("div");
        this.setStyle("selectable-off")
        this.element.addEventListener("click", function (event) {
            document.select(parent)
        })
    }

    onSelect() {
        this.setStyle("selectable-on")
        this.getRootDOM().parent.setSelect(true)
    }

    onUnselect() {
        this.setStyle("selectable-off")
        this.getRootDOM().parent.setSelect(false)
    }

}

export class DraggableDOM extends DecoratorDOM {

    createElement() {
        this.element = document.createElement("div");
        this.setStyle("draggable")
        this.element.setAttribute("draggable", "true")
        this.bindEvents()
    }

    bindEvents() {
        const parent = this

        this.element.addEventListener("dragstart", function (event) {
            document.dragging = parent
            console.log(event)
        })

        this.element.addEventListener("dragend", function (event) {
            document.dragging = undefined
            parent.attachToLastDragTarget()
        })
    }

    attachToLastDragTarget() {
        if (document.dragTarget === undefined) {
            return;
        }

        document.dragTarget.onDragLeave()
        document.dragTarget.append(this.getRootDOM())
    }
}