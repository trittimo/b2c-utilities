const NS = "http://schemas.microsoft.com/online/cpim/schemas/2013/06";

export class ContentDefinition {
    element: Element;
    _id: string | undefined;
    _localizedResourceReferences: Map<string, string> | undefined;

    constructor(element: Element) {
        this.element = element;
    }

    get id(): string {
        if (this._id === undefined) {
            this._id = this.element.getAttribute("Id") || "";
        }
        return this._id;
    }

    get localizedResourceReferences(): Map<string, string> {
        if (this._localizedResourceReferences === undefined) {
            this._localizedResourceReferences = new Map<string, string>();
            let lrs = this.element.getElementsByTagNameNS(NS, "LocalizedResourcesReference");
            for (let i = 0; i < lrs.length; i++) {
                this._localizedResourceReferences.set(lrs[i].getAttribute("Language") || "", lrs[i].getAttribute("LocalizedResourcesReferenceId") || "");
            }
        }

        return this._localizedResourceReferences;
    }
}