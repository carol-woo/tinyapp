const bcrypt = require('bcrypt');

//GENERATES RANDOM NUMBER/LETTER COMBO FOR SHORT URL
let generateRandomString = function () {
  let letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let stringlength = 6;
  let randomstring = '';
  for (let i = 0; i < stringlength; i++) {
    let randomNum = Math.floor(Math.random() * letters.length);
    randomstring += letters.substring(randomNum, randomNum + 1);
  }
  return randomstring;
};

//checks email and sees if they match to the user
let emailCheck = function (email) {
  for (let user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
};

//checks the password and sees if it matches what is being put in.
let passCheck = function (pass) {
  for (let user in users) {
    if (bcrypt.compareSync(pass, users[user].password)) {
      return true;
    }
  }
  return false;
};

//THE SHORTURL AS THE KEY AND LONGURL AS THE VALUE
const urlDatabase = {};

//USERS
const users = {};

module.exports = {
  generateRandomString,
  emailCheck,
  passCheck,
  urlDatabase,
  users
};


