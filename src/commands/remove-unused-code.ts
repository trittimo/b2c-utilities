import * as vscode from 'vscode';
import * as fs from 'fs';
import * as xmldom from 'xmldom';
import { PolicyReferenceMap } from '../util/policy-reference-map';
import * as path from 'path';

const DOM_PARSER = new xmldom.DOMParser();
const RELATIONS_KEY_BLOB_PATH = "tfp-relationships.json";

export class RemoveUnusedCodeCommand {
  static async run(context: vscode.ExtensionContext) {
    const blobPathResolver = (file: string) => vscode.Uri.file(context.asAbsolutePath(path.join("src/blob", file))).fsPath;
    let relationMapping = JSON.parse(fs.readFileSync(blobPathResolver(RELATIONS_KEY_BLOB_PATH), "utf8"));
    let references = new PolicyReferenceMap(relationMapping);
    let files = await vscode.workspace.findFiles("*.xml");
    for (let file of files) {
      let xml = DOM_PARSER.parseFromString(fs.readFileSync(file.fsPath, "utf8"));
      references.process(xml, file);
    }

    let result = await vscode.window.showInformationMessage("Remove unused elements automatically? This will not remove comments/extra whitespace/etc.", "Yes", "No");
    if (result === "Yes") {
      // TODO
    } else {
      RemoveUnusedCodeCommand.saveUnused(references);
    }
  }
  static saveUnused(unused: PolicyReferenceMap) {
    // TODO
  }
}