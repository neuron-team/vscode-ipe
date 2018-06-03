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

function testArrayEqual(a, b){
    assert.equal(a.length, b.length);

    let i: number;
    for (i = 0; i < b.length; i++){
        assert.equal(a[i], b[i]);
    }
}

describe("CardManager Tests", function () {
    let cardManager: CardManager;
    const card0 = new Card(0, "Hello", "source", [], {}, '');
    const card1 = new Card(1, "Hello", "source", [], {}, '');
    const card2 = new Card(2, "Hello", "source", [], {}, '');

    beforeEach(function(done) {
        cardManager = new CardManager();
        done();
    });

    it("Adding card to cards array works - addCard()", function() {
        testArrayEqual(cardManager["cards"], []);

        cardManager.addCard(card0);
        testArrayEqual(cardManager["cards"], [card0]);

        cardManager.addCard(card1);
        testArrayEqual(cardManager["cards"], [card0, card1]);
    });

    it("Move cards up works - moveCardUp() ", function() {
        cardManager["cards"] = [card0, card1];

        // cardManager.moveCardUp(8); //move something not existed -> no change
        // testArrayEqual(cardManager["cards"], [card0, card1]);

        cardManager.moveCardUp(1);
        testArrayEqual(cardManager["cards"], [card1, card0]);
    });

    it("Move cards up works even with 1 card -moveCardUp()", function() {
        cardManager.addCard(card0);
        assert.equal(cardManager["cards"][0], card0);  
        cardManager.moveCardUp(0);
        assert.equal(cardManager["cards"][0], card0);
    });

    it("Move cards down works - moveCardDown()", function() {
        cardManager["cards"] = [card0, card1];
        testArrayEqual(cardManager["cards"], [card0, card1]);

        cardManager.moveCardDown(8); //move something not existed -> no change
        testArrayEqual(cardManager["cards"], [card0, card1]);

        cardManager.moveCardDown(0);
        testArrayEqual(cardManager["cards"], [card1, card0]);  
    });

    it("Move cards down works with one card - moveCardDown()", function() {
        cardManager["cards"] = [card0];
        testArrayEqual(cardManager["cards"], [card0]);

        cardManager.moveCardDown(0);
        testArrayEqual(cardManager["cards"], [card0]); 
    });

    it("Delete card works - deleteCard()", function() {
        cardManager["cards"] = [card0];
        testArrayEqual(cardManager["cards"], [card0]);

        cardManager.deleteCard(8); //delete something not existed -> no change
        testArrayEqual(cardManager["cards"], [card0]);

        cardManager.deleteCard(0); //normal delete
        testArrayEqual(cardManager["cards"], []);
    });

    it("Change title test - changeTitle()", function() {
        cardManager["cards"] = [card0];
        testArrayEqual(cardManager["cards"], [card0]);

        // cardManager.changeTitle(8, "ThisisanewTitle"); //change something not existed -> no change
        // testArrayEqual(cardManager["cards"], [card0]);

        cardManager.changeTitle(0, "ThisisanewTitle");
        assert.equal(cardManager["cards"][0].title, "ThisisanewTitle");
    });

    it("collapseCode()", function() {
        cardManager["cards"] = [card0];
        assert.equal(cardManager["cards"][0].codeCollapsed, true);
        testArrayEqual(cardManager["cards"], [card0]);

        // cardManager.collapseCode(8, false); //change something not existed -> no change
        // testArrayEqual(cardManager["cards"], [card0]);

        cardManager.collapseCode(0, false);
        assert.equal(cardManager["cards"][0].codeCollapsed, false);
    });

    it("collapseOutput()", function() {
        cardManager["cards"] = [card0];
        assert.equal(cardManager["cards"][0].outputCollapsed, false);
        testArrayEqual(cardManager["cards"], [card0]);

        // cardManager.collapseOutput(8, true); //change something not existed -> no change
        // testArrayEqual(cardManager["cards"], [card0]);

        cardManager.collapseOutput(0, true);
        assert.equal(cardManager["cards"][0].outputCollapsed, true);
    });

    it("collapseCard()", function() {
        cardManager["cards"] = [card0];
        assert.equal(cardManager["cards"][0].collapsed, false);
        testArrayEqual(cardManager["cards"], [card0]);

        // cardManager.collapseCard(8, true); //change something not existed -> no change
        // testArrayEqual(cardManager["cards"], [card0]);

        cardManager.collapseCard(0, true);
        assert.equal(cardManager["cards"][0].collapsed, true);
    });

    it("getCardId()", function() {
        cardManager["cards"] = [card0, card1];
        testArrayEqual(cardManager["cards"], [card0, card1]);

        assert.equal(cardManager.getCardId(0), 0);
        assert.equal(cardManager.getCardId(1), 1);
    });

    it("addCustomCard()", function() {
        
    });

    it("editCustomCard()", function() {
        
    });

});
