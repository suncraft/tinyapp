const { assert } = require('chai');

const { idByEmail, getEmailFunct } = require("../helpers.js");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getEmailFunct', function() {
  it('should return an email with valid user', function() {
    const expectedInput = getEmailFunct("userRandomID", testUsers);
    const expectedOutput = "user@example.com";
    assert.equal(expectedOutput, expectedInput, "is equal to ");
  });
  it('should return undefined without a valid user', function() {
    const expectedInput = getEmailFunct("notAUser", testUsers);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, expectedInput, " is equal to ");
  });
});

describe('idByEmail', function() {
  it('should return true with a valid email', function() {
    const expectedInput = idByEmail("user2@example.com", testUsers);
    const expectedOutput = true;
    assert.equal(expectedOutput, expectedInput, "true or false");
  });
  it('should return false without a valid email', function() {
    const expectedInput = idByEmail("notValid@email.com", testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, expectedInput, "true or false");
  });
});