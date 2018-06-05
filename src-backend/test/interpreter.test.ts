import * as assert from 'assert';
import * as vscode from 'vscode';

import { Card } from 'vscode-ipe-types';
import { Interpreter } from '../interpreter';
// import { ContentHelpers } from '../contentHelpers';
import { JupyterManager } from '../jupyterManager';
import { Kernel } from '@jupyterlab/services';

// describe('Python interpreter tests', function () {
//     this.timeout(10000);
//     let interpreter: Interpreter;
//     let jupyterManager: JupyterManager;

//     before(async function() {
//         // For slow computers to connect to Jupyter
//         //this.timeout(10000);

//         interpreter = new Interpreter();
//         jupyterManager = new JupyterManager();

//         // Should use await when dealing with promises
//         await jupyterManager.getJupyterAddressAndToken()
//             .then(({baseUrl, token}) => {
//                 interpreter.connectToServer(baseUrl, token);
//                 //interpreter.startKernel('python3');
//             })
//             .catch((errorMsg) => console.log(errorMsg));
//     })

//     // Problem: Not shutting down notebook
//     after(function(done) {
//         JupyterManager.disposeNotebook();
//         done();
//     })

//     it('should start python kernel', async function () {
//         await interpreter.startKernel('python3');

//         assert.equal(interpreter['serverSettings'], 'python3');
//     })
// })

describe('Python interpreter tests', function () {
    this.timeout(10000);
    let interpreter: Interpreter;
    let jupyterManager: JupyterManager;

    before(async function () {
        interpreter = new Interpreter();
        jupyterManager = new JupyterManager();

        // Should use await when dealing with promises
        await jupyterManager.getJupyterAddressAndToken()
            .then(({ baseUrl, token }) => {
                interpreter.connectToServer(baseUrl, token);
            })
            .catch((errorMsg) => console.log(errorMsg));
    })

    // Problem: Not shutting down notebook
    after(function(done) {
        JupyterManager.disposeNotebook();
        done();
    })

    // test that ServerConnection.makeSettings make the right interpreter.serverSettings
    it('should make the proper server settings', function () {
        let serverSettings = interpreter['serverSettings'];
        assert.equal(serverSettings.baseUrl.startsWith('http://localhost:'), true);
        assert.equal(serverSettings.wsUrl.startsWith('ws://localhost:'), true);
        assert.equal(serverSettings.baseUrl.replace('http', 'ws'), serverSettings.wsUrl);
    })

    it('should start python kernel', async function() {
        await interpreter.startKernel('python3');
        let kernelPromise = interpreter['kernelPromise'];

        kernelPromise['python3']
            .then(kernel => assert.equal(kernel.isReady, true))
    })
})