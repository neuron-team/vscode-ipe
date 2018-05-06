import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services';
import { JSONValue, JSONObject } from '@phosphor/coreutils';
import * as vscode from 'vscode';

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

  // Resolve promise and execute given code
  executeCode(source : string, addNewCard : (output : string) => void){
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
                console.log('The output is stdout:' + content['text']);
                addNewCard(""+content['text']);
              } else if('data' in content){
                console.log(content);
                let data = msg.content.data;

                if(Interpreter.validateData(data, 'text/html')){
                  console.log('Rich output received: ' + data['text/html']);
                  addNewCard(""+data['text/html']);
                }
              }
            }
          );
      }
    ).catch(() => vscode.window.showErrorMessage('Kernel is not available'));
  }

  // Validate Json received
  private static validateData(inputData : JSONValue, field : string): inputData is JSONObject 
  {
    return (<JSONObject>inputData)[field] !== undefined;
  }
}