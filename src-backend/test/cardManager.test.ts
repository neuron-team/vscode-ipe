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

    it("Move cards up works ", function() {
        let card1 = new Card(0,"Hello","source",[],{},'');
        let card2 = new Card(1,"Hello","source",[],{},'');
        cardManager.addCard(card1);
        cardManager.addCard(card2);
        assert.equal(cardManager["cards"][0],card1);  
        cardManager.moveCardUp(1);
        assert.equal(cardManager["cards"][0],card2);  
    });
    it("Move cards up works even with 1 card ", function() {
        let card1 = new Card(0,"Hello","source",[],{},'');
        cardManager.addCard(card1);
        assert.equal(cardManager["cards"][0],card1);  
        cardManager.moveCardUp(0);
        assert.equal(cardManager["cards"][0],card1);  
    });
    it("Move cards down works", function() {
        let card1 = new Card(0,"Hello","source",[],{},'');
        let card2 = new Card(1,"Hello","source",[],{},'');
        cardManager.addCard(card1);
        cardManager.addCard(card2);
        assert.equal(cardManager["cards"][0],card1);  
        cardManager.moveCardDown(0);
        assert.equal(cardManager["cards"][1],card1);  
    });


});