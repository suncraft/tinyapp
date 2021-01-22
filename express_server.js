//config
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
app.set("view engine", "ejs");

//middleware
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [ "bright lights", "shady nights" ],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//helper functions 

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6); //.substr(2, length) 
};
  
const idByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
};

const getEmailFunct = function (userid, database) {
  for (let user in database) {
    if (database[user].id === userid) {
      return database[user].email;
    }
  }
};

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
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { user_id: req.session.user_id, email: email };
  
  res.render("urls_new", templateVars);
});

//register
app.get("/register", (req, res) => {
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { user_id: req.session.user_id, email: email };
  res.render("register", templateVars);
});

// login
app.get("/login", (req, res) => {
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { user_id: req.session.user_id, email: email };
  res.render("login", templateVars);
});

//new short url
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
//login

// console.log(bcrypt.compareSync("this123", hashedPassword));
// console.log(bcrypt.compareSync("this12", hashedPassword));

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
    return res.send('403 Error from last res')
  });

  // setTimeout(res.redirect('/login'), 5000);

// if (users[user].password === req.body.password) 

// //future register from lecture
// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(plaintextpassword, salt, (err, hash) => {
//     console.log(hash);
//   })
// })
// comparing
// bcrypt.compare('12345plaintextpass', hashed, (err, result) => { //true or false
//   console.log(result);
// });
// let username = "newtest";
// const mypass = "this123";
// const hashedPassword = bcrypt.hashSync(mypass, 10);
// console.log(hashedPassword);

// console.log(bcrypt.compareSync("this123", hashedPassword));
// console.log(bcrypt.compareSync("this12", hashedPassword));

// register
app.post('/register', (req, res) => {
  // console.log(req.body);
  if (req.body.email === '' || req.body.password === '') {
    return res.send('400 Error');
  }
  if (idByEmail(req.body.email, urlDatabase) === true) {
    return res.send('400 Error')
  }
  const newID = generateRandomString();
  const newHashedPass = bcrypt.hashSync(req.body.password, 10);

  users[newID] = { id: newID, email: req.body.email, password: newHashedPass }
  console.log(users);
  req.session.user_id = users[newID].id;  //* new *
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  req.session = null; //new
  // res.clearCookie('user_id');
  res.redirect('/urls')
});
//delete short url
app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login')
  }
  console.log(`Deleting: ${urlDatabase[req.params.shortURL]}`); //?
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//edit short url
app.post('/urls/:shortURL/edit', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/urls');
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  console.log(req.body); 

  res.redirect(`/urls`);
});

//index page
app.get("/urls", (req, res) => { //added 1st
  let tempObj = {};
  for (let singleURL in urlDatabase) {
      if (urlDatabase[singleURL]["userID"] === req.session.user_id) {
      tempObj[singleURL] = urlDatabase[singleURL]; 
    }
  }; 
  // console.log(tempObj);
  let urls = tempObj;
  let email = getEmailFunct(req.session.user_id, users);
  const templateVars = { urls: urls, user_id: req.session.user_id, email: email };
  res.render("urls_index", templateVars);
});

//when refering to a short url
app.get("/urls/:shortURL", (req, res) => { // added 2nd
  let email = getEmailFunct(req.session.user_id, users); //do I need???
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.session.user_id, email: email}; 
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





// function filterObj(keys, obj) {
//   const newObj = {};
//   Object.keys(obj).forEach(key => {
//     if (keys.includes(key)) {
//       newObj[key] = obj[key];
//     }
//   });
//   return newObj;
// };



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