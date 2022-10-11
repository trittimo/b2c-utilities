const NS = "http://schemas.microsoft.com/online/cpim/schemas/2013/06";

export class LocalizedString {
    element: Element;
    _elementId: string | undefined;
    _stringId: string | undefined;
    _value: string | undefined;
    _elementType: string | undefined;

    constructor(element: Element) {
        this.element = element;
    }

    get elementId(): string {
        if (this._elementId === undefined) {
            this._elementId = this.element.getAttribute("ElementId") || "";
        }
        return this._elementId;
    }

    get stringId(): string {
        if (this._stringId === undefined) {
            this._stringId = this.element.getAttribute("StringId") || "";
        }
        return this._stringId;
    }

    get value(): string {
        if (this._value === undefined) {
            this._value = this.element.textContent || "";
        }
        return this._value;
    }

    get elementType(): string {
        if (this._elementType === undefined) {
            this._elementType = this.element.getAttribute("ElementType") || "";
        }
        return this._elementType;
    }

    asString(): string {
        return `ElementID: '${this.elementId}' ElementType: '${this.elementType}' StringId: '${this.stringId}'`;
    }

}

export class LocalizedResource {
    element: Element;
    _localizedStrings: LocalizedString[] | undefined;
    _localizedStringMap: Map<string, LocalizedString> | undefined;
    _id: string | undefined;

    constructor(element: Element) {
        this.element = element;
    }

    get localizedStrings(): LocalizedString[] {
        if (this._localizedStrings === undefined) {
            this._localizedStrings = [];
            let elems = this.element.getElementsByTagNameNS(NS, "LocalizedString");
            for (let i = 0; i < elems.length; i++) {
                this._localizedStrings.push(new LocalizedString(elems[i]));
            }
        }
        return this._localizedStrings;
    }

    get id(): string {
        if (this._id === undefined) {
            this._id = this.element.getAttribute("Id") || "";
        }
        return this._id;
    }

    getLocalizedStringByIdentifiers(elementId: string, stringId: string, elementType: string): LocalizedString | undefined {
        let uid = elementId + "||" + stringId + "||" + elementType;
        if (this._localizedStringMap === undefined) {
            this._localizedStringMap = new Map<string, LocalizedString>();

            for (let ls of this.localizedStrings) {
                this._localizedStringMap.set(ls.elementId + "||" + ls.stringId + "||" + ls.elementType, ls);
            }
        }

        return this._localizedStringMap.get(uid);
    }
}