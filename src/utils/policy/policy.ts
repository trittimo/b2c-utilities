import * as vscode from "vscode";
import * as fs from "fs";
import * as xmldom from "xmldom";
import * as path from "path";
import { LocalizedResource, LocalizedString } from "./localized-resource";
import { ContentDefinition } from "./content-definition";

const NS = "http://schemas.microsoft.com/online/cpim/schemas/2013/06";

export class Policy {
    policyPath: string;
    doc: Document;
    _basePolicy: Policy | undefined;
    _parentPolicy: Policy | undefined;
    _basePolicyName: string | undefined | null;
    _name: string | undefined;
    _localizedResources: LocalizedResource[] | undefined;
    _localizedResourceIdToLocalizedResource: Map<string, LocalizedResource> | undefined;
    _contentDefinitions: ContentDefinition[] | undefined;
    _localizedResourceIdToContentDefinitions: Map<string, ContentDefinition[]> | undefined;


    constructor(policyPath: string, uri: vscode.Uri) {
        this.policyPath = policyPath;
        this.doc = new xmldom.DOMParser().parseFromString(fs.readFileSync(uri.fsPath).toString(), "text/xml");
    }

    get basePolicyName(): string | null {
        if (this._basePolicyName === undefined) {
            let elems = this.doc.getElementsByTagNameNS(NS, "PolicyId");
            if (elems.length === 0) {
                this._basePolicyName = null;
            } else {
                this._basePolicyName = elems[0].textContent;
            }
        }
        return this._basePolicyName;
    }

    get basePolicy(): Policy | undefined {
        return this._basePolicy;
    }

    get parentPolicy(): Policy | undefined {
        return this._parentPolicy;
    }

    set basePolicy(policy: Policy | undefined) {
        this._basePolicy = policy;
    }

    set parentPolicy(policy: Policy | undefined) {
        this._parentPolicy = policy;
    }

    get name(): string {
        if (this._name === undefined) {
            let p = this.doc.getElementsByTagNameNS(NS, "TrustFrameworkPolicy");
            if (p.length === 0) {
                throw new Error("The policy is missing a TrustFrameworkPolicy or the document is malformed");
            }
            let name = p[0].getAttribute("PolicyId");
            if (!name) {
                throw new Error("The policy is missing a PolicyId or the document is malformed");
            }
            this._name = name;
        }
        return this._name;
    }

    get contentDefinitions(): ContentDefinition[] {
        if (this._contentDefinitions === undefined) {
            this._contentDefinitions = [];
            let cds = this.doc.getElementsByTagNameNS(NS, "ContentDefinition");
            for (let i = 0; i < cds.length; i++) {
                this._contentDefinitions.push(new ContentDefinition(cds[i]));
            }
        }
        return this._contentDefinitions;
    }

    get localizedResources(): LocalizedResource[] {
        if (this._localizedResources === undefined) {
            this._localizedResources = [];
            let lrs = this.doc.getElementsByTagNameNS(NS, "LocalizedResources");
            for (let i = 0; i < lrs.length; i++) {
                this._localizedResources.push(new LocalizedResource(lrs[i]));
            }
        }
        return this._localizedResources;
    }

    get localizedResourceIdToLocalizedResource(): Map<string, LocalizedResource> {
        if (this._localizedResourceIdToLocalizedResource === undefined) {
            this._localizedResourceIdToLocalizedResource = new Map<string, LocalizedResource>();
            for (let lr of this.localizedResources) {
                this._localizedResourceIdToLocalizedResource.set(lr.id, lr);
            }
        }

        return this._localizedResourceIdToLocalizedResource;
    }

    getContentDefinitionsFromLocalizedResourceId(localizedResourceId: string, searchUp = true, searchDown = true): ContentDefinition[] {
        if (this._localizedResourceIdToContentDefinitions === undefined) {
            this._localizedResourceIdToContentDefinitions = new Map<string, ContentDefinition[]>();
            for (let cd of this.contentDefinitions) {
                for (let lr of cd.localizedResourceReferences.values()) {
                    if (!this._localizedResourceIdToContentDefinitions.has(lr)) {
                        
                    }
                }
            }
        }

        // TODO
        return [];
    }

    /**
     * Searches for the @language version of the given localized string.
     * Will search in this policy directly as well as any parent or base policies
     * @param language The language code
     * @param localizedResource The localized resource containing this localized string
     * @param localizedString The localized string we would like to find the @language version of
     * @param searchUp Search the parent policy for a match
     * @param searchDown Search the child policy for a match
     */
    getUnlocalizedResourceValue(language: string, localizedResource: LocalizedResource, localizedString: LocalizedString, searchUp = true, searchDown = true): LocalizedString | null {
        return null;
    }
}