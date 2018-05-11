'use strict';

import * as vscode from 'vscode';

import {Card, CardOutput} from 'vscode-ipe-types';
import {WebviewController} from "./webviewController";
import {Interpreter} from "./interpreter";
import {UserInteraction} from "./userInteraction";



export function activate(context: vscode.ExtensionContext) {
    let webview: WebviewController = new WebviewController(context);
    let userInteraction: UserInteraction = new UserInteraction(context);
    let interpreter;

    // Ask info about the interpreter
    function initiateJupyter(){
        userInteraction.askJupyterInfo().then(({ baseUrl, token }) => {
            // Generate new interpreter instance
            interpreter = new Interpreter('python3', baseUrl, token);
        });
    }

    initiateJupyter();

    userInteraction.onShowPane(() => {
        if (interpreter == undefined){
            initiateJupyter();
        }   
        webview.show();
    });

    // Execute code when new card is created
    userInteraction.onNewCard(sourceCode => {
        if (interpreter == undefined){
            initiateJupyter();
        }

        interpreter.executeCode(sourceCode).then(output => {
            let cardTitle = Interpreter.makeCardTitle(sourceCode);
            webview.addCard(new Card(0, cardTitle, sourceCode, [new CardOutput("plaintext", output)]));
        }).catch(reason => vscode.window.showErrorMessage(reason));

        webview.show();
    });
}


export function deactivate() {
}
