import {FileStructure} from "../../../../../objects/FileStructure.js";
import {EFileType} from "../../../../../enums/EFileType.js";
import {CollectionPage} from "../../../collection/CollectionPage.js";

export class CollectionFile extends FileStructure {
    #type = EFileType.COLLECTION

    /**
     * @param {CollectionStructure} collection
     */
    constructor(collection) {
        super();
        this.collection = collection
    }

    getName() {
        return this.collection.getName()
    }

    setName(name) {
        this.collection.setName(name)
    }

    openAction(event) {
        const page = new CollectionPage(this.collection);
        page.openPage();
    }

    getUID() {
        return this.collection.getUID();
    }

    getType() {
        return this.#type;
    }
}