import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services';
import { JSONValue, JSONObject } from '@phosphor/coreutils';

export class Interpreter {

    // serverSettings, used to establish a basic connection with the server
    private serverSettings : ServerConnection.ISettings;

    // Options needed to create a new Kernel
    private options : Kernel.IOptions;

    // List of running kernels
    private runningKernels : Kernel.IModel[] = [];

    // Kernel promise used for code execution
    private kernelPromise : Promise<Kernel.IKernel>;

    constructor(private kernelName : string, private pageUrl : string, private token : string){

        this.serverSettings = ServerConnection.makeSettings({pageUrl : this.pageUrl, token : this.token});
        this.options = {name : this.kernelName, serverSettings : this.serverSettings};
        this.kernelPromise = Kernel.startNew(this.options);

    }

    // Get list of running kernels and maintain the internal list
    getListOfRunning() : void {

        Kernel.listRunning(this.serverSettings).then(
            list => this.runningKernels = list
        );
    }

    connectToKernel(kernelId : Kernel.IModel) : void {
        this.kernelPromise = Kernel.connectTo(kernelId, this.serverSettings);
    }

    // Execute given code and return the result as a string
    executeCode(source : string) : Promise<string> {
        return new Promise((resolve, reject) => {
            this.kernelPromise.then(
                kernel =>
                {
                    // Assign message received event
                    kernel.requestExecute({code : source}).onIOPub =
                        (
                            (msg : KernelMessage.IIOPubMessage) =>
                            {
                                // Get the Json content of the output
                                let content = msg.content;

                                // When the execution is completed extract and interpret the output
                                if ('execution_state' in content){
                                    console.log('Kernel is active, its current state is ' + content['execution_state']);

                                } else if('code' in content){
                                    console.log('The input code is the following ' + content['code']);

                                } else if('name' in content){
                                    resolve(""+content['text']);

                                } else if('data' in content){
                                    console.log(content);
                                    let data = msg.content.data;
                                    if(Interpreter.validateData(data, 'text/html')){
                                        resolve(""+data['text/html']);
                                    }
                                }
                            }
                        );
                }
            ).catch(reason => reject('Python is not available: ' + reason));
        });
    }

    // Validate Json received
    private static validateData(inputData : JSONValue, field : string): inputData is JSONObject
    {
        return (<JSONObject>inputData)[field] !== undefined;
    }
}