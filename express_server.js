const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
//~~~~~~~~helper functions ~~~~~~~~~~~~~
const { generateRandomString,
  emailCheck,
  passCheck,
  urlDatabase,
  users } = require('./helper');
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 8080;
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["POTATO"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));



//REGISTRATION PAGE
app.get("/registration", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_registration", templateVars);
});

//MAKING NEW USER AND CHECKING IF USERS ARE THE SAME
app.post("/registration", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email or Password is empty!");
  } else if (emailCheck(req.body.email)) {
    res.status(400).send("Email already in use!");
  } else {
    let newKey = generateRandomString();
    users[newKey] = {
      id: newKey,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newKey;
    res.redirect(`/urls`);
  }
});

//COOKIES FROM LOGIN PAGE
app.get("/login", (req, res) => {
  let templateVars = { user: req.session.user_id };
  res.render("urls_login", templateVars);
});

//LOGIN PAGE
app.post("/login", (req, res) => {
  let user = "";
  if (req.body.email === "" || req.body.email === "") {
    res.status(403).send("Email or Password is empty!");
  } else if (emailCheck(req.body.email) === false) {
    res.status(403).send("Email does not exsist");
  } else if (emailCheck(req.body.email) && passCheck(req.body.password)) {
    for (let key of Object.keys(users)) {
      const userObject = users[key];
      if (userObject.email === req.body.email) {
        user = userObject;
      }
    }
  } else {
    res.status(403).send("Uh oh! Your email or password might be wrong!");
  }

  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

//INDEX
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//PAGE FOR MAKING NEW SHORT URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.session.user_id };
  if (templateVars.user !== undefined) {
    res.render("urls_new", templateVars);

  } else if (templateVars.user === undefined) {
    res.status(400).redirect("/login");
  }
});

//ADDING KEYS TO DATA BASE
app.post("/urls", (req, res) => {
  let templateVars = { user: req.session.user_id };
  let value = req.body.longURL;
  let newKey = generateRandomString();
  urlDatabase[newKey] = { longURL: value, userID: templateVars.user };
  res.status(200).redirect(`urls/${newKey}`);
});

//RENDERS SAID SHORT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL].longURL;
    let templateVars = { shortURL: shortURL, longURL: longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Whoopes! You must be logged in to do that!");

  }
});

//REDIRECTS YOU TO THE ORIGIN OF THE URL ON THE SHORT URL PAGE
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//DELETING URLS
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("Whoopes! You must be logged in to do that!");
  }
});

//REDIRECT TO INDEX
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls/");
});


//CLEARS COOKIES WHEN YOU LOGOUT
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
