import { spawn, ChildProcess, execSync, exec } from 'child_process';
import { URL } from 'url';
import * as vscode from 'vscode';

export class JupyterManager {
    private static process: ChildProcess;
    private static url: URL;
    private static urlPattern = /http:\/\/localhost:[0-9]+\/\?token=[a-z0-9]+/g;
    private static timeout = 10; // 10 seconds
    public workspaceSet = false;

    constructor() {
        if(vscode.workspace.workspaceFolders) {
            JupyterManager.process = spawn('jupyter', ['notebook', '--no-browser', '--notebook-dir=' + vscode.workspace.workspaceFolders[0].uri.fsPath], {detached: false});
            this.workspaceSet = true;
        }
        else {
            JupyterManager.process = spawn('jupyter', ['notebook', '--no-browser'], {detached: false});
        }
        JupyterManager.process.stderr.on('data', (data: string) => this.extractJupyterInfos(data));
    }

    public static disposeNotebook() {
        if(JupyterManager.process){
            for(let i=0; i<=10 && !JupyterManager.process.killed; i++){
                JupyterManager.process.kill('SIGINT')
            }
        }
    }

    private extractJupyterInfos(data: string) {
        let urlMatch = JupyterManager.urlPattern.exec(data);
        
        if(urlMatch){
            JupyterManager.url = new URL(urlMatch[0]);
        }
    }

    private defineTimeout(numTries: number, resolve, reject) {
        setTimeout(() => {
            if(!JupyterManager.url){
                if(numTries == 0){
                    JupyterManager.process.stderr.removeAllListeners();
                    reject('Jupyter could not be executed automatically');
                }
                else{
                    this.defineTimeout(numTries-1, resolve, reject);
                }
            }
            else{
                JupyterManager.process.stderr.removeAllListeners();
                resolve(
                    {
                        baseUrl: JupyterManager.url.protocol+'//'+JupyterManager.url.host+'/', 
                        token: JupyterManager.url.searchParams.get('token')
                    });
            }
        }, 1000);
    }

    public getJupyterAddressAndToken() {
        return new Promise<{ baseUrl: string, token: string}>((resolve, reject) => {
            this.defineTimeout(JupyterManager.timeout, resolve, reject);
        });
    }

    public static getRunningNotebooks() {
        try{
            let runningUrls = 
                execSync(
                    'jupyter notebook list',  
                    { stdio: 'pipe', encoding: 'utf8'}
                );

            let matches = runningUrls.match(JupyterManager.urlPattern);
            
            if(!matches){
                return [];
            }
            else{
                return matches.map(input => {
                    let url = new URL(input);
                    return {
                        url: input, 
                        info: 
                            {
                                baseUrl: url.protocol+'//'+url.host+'/', 
                                token: url.searchParams.get('token')
                            }
                    };
                });
            }
        }
        catch{
            return [];
        }
    }

    public static isJupyterInPath() {
        try{
            let jupyterHelpOutput = 
                execSync(
                    'jupyter -h',
                    { stdio: 'pipe', encoding: 'utf8'}
                );

            return !!jupyterHelpOutput.match(/Jupyter/g);
        }
        catch{
            return false;
        }
    }

    public static installJupyter(data) {
        if (data !== undefined) {
            let terminal = vscode.window.createTerminal('pip');
            terminal.show();
            terminal.sendText('pip install jupyter', true);
        }
    }
}
