import {Div, Grid} from "../elements/dom/DOM.js";
import {Toolbar} from "../widgets/toolbar/Toolbar.js";
import {CanvasComponent} from "../canvas/objects/canvas/Canvas.js";

export class App {
    constructor() {
        this.root = document.getElementById("root");
        this.generateConstructor();
        this.bindGlobalFunctions()
        //this.createCanvasComponent();
    }

    createCanvasComponent() {
        document.canvas = new CanvasComponent();
    }

    bindGlobalFunctions() {
        document.select = function (item) {
            if (document.selected !== undefined) {
                document.selected.setSelect(false)
            }
            item.setSelect(true)
            document.selected = item
        }
    }


    generateConstructor() {
        this.header = new Div().setStyle("header").setText("Constructor").getDOM();
        this.root.append(this.header);

        document.toolbar = new Toolbar()
        document.grid = new Grid().setStyle("grid").setID("canvas")

        this.panel = new Div([document.toolbar, document.grid])
            .setStyle("container");
        this.root.append(this.panel.getDOM());
    }
}
