//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import {ContentHelpers} from "../contentHelpers"
import { Card } from 'vscode-ipe-types';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

describe("ContentHelper Tests", function () {
    beforeEach(function(done) {
        done();
    });
    // Defines a Mocha unit test
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
});