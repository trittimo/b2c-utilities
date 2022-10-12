import * as vscode from "vscode";

import { RemoveUnusedCodeCommand } from "./commands/remove-unused-code";
import { ExportTranslationsCommand } from "./commands/translation/export-translations";
import { ImportTranslationsCommand } from "./commands/translation/import-translations";
import { RenumberTechProfiles } from "./commands/renumber-tech-profiles";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("b2cutilities.removeUnusedCode", () => RemoveUnusedCodeCommand.run(context)));
    context.subscriptions.push(vscode.commands.registerCommand("b2cutilities.exportTranslations", () => ExportTranslationsCommand.run(context)));
    context.subscriptions.push(vscode.commands.registerCommand("b2cutilities.importTranslations", () => ImportTranslationsCommand.run(context)));
    context.subscriptions.push(vscode.commands.registerCommand("b2cutilities.renumberTechProfiles", () => RenumberTechProfiles.run(context)));
}

export function deactivate() { }
