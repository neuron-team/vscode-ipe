'use strict';

import * as vscode from 'vscode';

import {Card} from 'vscode-ipe-types';
import {WebviewController} from "./webviewController";
import {Interpreter} from "./interpreter";
import {UserInteraction} from "./userInteraction";



export function activate(context: vscode.ExtensionContext) {
    let webview: WebviewController = new WebviewController(context);
    let userInteraction: UserInteraction = new UserInteraction(context);

    userInteraction.onShowPane(() => {
        // Ask info about the interpreter
        userInteraction.askJupyterInfo().then(({baseUrl, token}) => {
            // Generate new interpreter instance
            let interpreter = new Interpreter('python3', baseUrl, token);

            // Execute code when new card is created
            userInteraction.onNewCard(sourceCode => {
                interpreter.executeCode(sourceCode).then(output => {
                    let newCard = new Card(Interpreter.makeCardTitle(sourceCode));
                    newCard.sourceCode = sourceCode;
                    newCard.interpreterOutput = output;
                    webview.addCard(newCard);
                }).catch(reason => vscode.window.showErrorMessage(reason));
            });
        });

        webview.show();
    });
}


export function deactivate() {
}
