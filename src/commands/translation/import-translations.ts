import * as vscode from "vscode";
import * as fs from "fs";
import * as xmldom from "xmldom";
import * as path from "path";
import { PolicyController } from "../../utils/policy/policy-controller";

export class importTranslationsCommand {
    static async run(context: vscode.ExtensionContext) {
        if (vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders.length == 0) {
            vscode.window.showErrorMessage("You don't have a workspace open. Please open a workspace before attempting to import a translation key.");
            return;
        }
        if (vscode.workspace.workspaceFolders.length > 1) {
            vscode.window.showErrorMessage("You currently have more than one workspace open. Please open a single workspace before attempting to import a translation key.");
            return;
        }

        
    }

    static async importTranslations(context: vscode.ExtensionContext, uri: vscode.Uri) {
        let policyController = new PolicyController(context);
    }
}