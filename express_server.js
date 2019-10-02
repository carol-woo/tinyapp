const express = require("express");
const bodyParser = require("body-parser");
let cookieParser = require("cookie-parser")
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = 8080;

app.set("view engine", "ejs");

//for generating random keys
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

//The info in here shows up on the url index page.
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//adding keys into our urlDatbase
app.post("/urls", (req, res) => {
  let value = req.body.longURL;
  let newKey = generateRandomString();
  urlDatabase[newKey] = value;
  res.status(200).redirect(`urls/${newKey}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//deleting a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//edits the url
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls/" + req.params.shortURL);
});

//cookies from login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username).redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie("username").redirect("/urls");

});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});