const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");


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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
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

app.post("/urls", (req, res) => {
  let value = req.body.longURL;
  let newKey = generateRandomString();
  urlDatabase[newKey] = value;
  console.log(urlDatabase); // seeing if the key value pair is in the urlDatabase.
  res.status(200).redirect(`urls/${newKey}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls/" + req.params.shortURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});