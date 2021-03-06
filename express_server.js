// ##### config #####
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { generateRandomString, idByEmail, getEmailFunct } = require("./helpers.js");
app.set("view engine", "ejs");

// ##### middleware #####
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [ "bright lights", "shady nights" ],
  maxAge: 24 * 60 * 60 * 1000
}));

// ##### data objects #####
let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$YzA9gKgZovqwHlImFQLK5uzdkCS30Nq64GZfn3fStuRewv4MUzMd6"
  }, //pass = purple, for testing purposes
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$/WruIgXKlREbuTM0QmDzP.EgHPGDls9qhEAtCeTOz.WXUO.KXk3xW"
  } //pass = dishwasher, for testing purposes
};

// ##### GET and POST routes #####

//create new short url's page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { user_id: req.session.user_id, email: email };
  
  res.render("urls_new", templateVars);
});

//new short url post
app.post('/urls', (req, res) => {
  console.log(req.body);
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

//register page
app.get("/register", (req, res) => {
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { user_id: req.session.user_id, email: email };
  res.render("register", templateVars);
});

// login page
app.get("/login", (req, res) => {
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { user_id: req.session.user_id, email: email };
  res.render("login", templateVars);
});

//login post
app.post('/login', (req, res) => {
  console.log(req.body);
  if (idByEmail(req.body.email, users) === false) {
    return res.send('403 Error from function');
  }
  for (let user in users) {
    if (users[user].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session.user_id = users[user].id;
        return res.redirect('/urls');
      }
    }
  }
  return res.send('403 Error from last res');
});

// register post, generate new user object
app.post('/register', (req, res) => {
  // console.log(req.body);
  if (req.body.email === '' || req.body.password === '') {
    return res.send('400 Error');
  }
  if (idByEmail(req.body.email, urlDatabase) === true) {
    return res.send('400 Error');
  }
  const newID = generateRandomString();
  const newHashedPass = bcrypt.hashSync(req.body.password, 10);

  users[newID] = { id: newID, email: req.body.email, password: newHashedPass };
  console.log(users);
  req.session.user_id = users[newID].id;
  res.redirect('/urls');
});

//delete short url
app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.redirect('/urls');
  }
  console.log(`Deleting: ${urlDatabase[req.params.shortURL]}`);
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//edit short url
app.post('/urls/:shortURL/edit', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.redirect('/urls');
  }
  
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  console.log(req.body);

  res.redirect(`/urls`);
});

//when refering to a short url
app.get("/urls/:shortURL", (req, res) => { // added 2nd
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.redirect('/urls');
  }
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.session.user_id, email: email};
  //I have to use params.shortURL to access the name above ^^
  res.render("urls_show", templateVars);
});

//redirecting to the long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//index page
app.get("/urls", (req, res) => { //added 1st
  let tempObj = {};
  for (let singleURL in urlDatabase) {
    if (urlDatabase[singleURL]["userID"] === req.session.user_id) {
      tempObj[singleURL] = urlDatabase[singleURL];
    }
  }
  let urls = tempObj;
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { urls: urls, user_id: req.session.user_id, email: email };
  res.render("urls_index", templateVars);
});

//logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect("urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});