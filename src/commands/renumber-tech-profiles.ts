import * as vscode from 'vscode';
import { DOMParser } from 'xmldom';

const _selector = require('xpath').useNamespaces({ "ns": "http://schemas.microsoft.com/online/cpim/schemas/2013/06" });

export class RenumberTechProfiles {

    // Renumber a single policy document (using the editor)
    static run(context: vscode.ExtensionContext) {
        try {
            var editor: vscode.TextEditor = vscode.window.activeTextEditor as vscode.TextEditor;

            if (!editor) {
                vscode.window.showErrorMessage("No document is open");
                return;
            }

            var xmlDoc = new DOMParser().parseFromString(editor.document.getText(), "application/xml");

            editor.edit((editBuilder) => {
                // Renumber UserJourneys
                let userJourneys: number = RenumberTechProfiles.renumberTechPofiles(xmlDoc, editBuilder, "/ns:TrustFrameworkPolicy/ns:UserJourneys/ns:UserJourney");

                // Renumber SubJourneys
                let subJourneys: number = RenumberTechProfiles.renumberTechPofiles(xmlDoc, editBuilder, "/ns:TrustFrameworkPolicy/ns:SubJourneys/ns:SubJourney");

                if (userJourneys === 0 && subJourneys === 0) {
                    vscode.window.showInformationMessage("No user journeys or sub journeys found in this policy.");
                }
                else {
                    vscode.window.showInformationMessage("Successfully renumbered " + userJourneys + " user journeys, and " + subJourneys + " sub journeys.");
                }

            });

        } catch (e: any) {
            vscode.window.showErrorMessage(e.message);
        }
    }



    // Renumber documents' user journeys, or sub journeys
    // Renumber documents' user journeys, or sub journeys
    private static renumberTechPofiles(xmlDoc:Document, editBuilder:vscode.TextEditorEdit, parentElement:String): number {
        let journeys = _selector(parentElement, xmlDoc);

        if (journeys.length === 0) {
            // No journeys or sub journeys found
            return 0;
        }

        let numberOfJourneysRenumbered = 0;

        for (let journey of journeys) {
            let steps = _selector("./ns:OrchestrationSteps/ns:OrchestrationStep", journey);
            if (steps.length === 0) {
                // No steps to renumber
                continue;
            }

            numberOfJourneysRenumbered += 1;

            for (let i = 0; i < steps.length; i++) {
                let claimsExchanges = _selector("./ns:ClaimsExchanges/ns:ClaimsExchange", steps[i]);
                let refIdAttr;
                for (let j = 0; j < claimsExchanges.length; j++) {
                    for (let k = 0; k < claimsExchanges[j].attributes.length; k++) {
                        if (claimsExchanges[j].attributes[k].name == "TechnicalProfileReferenceId") {
                            refIdAttr = claimsExchanges[j].attributes[k];
                            break;
                        }
                    }
                }
                if (!refIdAttr) {
                    vscode.window.showWarningMessage(`ClaimExchange in Step ${i} missing TechnicalProfileReferenceId attribute. Will not be renumbered!`);
                    continue;
                }

                let start = new vscode.Position(refIdAttr.lineNumber - 1, refIdAttr.columnNumber);
                let end = new vscode.Position(refIdAttr.lineNumber - 1, refIdAttr.columnNumber + refIdAttr.nodeValue.length);

                let range = new vscode.Range(start, end);

                let index = 0;
                let dashCount = 0;
                for (let char of refIdAttr.nodeValue) {
                    if (char == "-") {
                        dashCount += 1;
                    }
                    if (dashCount == 2) {
                        break;
                    }
                    index++;
                }

                let stepNum = `${i + 1}`.padStart(3, "0");
                let stepId = refIdAttr.nodeValue.slice(index);
                vscode.window.showWarningMessage(stepId);

                let newString = `Step-${stepNum}${stepId}`;


                editBuilder.replace(range, newString);
            }
        }

        return numberOfJourneysRenumbered;
    }
}
