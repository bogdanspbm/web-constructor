import {PopupElement, PopupMenu} from "../Popup.js";
import {EFile} from "../../enums/EFile.js";
import {WidgetFile} from "../../pages/implementation/filesystem/file/implementations/WidgetFile.js";
import {EditorPageStructure} from "../../objects/EditorPageStructure.js";
import {DirectoryFile} from "../../pages/implementation/filesystem/file/implementations/DirectoryFile.js";
import {CollectionFile} from "../../pages/implementation/filesystem/file/implementations/CollectionFile.js";

export class FilePopup extends PopupMenu {
    constructor(args) {
        super(args);

        const createWidget = new FilePopupElement(EFile.WIDGET);
        this.append(createWidget);

        const createCollection = new FilePopupElement(EFile.COLLECTION);
        this.append(createCollection);

        const createFolder = new FilePopupElement(EFile.DIRECTORY);
        this.append(createFolder);

        const createScript = new FilePopupElement(EFile.SCRIPT);
        this.append(createScript);

        const createVector = new FilePopupElement(EFile.VECTOR);
        this.append(createVector);
    }
}

class FilePopupElement extends PopupElement {
    /**
     * @param {EFile} fileType
     */
    constructor(fileType) {
        super("Create " + fileType['name']);

        this.setClickEvent(action => {
            console.log("element")
            document.addFile(createFileFromType(fileType))
        })
    }
}

/**
 * @param {EFile} fileType
 * @returns {FileStructure}
 */
function createFileFromType(fileType) {
    switch (fileType) {
        case EFile.WIDGET: {
            return new WidgetFile(new EditorPageStructure());
        }
        case EFile.DIRECTORY: {
            return new DirectoryFile();
        }
        case EFile.COLLECTION: {
            return new CollectionFile();
        }

    }
}