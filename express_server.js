const express = require("express");
const bodyParser = require("body-parser");
let cookieParser = require("cookie-parser")
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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
    if (pass === users[user].password) {
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
      password: req.body.password
    };
    res.cookie("user_id", newKey).redirect(`/urls`);
  }
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
      const userObject = users[key];
      if (userObject.email === req.body.email) {
        user = userObject;
      }
    }
  } else {
    res.status(403).send("Uh oh! Your email or password might be wrong!");
  }
  res.cookie("user_id", user.id).redirect(`/urls`);
});

//INDEX
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id], userData: users };
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
  if (templateVars.user !== undefined) {
    res.render("urls_new", templateVars);

  } else if (templateVars.user === undefined) {
    res.status(400).redirect("/login");
  }
});

//ADDING KEYS TO DATA BASE
app.post("/urls", (req, res) => {
  let templateVars = { user: req.cookies["user_id"] };
  let value = req.body.longURL;
  let newKey = generateRandomString();
  urlDatabase[newKey] = { longURL: value, userID: templateVars.user };
  res.status(200).redirect(`urls/${newKey}`);
});

//RENDERS SAID SHORT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  let templateVars = { userData: urlDatabase[shortURL], shortURL: shortURL, longURL: longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

//REDIRECT FOR THE SHORT URL LINK
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//DELETING URLS
app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = { user: req.cookies["user_id"] };

  console.log("user: ", templateVars.user, "dataBase user id : ", urlDatabase[req.params.shortURL].userID);
  if (templateVars.user === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send(">:^( NO");
  }
});

//EDIT URL
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  urlDatabase[shortURL] = longURL;
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