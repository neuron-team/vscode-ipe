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

        // Ask info of interpreter
        userInteraction.askJupyterInfo().then(({baseUrl, token}) => {
            // Generate new interpreter instance
            let interpreter = new Interpreter('python3', baseUrl, token);

            // Execute code when new card is created
            userInteraction.onNewCard(({title, source}) => {
                interpreter.executeCode(source,
                    (output => {
                        let newCard = new Card(title);
                        newCard.sourceCode = source;
                        newCard.interpreterOutput = output;
                        webview.addCard(newCard);
                    })
                );
            });
        });

        webview.show();
    });

    
}


export function deactivate() {
}
