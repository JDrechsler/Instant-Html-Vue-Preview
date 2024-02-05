import path = require('path');
import * as vscode from 'vscode';
import fs = require('fs');

const regVueTemplate = new RegExp('(?<=<template>).*(?=</template>)', 's');
const regVueStyle = new RegExp(
  '(?<=<style scoped>|<style>).*(?=</style>)',
  's'
);

const supportedDocLanguages = ['html', 'vue'];

const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Page Title</title>
    *baseHref*
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>*tailwindConfig*</script>
  </head>
  <body>
    *body*
  </body>
  </html>
`;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('instantHtmlVueComponentPreview.start', () => {
      startExtension(context);
    })
  );
}

function startExtension(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'instantHtmlVueComponent',
    'Instant Html / Vue Preview',
    vscode.ViewColumn.Beside,
    {
      retainContextWhenHidden: true,
      enableScripts: true
    },    
  );
  const workspaceFolderPath = vscode.workspace.workspaceFolders[0];
  const tailwindConfigPath = path.join(workspaceFolderPath.uri.fsPath, 'tailwind.config.js');
  const mediaPath = vscode.Uri.file(path.join(workspaceFolderPath.uri.fsPath, '')).with({
    scheme: "vscode-resource"
  }).toString() + '/';
  panel.onDidDispose(() => {}, null, context.subscriptions);
  panel.webview.html = getComponentHTML();

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(e => {
      updatePanel();
    }),

    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.contentChanges.length > 0) {
        if (docLangIsSupported) {
          updatePanel();
        }
      }
    })
  );

  function getComponentHTML(): string {
    const currentDocText = vscode.window.activeTextEditor.document.getText();
    const docLanguageId = vscode.window.activeTextEditor.document.languageId;
  
    if (docLanguageId.toLocaleLowerCase() === 'html') {
      let html = htmlTemplate
        .replace('*baseHref*', `<base href="${mediaPath}">`)
        .replace('*body*', currentDocText);

      // Check if tailwind.config.js exists
      if (fs.existsSync(tailwindConfigPath)) {
        const tailwindConfigString = fs.readFileSync(tailwindConfigPath, 'utf8')
          .replace('export default', 'tailwind.config =');
        html = html.replace('*tailwindConfig*', tailwindConfigString);
      } else {
        html = html.replace('<script>*tailwindConfig*</script>', '');
      }
      
      return html;
    } else if (docLanguageId.toLocaleLowerCase() === 'vue') {
      let htmlPart = 'I did not understand this html.';
      let cssPart = 'I did not understand this css.';
  
      const vueTemplateMatches = regVueTemplate.exec(currentDocText);
      if (vueTemplateMatches.length > 0) {
        htmlPart = vueTemplateMatches[0];
      }
      const vueStyleMatches = regVueStyle.exec(currentDocText);
      if (vueStyleMatches.length > 0) {
        cssPart = vueStyleMatches[0];
        let htmlCssCombined = htmlTemplate
          .replace('*styles*', cssPart)
          .replace('*body*', htmlPart);
        return htmlCssCombined;
      } else {
        return htmlPart;
      }
    }
    return currentDocText;
  }

  function updatePanel() {
    if (docLangIsSupported) {
      panel.webview.html = getComponentHTML();
    }
  }
}

function docLangIsSupported(): boolean {
  const currDocLang = vscode.window.activeTextEditor.document.languageId;
  const docLangIsSupported = supportedDocLanguages.includes(currDocLang);
  return docLangIsSupported;
}


