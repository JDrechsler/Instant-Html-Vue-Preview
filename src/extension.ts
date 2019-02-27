import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('vueComponentPreview.start', () => {
			// Create and show a new webview
			const panel = vscode.window.createWebviewPanel(
				'vueComponent', // Identifies the type of the webview. Used internally
				'Vue Component Preview', // Title of the panel displayed to the user
				vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
				{
                    retainContextWhenHidden:true,
                    enableScripts: false
                } // Webview options. More on these later.
            );

            panel.webview.html = getComponentHTML();

            panel.onDidDispose(
				() => {
					// When the panel is closed, cancel any future updates to the webview content
                    console.log('panel was closed')
				},
				null,
				context.subscriptions
			);
		})
	);
}

function getComponentHTML():string{
    return "";
}