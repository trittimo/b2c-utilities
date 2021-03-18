import * as vscode from 'vscode';

import { RemoveUnusedCodeCommand } from './commands/remove-unused-code';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('b2cutilities.removeUnusedCode', () => RemoveUnusedCodeCommand.run(context));

	context.subscriptions.push(disposable);
}

export function deactivate() {}
