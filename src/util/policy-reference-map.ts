import * as xmldom from 'xmldom';
import * as vscode from 'vscode';
import * as xpath from 'xpath';

const _selector = xpath.useNamespaces({"ns": "http://schemas.microsoft.com/online/cpim/schemas/2013/06"});

export class PolicyReferenceMap {
  relationMapping: any;

  constructor(relationMapping: any) {
    this.relationMapping = relationMapping;
  }

  process(xml: Document, file: vscode.Uri) {
    for (let key in this.relationMapping) {
      for (let keyNode of _selector(key, xml)) {
        for (let referenceKey of this.relationMapping[key]) {
          for (let referenceNode of _selector(referenceKey, xml)) {

          }
        }
      }
    }
  }
}