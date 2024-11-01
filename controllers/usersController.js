// controllers/usersController.js
const usersStorage = require("../storages/usersStorage");
const { body, validationResult } = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";
const emailErr = "is not a valid"
const ageErr = "must be between 18-120 years old"

const validateUser = [
  body("firstName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
  body("lastName").trim()
    .isAlpha().withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`Last name ${lengthErr}`),
  body("email").trim()
    .isEmail().withMessage(`Email ${emailErr}`),
  body("age").trim()
    .isInt({min:18,max:120}).withMessage(`Age ${ageErr}`),
  body("bio").trim()
    .isLength({max:200}).withMessage('Bio must be less than 200')
];




exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user",
        errors: errors.array(),
      });
    }
    const { firstName, lastName,email,age,bio } = req.body;
    usersStorage.addUser({ firstName, lastName,email,age,bio });
    res.redirect("/");
  }
];

exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);
  res.render("updateUser", {
    title: "Update user",
    user: user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user",
        user: user,
        errors: errors.array(),
      });
    }
    const { firstName, lastName } = req.body;
    usersStorage.updateUser(req.params.id, { firstName, lastName });
    res.redirect("/");
  }
];


// Tell the server to delete a matching user, if any. Otherwise, respond with an error.
exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect("/");
};

exports.usersSearchAccount = (req,res)=>{
  // Extract the search query from the request
  const searchQuery = req.query.user;

  // Check if the search query is provided
  if (!searchQuery) {
      return res.render('index', { title: 'Search result', users: [], message: 'Please provide a user name to search.' });
  }

  // Retrieve the user by first name
  const result = usersStorage.getUserByName(searchQuery);

  // Check if a user was found
  if (!result) {
      return res.render('index', { title: 'Search result', users: [], message: 'No user found with that name.' });
  }

  // Render the index page with the search result
  res.render('index', { title: 'Search result', users: [result] }); // Wrap in an array for consistency
}