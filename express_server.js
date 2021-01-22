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
  if (!req.cookies["user_id"]) {
    return res.redirect('/login');
  }
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
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});
//login
app.post('/login', (req, res) => {
  console.log(req.body);
  if (idByEmail(req.body.email) === false) {
    return res.send('403 Error');
  }
  for (let user in users) {
    if (users[user].email === req.body.email) {
      if (users[user].password === req.body.password) {
        res.cookie("user_id", users[user].id)
        return res.redirect('/urls');
      }
    }
  }
  return res.send('403 Error')

  // setTimeout(res.redirect('/login'), 5000);
});

// register
app.post('/register', (req, res) => {
  // console.log(req.body);
  if (req.body.email === '' || req.body.password === '') {
    return res.send('400 Error');
  }
  if (idByEmail(req.body.email) === true) {
    return res.send('400 Error')
  }
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
  if (!req.cookies["user_id"]) {
    return res.redirect('/login')
  }
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
  // let newObj = {};
  // if (!req.cookies.user_id) {
    
  // }
  // if (req.cookies.user_id) {
  //   // let newObj = {};
  //   for (let shortURL in urlDatabase) {
  //     if (urlDatabase[shortURL].userId === req.cookies.user_id) {
  //       newObj[shortURL] = urlDatabase[shortURL];
  //     }
  //   }
  //   console.log(newObj);;
  // }
  // console.log(newObj);
  // Object.filter = (obj, predicate) => {
  //   Object.keys(obj)
  //         .filter( key => predicate(obj[key]) )
  //         .reduce( (res, key) => (res[key] = obj[key], res), {} ) };

  // var urls = Object.filter(urlDatabase, simpleID => simpleID.UserID === req.cookies.user_id);
  // const urls = Object.fromEntries(Object.entries(urlDatabase).filter(([key, value]) => value === req.cookies["user_id"]))
  // filterObj(req.cookies["user_id"], urlDatabase)
  let tempObj = {};
  for (let single in urlDatabase) {
      if (urlDatabase[single]["userID"] === req.cookies["user_id"]) {
      tempObj[single] = urlDatabase[single]; 
    }
  }; 
  // console.log(tempObj);


  let urls = tempObj;
  let email = getEmailFunct(req.cookies["user_id"]);
  const templateVars = { urls: urls, user_id: req.cookies["user_id"], email: email };
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

let idByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const getEmailFunct = function (userid) {
  for (let user in users) {
    if (users[user].id === userid) {
      return users[user].email;
    }
  }
};

let urlsForUser = (id) => {
  let urlsObj = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId == id) {
      urlsObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlsObj;
};


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