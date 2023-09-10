const chai = require("chai");
const expect = chai.expect;
const assert = require("assert");

//Importing functions to test
const dateModel = require("../src/models/dateModel");


describe("Tests dateModel : getClosestCollectionDateTime", () => {
    it("should handle null parameters : return null", () => {
        const retValue = dateModel.getClosestCollectionDateTime(null);
        assert.strictEqual(retValue, null, "Value is not null");
    });

    it("should handle boolean parameters : return null", () => {
        const retValue = dateModel.getClosestCollectionDateTime(null);
        assert.strictEqual(retValue, null, "Value is not null");
    });

    it("should handle integer strings : return Date", () => {
        const retValue = dateModel.getClosestCollectionDateTime("1");
        assert.notStrictEqual(retValue, null, "Value is null");
    });

    it("should handle edge case when going over hour : return Date", () => {
      
    });

    it("should handle edge case when going over day : return Date", () => {

    });
});


