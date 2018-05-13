import { spawn, ChildProcess } from 'child_process';
import { URL } from 'url';

export class JupyterManager{
    private static process: ChildProcess;
    private static url: URL;
    private static pattern = /http:\/\/localhost:[0-9]+\/\?token=[a-z0-9]+/g;
    private static timeout = 3000; // timeout set to 3s

    constructor(){
        JupyterManager.process = spawn('jupyter', ['notebook', '--no-browser']);
        JupyterManager.process.stderr.on('data', (data: string) => this.extractJupyterInfos(data));
    }

    extractJupyterInfos(data: string){
        let match = JupyterManager.pattern.exec(data);
        
        if(match !== null){
            JupyterManager.url = new URL(match[0]);
        }
    }

    public getJupyterInfos(){
        return new Promise(function(resolve, reject){
            setTimeout(() => {
                JupyterManager.process.stderr.removeAllListeners();
                if(typeof JupyterManager.url === 'undefined'){
                    reject('Jupyter could not be executed automatically');
                }
                else{
                    resolve(
                        {
                            baseUrl: JupyterManager.url.protocol+'//'+JupyterManager.url.host+'/', 
                            token: JupyterManager.url.searchParams.get('token')
                        });
                }
            }, JupyterManager.timeout);
        });
    }
}