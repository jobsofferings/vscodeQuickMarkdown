import * as vscode from 'vscode';

import { exportNode } from './utils';

export function activate(context: vscode.ExtensionContext) {

  // 除了 extension.openQuickNote，还可以右键点击空白处，出现的菜单中选择 Open Quick Note
  const openQuickNoteMenuItem = vscode.commands.registerCommand('extension.openQuickNoteMenuItem', async () => {
    await exportNode(context);
  });

  const openQuickNote = vscode.commands.registerCommand('extension.openQuickNote', async () => {
    await exportNode(context);
  });

  const closeQuickNote = vscode.commands.registerCommand('extension.closeQuickNote', async () => {
    const previousFilePath = context.globalState.get<string>('quickNoteFilePath');

    if (!previousFilePath) {
      vscode.window.showInformationMessage('No Quick Note file found to close.');
      return;
    }

    const editor = vscode.window.visibleTextEditors.find(
      editor => editor.document.uri.fsPath === previousFilePath
    );

    if (editor) {
      await vscode.window.showTextDocument(editor.document);
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      vscode.window.showInformationMessage('Quick Markdown Note has been closed.');
    } else {
      vscode.window.showInformationMessage('No open editor found for the Quick Note file.');
    }
  });

  context.subscriptions.push(openQuickNoteMenuItem);
  context.subscriptions.push(openQuickNote);
  context.subscriptions.push(closeQuickNote);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
