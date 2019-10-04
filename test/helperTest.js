const { assert } = require('chai');

const { emailCheck } = require('../helper.js');

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
//checks to see if the current user that is attempting to login exsits in the database or not. Should return false since there is no user
describe('emailCheck', function () {
  it('should return a user with valid email', function () {
    const user = emailCheck(testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });
});