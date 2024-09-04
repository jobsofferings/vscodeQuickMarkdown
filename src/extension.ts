import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.openQuickNote', async () => {
    const previousFilePath = context.globalState.get<string>('quickNoteFilePath');

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
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
