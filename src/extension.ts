//TODO add styles
//TODO add chrome css extension to scripts
//TODO add buttons to toggle css extensions, change theme

import * as vscode from 'vscode';

const regVueTemplate = new RegExp('(?<=<template>).*(?=</template>)', 's');
const supportedDocLanguages = ['html', 'vue'];
let currentFile = '';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vueComponentPreview.start', () => {
      startExtension(context);
    })
  );
}

function startExtension(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'vueComponent',
    'Vue Component Preview',
    vscode.ViewColumn.Beside,
    {
      retainContextWhenHidden: true,
      enableScripts: false
    }
  );
  panel.onDidDispose(() => {}, null, context.subscriptions);
  panel.webview.html = getComponentHTML();

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(e => {
      var fileSelected = e.textEditor.document.fileName;
      if (fileSelected !== currentFile) {
        updatePanel();
        currentFile = fileSelected;
      }
    }),

    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.contentChanges.length > 0) {
        if (docLangIsSupported) {
          updatePanel();
        }
      }
    })
  );

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

function getComponentHTML(): string {
  const currentDocText = vscode.window.activeTextEditor.document.getText();
  const docLanguageId = vscode.window.activeTextEditor.document.languageId;

  if (docLanguageId.toLocaleLowerCase() === 'html') {
    return vscode.window.activeTextEditor.document.getText();
  } else if (docLanguageId.toLocaleLowerCase() === 'vue') {
    const vueTemplateMatches = regVueTemplate.exec(currentDocText);
    if (vueTemplateMatches.length > 0) {
      return vueTemplateMatches[0];
    }
  }
  return currentDocText;
}
