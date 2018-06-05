//

import * as assert from 'assert';
import {ContentHelpers} from "../contentHelpers"
import { Card,CardOutput } from 'vscode-ipe-types';
var sinon = require('sinon');
let vscode = require('vscode');

describe("ContentHelper Tests", function () {
 
    // beforeEach(function(done) {
    //     done();
    // });
    // afterEach(function() {

    //   });

    it("Make title from source code", function() {
        let result = ContentHelpers.makeCardTitle("testing");
        assert.equal(result.toString(),"testing");
    });
    it("Make title from source code with function", function() {
        let result = ContentHelpers.makeCardTitle("testing()\n");
        assert.equal(result.toString(),"testing()");
    });
    it("Make title from source code with multiple brackets", function() {
        let result = ContentHelpers.makeCardTitle("testing()()\n");
        assert.equal(result.toString(),"testing()");
    });

    it("Install module calls terminal correctly", function() {
        var mock = sinon.mock(vscode.window);
        ContentHelpers.installMissingModule("help");
        mock.expects("createTerminal").once();
    });

    it("Increment ID works", function() {
        ContentHelpers.id = 0;
        ContentHelpers.assignId();
        assert.equal(ContentHelpers.id,1);
        ContentHelpers.id --;
        assert.equal(ContentHelpers.id,0);
    });

    it("Checking interpret rich function", function() {
        let result = ContentHelpers.interpretRich({'text/plain': "hello"});
        let testObj = new CardOutput("text/plain", "hello");
        assert.equal(result.type,testObj.type);
        assert.equal(result.output,testObj.output);
    });

    it("Checking interpret rich function text/plain", function() {
        let result = ContentHelpers.interpretRich({'text/plain': "hello"});
        let testObj = new CardOutput("text/plain", "hello");
        assert.equal(result.type,testObj.type);
        assert.equal(result.output,testObj.output);
    });

    it("Checking interpret rich function vnd.jupyter", function() {
        let result = ContentHelpers.interpretRich({'application/vnd.jupyter': "test"});
        let testObj = new CardOutput("application/vnd.jupyter", "test");
        assert.equal(result.type,testObj.type);
        assert.equal(result.output,testObj.output);
    });
    it("Checking interpret rich function vnd.jupyter", function() {
        let result = ContentHelpers.interpretRich({'application/vnd.jupyter': "test"});
        let testObj = new CardOutput("application/vnd.jupyter", "test");
        assert.equal(result.type,testObj.type);
        assert.equal(result.output,testObj.output);
    });

    it("Checking interpret rich function image/jepg", function() {
        let result = ContentHelpers.interpretRich({'image/jpeg': "test"});
        let testObj = new CardOutput("image/jpeg", "test");
        assert.equal(result.type,testObj.type);
        assert.equal(result.output,testObj.output);
    });

    it("Checking interpret rich function application/vnd.plotly.v1+json", function() {
        let result = ContentHelpers.interpretRich({'application/vnd.plotly.v1+json': "test"});
        let testObj = new CardOutput("application/vnd.plotly.v1+json", "test");
        assert.equal(result.type,testObj.type);
        assert.equal(result.output,testObj.output);
    });

});