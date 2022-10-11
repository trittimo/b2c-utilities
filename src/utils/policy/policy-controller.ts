import * as vscode from "vscode";
import * as fs from "fs";
import * as xmldom from "xmldom";
import * as path from "path";
import * as minimatch from "minimatch";
import { Policy } from "./policy";

export class PolicyController {
    private context: vscode.ExtensionContext;
    _policies: Policy[] | undefined;
    _policyNameToPolicyMap: Map<string, Policy> | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async getPolicies(): Promise<Policy[]> {
        if (this._policies === undefined) {
            this._policyNameToPolicyMap = new Map<string, Policy>();
            let config = vscode.workspace.getConfiguration("paths");
            let includedXmlPaths: string[] = [];
            let excludedXmlPaths: string[] = [];
            if (config) {
                includedXmlPaths = config.get("includedXmlPaths") as string[];
                excludedXmlPaths = config.get("excludedXmlPaths") as string[];
            } else {
                includedXmlPaths = ["**/*.xml"];
                excludedXmlPaths = ["Environments/**"];
            }
            if (includedXmlPaths.length === 0) {
                vscode.window.showErrorMessage("The currently configured B2C Utility settings do not have any included xml paths defined, cannot read policies");
                throw Error("No defined include xml paths");
            }
            
            let policyFilesUnfiltered = await vscode.workspace.findFiles("**/*.xml");
            let policyFiles = policyFilesUnfiltered.filter(policyFile => {
                let relPath = vscode.workspace.asRelativePath(policyFile.path);
                return includedXmlPaths.every(p => minimatch(relPath, p)) && excludedXmlPaths.every(p => !minimatch(relPath, p));
            });

            this._policies = policyFiles.map(f => {
                let relPath = vscode.workspace.asRelativePath(f);
                let policy = new Policy(relPath, f);
                this._policyNameToPolicyMap?.set(policy.name, policy);
                return policy;
            });
        }

        for (let policy of this._policies) {
            if (policy.basePolicyName !== null && this._policyNameToPolicyMap?.has(policy.basePolicyName)) {
                policy.basePolicy = this._policyNameToPolicyMap?.get(policy.basePolicyName);
                if (policy.basePolicy !== undefined) {
                    policy.basePolicy.parentPolicy = policy;
                }
            } else if (policy.basePolicyName !== null) {
                console.error(`Policy ${policy.name} declared a base policy but it could not be found`);
            }
        }

        return this._policies;
    }
}