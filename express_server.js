const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// ###### MINE WASN'T WORKING ############
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };


let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" },
  "9sm5xK": { longURL: "http://www.google.com" }
};


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// ###### MINE WASN'T WORKING ############
// ###### Error: TypeError: Cannot read property 'longURL' of undefined
// at app.post (/vagrant/w3/tinyapp/express_server.js:21:39) ############

// app.post('/urls', (req, res) => {
//   // console.log(req.body);  // Log the POST request body to the console
//   let newShortURL = generateRandomString();
//   urlDatabase[newShortURL] = res.body.longURL;
//   res.redirect(`/urls/${newShortURL}`);         // Respond with 'Ok' (we will replace this)
// });

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL
  };
  res.redirect(`/urls/${newShortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL

  res.redirect(`/urls`);
});

app.get("/urls", (req, res) => { //added 1st
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => { // added 2nd
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL }; 
  //I have to use params.shortURL to access the name above ^^
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// app.post('/memes', (req, res) => {
//   // hendle adding the meme
//   // body parser makes the body available in req.body as js object
//   dataHelpers.addMeme(req.body.topText, req.body.bottomText, req.body.image);
//   res.redirect('/memes');
// })

app.get("/", (req, res) => {
  res.send("Hello");
})

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
//  //TESTING CODE: a = 1 is block scoped, won't see it in,
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
//  //THIS ONE: a is undefined.
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
return Math.random().toString(36).substr(2, 6); //.substr(2, length) 
};