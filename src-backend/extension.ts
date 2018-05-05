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
        webview.show();
    });

    userInteraction.onNewCard(({title, source}) => {
        Interpreter.run(source).then(output => {
            let newCard = new Card(title);
            newCard.sourceCode = source;
            newCard.interpreterOutput = output;
            webview.addCard(newCard);
        });
    });
}


export function deactivate() {
}
