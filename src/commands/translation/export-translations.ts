import * as vscode from "vscode";
import * as fs from "fs";
import * as xmldom from "xmldom";
import * as path from "path";
import * as csv from "csv/sync";
import { PolicyController } from "../../utils/policy/policy-controller";
import { TranslationCommon } from "./translation-common";
import { LocalizedResource } from "../../utils/policy/localized-resource";

export class ExportTranslationsCommand {
    static async run(context: vscode.ExtensionContext) {
        if (vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders.length == 0) {
            vscode.window.showErrorMessage("You don't have a workspace open. Please open a workspace before attempting to export a translation key.");
            return;
        }
        if (vscode.workspace.workspaceFolders.length > 1) {
            vscode.window.showErrorMessage("You currently have more than one workspace open. Please open a single workspace before attempting to export a translation key.");
            return;
        }

        let config = vscode.workspace.getConfiguration("translation");
        if (!config) {
            vscode.window.showErrorMessage("Unable to get configuration for this plugin (this error shouldn't be possible)");
            return;
        }

        let policyMapUriRel = config.get("policyMapUri");
        if (!policyMapUriRel) {
            vscode.window.showErrorMessage("The value you have configured for the translation.policyMapUri is invalid");
            return;
        }

        let translationsUriRel = config.get("translationsUri");
        if (!translationsUriRel) {
            vscode.window.showErrorMessage("The value you have configured for the translation.translationsUri is invalid");
            return;
        }

        let indexLanguage = config.get("indexLanguage");
        if (!indexLanguage) {
            vscode.window.showErrorMessage("The value you have configured for the translation.indexLanguage is invalid");
            return;
        }

        let policyMapUri = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, policyMapUriRel as string);
        let translationsUri = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, translationsUriRel as string);
        
        let policyController = new PolicyController(context);

        let policyCsv = await ExportTranslationsCommand.buildpolicyCsv(policyController, indexLanguage as string);
        // let translationsCsv = ExportTranslationsCommand.buildTranslationsCsv(policyController);

        fs.writeFileSync(policyMapUri, "\ufeff" + csv.stringify(policyCsv), {
            encoding: "utf-8",
        });
    }

    static async buildpolicyCsv(policyController: PolicyController, indexLanguage: string): Promise<Array<Array<string>>> {
        let issues = "";
        let hadIssues = false;
        let policyCsv = new Array<Array<string>>();

        policyCsv.push([
            TranslationCommon.POLICY_URI_HEADER,
            TranslationCommon.LOCALIZED_RESOURCE_ID_HEADER,
            TranslationCommon.ELEMENT_TYPE_HEADER,
            TranslationCommon.ELEMENT_ID_HEADER,
            TranslationCommon.STRING_ID_HEADER,
            TranslationCommon.TRANSLATION_KEY_HEADER
        ]);


        for (let policy of await policyController.getPolicies()) {
            issues += `Processing policy ${policy.name}\n`;
            try {
                let lrReferenceToEnglish = new Map<string, LocalizedResource>();
                let localizedResourceMap = new Map<string, LocalizedResource>();
                for (let localizedResource of policy.localizedResources) {
                    localizedResourceMap.set(localizedResource.id, localizedResource);
                }
                for (let cd of policy.contentDefinitions) {
                    if (!cd.localizedResourceReferences.has(indexLanguage)) {
                        continue;
                    }
                    let refId = cd.localizedResourceReferences.get(indexLanguage) as string;
                    let ref = localizedResourceMap.get(refId) as LocalizedResource;
                    for (let lr of cd.localizedResourceReferences.values()) {
                        lrReferenceToEnglish.set(lr, ref);
                    }
                }
                for (let localizedResource of policy.localizedResources) {
                    issues += `\tProcessing localized resource ${localizedResource.id}\n`;
                    let indexLookup = lrReferenceToEnglish.get(localizedResource.id);
                    if (indexLookup === undefined) {
                        // console.error(`Unable to find ${indexLanguage} version of localized resource ${localizedResource.id}`);
                        issues += `\tUnable to find ${indexLanguage} version of localized resource ${localizedResource.id}\n`;
                        hadIssues = true;
                        continue;
                    }
                    for (let localizedString of localizedResource.localizedStrings) {
                        let indexVersion = indexLookup.getLocalizedStringByIdentifiers(localizedString.elementId, localizedString.stringId, localizedString.elementType);
                        if (indexVersion === undefined) {
                            // console.error(`Unable to find ${indexLanguage} version of localized string ${localizedString.asString()}`);
                            issues += `\t\tUnable to find ${indexLanguage} version of localized string ${localizedString.asString()}\n`;
                            hadIssues = true;
                            continue;
                        }
                        policyCsv.push([
                            policy.policyPath,
                            localizedResource.id,
                            localizedString.elementType,
                            localizedString.elementId,
                            localizedString.stringId,
                            indexVersion.value
                        ]);
                    }
                }
            } catch (e: any) {
                console.log(`Encountered error processing policy: ${e}`);
            }
        }

        if (hadIssues) {
            if (vscode.workspace.workspaceFolders !== undefined && vscode.workspace.workspaceFolders.length > 0) {
                let p = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "buildPolicyCsvIssues.log");
                fs.writeFileSync(p, issues);
            }
        }

        return policyCsv;
    }
    
    
    static async buildTranslationsCsv(policyController: PolicyController): Promise<Array<Map<string, string>>> {
        throw new Error("Function not implemented.");
    }
    
}