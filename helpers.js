
//helper functions 

// generates ids for both usernames and new short urls
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6); //.substr(2, length) is how it's used
};
  
//checks if an email is inside the database(true) or not(false)
const idByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
};

//for the header, returns the email of the user that is logged in
//based upon what cookies(session) userid the browser has
const getEmailFunct = function (userid, database) {
  for (let user in database) {
    if (database[user].id === userid) {
      return database[user].email;
    }
  }
};

module.exports = {
  generateRandomString,
  idByEmail,
  getEmailFunct
};