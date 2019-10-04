const express = require("express");
const bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = 8080;

app.set("view engine", "ejs");


//MAKE SURE YOU DON'T SAVE PASSWORDS COOKIES!!!!


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
//USERS
const users = {
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
//CALL BACK FOR CHECKING IF USERS ARE THE SAME OR HAVE EMPTY PASSWORDS
let emailCheck = function (email) {
  for (let user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
};

let passCheck = function (pass) {
  for (let user in users) {
    if (bcrypt.hashSync(users[user].password, 10)) {
      return true;
    }
  }
  return false;
};



//REGISTRATION PAGE
app.get("/registration", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_registration", templateVars);
});

//MAKING NEW USER AND CHECKING IF USERS ARE THE SAME
app.post("/registration", (req, res) => {
  if (req.body.email === "" || req.body.email === "") {
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
    res.cookie("user_id", newKey).redirect(`/urls`);
  }
  console.log(users);
});

//COOKIES FROM LOGIN PAGE
app.get("/login", (req, res) => {
  let templateVars = { user: req.cookies["user_id"] };
  res.render("urls_login", templateVars);
});
app.post("/login", (req, res) => {
  let user = "";

  if (req.body.email === "" || req.body.email === "") {
    res.status(403).send("Email or Password is empty!");
  } else if (emailCheck(req.body.email) === false) {
    res.status(403).send("Email does not exsist");
  } else if (emailCheck(req.body.email) && passCheck(req.body.password)) {
    for (let key of Object.keys(users)) {
      console.log("key ", key);
      const userObject = users[key];
      if (userObject.email === req.body.email) {
        user = userObject;

      }
    }
  } else {
    res.status(403).send("Uh oh! Your email or password might be wrong!");
  }
  res.cookie("user_id", user.id)
  res.redirect(`/urls`);
});

//INDEX
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});
//HOME PAGE...?
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//PAGE FOR MAKING NEW SHORT URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

//ADDING KEYS TO DATA BASE
app.post("/urls", (req, res) => {
  let value = req.body.longURL;
  let newKey = generateRandomString();
  urlDatabase[newKey] = value;
  res.status(200).redirect(`urls/${newKey}`);
});

//RENDERS SAID SHORT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//DELETING URLS
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//EDIT URL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls/" + req.params.shortURL);
});



app.get("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");

});


// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//BUTTON _HEADER CODE

// <%if (user) { %>
//   <%= user.email %>
//   <form action="/login" method="POST">
//     <input type="text" name="username" />
//     <input type="submit" value="Logout" />
//   </form>
//   <% } else { %>
//   <form action="/login" method="POST">
//     <input type="text" name="username" />
//     <input type="submit" value="Login" />
//   </form>
//   <% } %>
