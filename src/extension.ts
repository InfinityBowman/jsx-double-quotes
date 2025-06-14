import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('JSX Auto Double Quotes is now active!');

  const configEnabled = vscode.workspace.getConfiguration('jsx-double-quotes.enabled').get('enabled');

  let enabled = typeof configEnabled === 'boolean' ? configEnabled : true;

  const config = vscode.workspace.getConfiguration('jsx-double-quotes');

  const enableCommand = vscode.commands.registerCommand('jsx-double-quotes.enable', () => {
    enabled = true;
    config.update('enabled', true);
  });

  const disableCommand = vscode.commands.registerCommand('jsx-double-quotes.disable', () => {
    enabled = false;
    config.update('enabled', false);
  });

  context.subscriptions.push(enableCommand);
  context.subscriptions.push(disableCommand);

  // idk how to make this work properly
  function isWithinJSX(editor: vscode.TextEditor, position: vscode.Position) {
    const token = editor.document.lineAt(position.line).text;

    const definietlyNotJSX = [
      'const',
      'let',
      'var',
      '{}',
      '[]',
      'import',
      'if',
      'else',
      'switch',
      'case',
      'break',
      'for',
      'while',
      'do',
      'try',
      'catch',
      'finally',
      'throw',
      'new',
      'delete',
      'typeof',
      'instanceof',
      'void',
    ];

    if (definietlyNotJSX.some((word) => token.includes(word))) {
      return false;
    }
    return true;
  }

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (!enabled) {
      return;
    }
    const editor = vscode.window.activeTextEditor;

    const languageId = editor?.document.languageId;

    if (!editor || event.contentChanges.length <= 0 || (languageId !== 'javascriptreact' && languageId !== 'typescriptreact')) {
      return;
    }

    const change = event.contentChanges[0];
    const position = change.range.end;
    const line = editor.document.lineAt(position.line).text;
    const textBeforeCursor = line.slice(0, position.character);

    if (/\s/.test(textBeforeCursor.slice(-1)) || textBeforeCursor.slice(-1) === '=' || !isWithinJSX(editor, position)) {
      return;
    }

    const textAfterCursor = line.slice(position.character);

    // if (textAfterCursor.startsWith("=")) {
    // 	vscode.commands.executeCommand("editor.action.insertSnippet", {
    // 		snippet: '"$1"'
    // 	});
    // }
    if (textAfterCursor.startsWith('=')) {
      // Find the element name
      const elementMatch = textBeforeCursor.match(/<(\w+)[^>]*$/);
      if (elementMatch) {
        const elementName = elementMatch[1];
        // Check if first letter is uppercase
        const isCustomComponent = elementName[0] === elementName[0].toUpperCase();

        // Insert {} for uppercase and "" for lowercase
        vscode.commands.executeCommand('editor.action.insertSnippet', {
          snippet: isCustomComponent ? '{$1}' : '"$1"',
        });
      }
    }
  });
}

export function deactivate() {}
