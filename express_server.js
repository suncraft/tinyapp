//config
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");

//middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

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
}

//routes

app.get("/urls/new", (req, res) => {
  let email = getEmailFunct(req.cookies["user_id"]);
  const templateVars = { user_id: req.cookies["user_id"], email: email };
  res.render("urls_new", templateVars);
});

//register
app.get("/register", (req, res) => {
  let email = getEmailFunct(req.cookies["user_id"]);
  const templateVars = { user_id: req.cookies["user_id"], email: email };
  res.render("register", templateVars);
});

// login
app.get("/login", (req, res) => {
  let email = getEmailFunct(req.cookies["user_id"]);
  const templateVars = { user_id: req.cookies["user_id"], email: email };
  res.render("login", templateVars);
});

//new short url
app.post('/urls', (req, res) => {
    console.log(req.body); 
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL
  };
  res.redirect(`/urls/${newShortURL}`);
});
//login
app.post('/login', (req, res) => {
  console.log(req.body);
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

// register
app.post('/register', (req, res) => {
  // console.log(req.body);
  const newID = generateRandomString();
  users[newID] = { id: newID, email: req.body.email, password: req.body.password }
  console.log(users);
  res.cookie("user_id", users[newID].id)
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});
//delete short url
app.post('/urls/:shortURL/delete', (req, res) => {
  console.log(`Deleting: ${urlDatabase[req.params.shortURL]}`); //?
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//edit short url
app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  console.log(req.body); 

  res.redirect(`/urls`);
});
//index page
app.get("/urls", (req, res) => { //added 1st
  let email = getEmailFunct(req.cookies["user_id"]);
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"], email: email };
  res.render("urls_index", templateVars);
});
//when refering to a short url
app.get("/urls/:shortURL", (req, res) => { // added 2nd
  let email = getEmailFunct(req.cookies["user_id"]); //do I need???
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.cookies["user_id"], email: email}; 
  //I have to use params.shortURL to access the name above ^^
  res.render("urls_show", templateVars);
});
//redirecting to the endpoint long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello");
})

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

function generateRandomString() {
return Math.random().toString(36).substr(2, 6); //.substr(2, length) 
};

// let idByEmail = (users, email) => {
//   for (let user in users) {
//     console.log(user);
//     if (users[user].email === email) {
//       return true;
//     }
//   }
//   return false;
// };

const getEmailFunct = function (userid) {
  for (let user in users) {
    if (users[user].id === userid) {
      return users[user].email;
    }
  }
};


// //future register from lecture
// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(plaintextpassword, salt, (err, hash) => {
//     console.log(hash);
//   })
// })
//comparing
// bcrypt.compare('12345plaintextpass', hashed, (err, result) => { //true or false
//   console.log(result);
// });