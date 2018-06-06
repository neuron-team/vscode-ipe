import * as assert from 'assert';
import * as vscode from 'vscode';

import { Card } from 'vscode-ipe-types';
import { Interpreter } from '../interpreter';
import { JupyterManager } from '../jupyterManager';
import { Kernel } from '@jupyterlab/services';

// Requires JupyterManager to work properly
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
    })

    // Problem: Not shutting down notebook
    after(function(done) {
        JupyterManager.disposeNotebook();
        done();
    })

    it('should make the proper server settings', function () {
        let serverSettings = interpreter['serverSettings'];
        assert.equal(serverSettings.baseUrl.startsWith('http://localhost:'), true);
        assert.equal(serverSettings.wsUrl.startsWith('ws://localhost:'), true);
        assert.equal(serverSettings.baseUrl.replace('http', 'ws'), serverSettings.wsUrl);
    })

    it('should start python kernel', async function() {
        await interpreter.startKernel('python3');
        const kernelPromise = interpreter['kernelPromise']['python3'];
        
        // Beware of evergreen tests when working with promises
        const kernelResult = await kernelPromise;
        // console.log(kernelResult);

        assert.equal(kernelResult.isReady, true);
    })

    it('should restart python kernel', async function() {
        await interpreter.startKernel('python3');
        const oriPromise = interpreter['kernelPromise']['python3'];
        const oriResult = await oriPromise;

        assert.equal(oriResult.isReady, true); // Original kernel is working

        await interpreter.restartKernels();
        const newPromise = interpreter['kernelPromise']['python3'];
        const newResult = await newPromise;

        assert.equal(oriResult.isReady, false); // Original kernel is no longer working
        assert.equal(newResult.isReady, true); // New kernel is working
        assert.notEqual(oriResult.id, newResult.id);
    })
})