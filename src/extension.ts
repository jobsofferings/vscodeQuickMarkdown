import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

  const previousFilePath = context.globalState.get<string>('quickNoteFilePath');

  const openQuickNote = vscode.commands.registerCommand('extension.openQuickNote', async () => {

    let document: vscode.TextDocument;

    if (previousFilePath && fs.existsSync(previousFilePath)) {
      document = await vscode.workspace.openTextDocument(previousFilePath);
    } else {
      // 创建一个新的 markdown 文件路径，并将路径存储到全局状态
      const folderUri = vscode.Uri.file(path.join(context.globalStorageUri.fsPath, 'quick_markdown.md'));

      // 确保存储目录存在
      await vscode.workspace.fs.createDirectory(context.globalStorageUri);

      // 如果文件不存在，创建一个新的文件
      if (!fs.existsSync(folderUri.fsPath)) {
        fs.writeFileSync(folderUri.fsPath, ''); // 创建一个空文件
      }

      document = await vscode.workspace.openTextDocument(folderUri);
      context.globalState.update('quickNoteFilePath', folderUri.fsPath);

      // 保存文件
      await document.save();
    }

    await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);

    // 自动保存
    const autoSaveDisposable = vscode.workspace.onDidChangeTextDocument(async (e) => {
      if (e.document === document) {
        await document.save();
      }
    });

    context.subscriptions.push(autoSaveDisposable);
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

  context.subscriptions.push(openQuickNote);
  context.subscriptions.push(closeQuickNote);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
