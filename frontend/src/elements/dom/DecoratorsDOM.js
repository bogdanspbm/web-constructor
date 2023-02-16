import {DOM} from "./DOM.js";

export class DecoratorDOM extends DOM {

    parentDOM = undefined
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

    searchDecorator(type) {
        const startDOM = this.getRootDOM()
        return startDOM.getDecorator(type)
    }

    getDecorator(type) {
        if (this.type === "dom") {
            return undefined
        }

        if (this instanceof type) {
            return this
        }

        const decorator = this.parentDOM

        if (decorator instanceof type || decorator.type === "dom") {
            return decorator
        }

        return decorator.getDecorator(type)
    }

    getResizeDecorator() {
        return this.searchDecorator(ResizableDOM)
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

    attachToLastDragTarget(target) {
        if (target === undefined) {
            target = document.dragTarget
        }

        if (target === undefined) {
            return;
        }

        target.onDragLeave()
        target.append(this.getRootDOM())
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
    gridSize = {x: 1, y: 1}

    createElement() {
        this.resizerArray = []
        this.element = document.createElement("div")
        this.setStyle("controllers")
        this.createControllers()
        this.setControllersVisibility("hidden")
        this.bindResize()

        document.addSelectListener(this);
    }

    setDragEnabled(flag) {
        const draggable = this.searchDecorator(DraggableDOM)
        console.log(draggable)
        if (flag) {
            draggable.element.setAttribute("draggable", "true")
        } else {
            draggable.element.setAttribute("draggable", "false")
        }
    }


    bindResize() {
        const parent = this
        for (let i = 0; i < this.resizerArray.length; i++) {
            const resizer = this.resizerArray[i]
            resizer.addEventListener("mousedown", function (event) {
                parent.setDragEnabled(false)
                const parentGridBlock = parent.getRootDOM().parent
                const gridPosition = parentGridBlock.gridPosition
                document.resizer = resizer
                document.resizing = parent

                const parentWidth = parseFloat(getComputedStyle(parent.parent.element, null).getPropertyValue('width').replace('px', ''))
                const parentHeight = parseFloat(getComputedStyle(parent.parent.element, null).getPropertyValue('height').replace('px', ''))


                parent.originalPosition = {
                    x: gridPosition.y * parentWidth, y: gridPosition.x * parentHeight
                }

                parent.originalBlockSize = {
                    width: parentWidth, height: parentHeight
                }

                parent.clickPoint = {
                    x: event.pageX, y: event.pageY
                }

                parent.originalSize = {
                    width: parent.gridSize.x * parentWidth, height: parent.gridSize.y * parentHeight
                }

                parent.originalGridSize = {
                    x: parent.gridSize.x, y: parent.gridSize.y
                }

                parent.originalGridPosition = {
                    x: gridPosition.x, y: gridPosition.y
                }
            })

            resizer.addEventListener("mouseup", function (event) {
                parent.setDragEnabled(true)
                const success = document.canDrag

                // Clear global data
                document.resizer = undefined
                document.resizing = undefined
                document.canDrag = undefined
                document.grid.clearOverlappedBlocks(undefined, undefined, true)

                if (success) {
                    parent.gridSize = parent.getOverlappingGridBlock()
                } else {
                    parent.gridSize = parent.originalGridSize
                }

                // Set final size
                const parentWidth = parseFloat(getComputedStyle(parent.parent.element, null).getPropertyValue('width').replace('px', ''))
                const parentHeight = parseFloat(getComputedStyle(parent.parent.element, null).getPropertyValue('height').replace('px', ''))
                parent.element.style.width = parent.gridSize.x * parentWidth + "px"
                parent.element.style.height = parent.gridSize.y * parentHeight + "px"

                // Refresh position
                parent.refreshPosition()

                if (!success) {
                    return
                }

                // Attach to new target
                const deltaWidth = parent.element.style.left.replace('px', '')
                const deltaHeight = parent.element.style.top.replace('px', '')
                const newGridPosition = parent.calculateNewGridPosition(deltaWidth, deltaHeight)
                const dragTarget = document.grid.getBlockByPosition(newGridPosition)
                parent.attachToLastDragTarget(dragTarget)
            })
        }
    }

    refreshPosition() {
        this.element.style.left = "0px"
        this.element.style.top = "0px"
    }

    getOverlappingGridBlock() {
        const overlappedBlocksHorizontal = Math.ceil((parseInt(this.element.style.width, 10)) / Math.round(this.originalSize.width / this.gridSize.x))
        const overlappedBlocksVertical = Math.ceil((parseInt(this.element.style.height, 10)) / Math.round(this.originalSize.height / this.gridSize.y))
        return {x: overlappedBlocksHorizontal, y: overlappedBlocksVertical}
    }

    calculateNewGridPosition(deltaWidth, deltaHeight) {
        const gridPosition = {x: this.originalGridPosition.x, y: this.originalGridPosition.y}

        const ratioX = deltaWidth / this.originalBlockSize.width
        const ratioY = deltaHeight / this.originalBlockSize.height

        gridPosition.x = gridPosition.x + Math.floor(ratioX)

        gridPosition.y = gridPosition.y + Math.floor(ratioY)

        return gridPosition
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
        this.getParentDOM().setSelect(true)
        this.getRootDOM().parent.setSelect(true)
    }

    onUnselect() {
        this.setStyle("selectable-off")
        this.getParentDOM().setSelect(false)
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
        })

        this.element.addEventListener("dragend", function (event) {
            const success = document.grid.overlapBlocks(document.dragTarget.gridPosition, document.dragging.getResizeDecorator().gridSize)
            document.dragging = undefined

            if (!success) {
                return
            }
            parent.attachToLastDragTarget()
        })
    }
}