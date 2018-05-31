//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import {CardManager} from "../cardManager"
import { Card } from 'vscode-ipe-types';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
describe("CardManager Tests", function () {
    let cardManager:CardManager;
    beforeEach(function(done) {
        cardManager = new CardManager();
        done();
    });
    // Defines a Mocha unit test
    it("Adding card to cards array works", function() {
        let card = new Card(0,"Hello","source",[],{},'');
        cardManager.addCard(card);
        // To access private member data in unit test
        assert.equal(cardManager["cards"].length,1);  
    });
});