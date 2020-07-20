//DB
const User = require("../../models/User");
//Library Dependencies
const express = require("express");
const router = express.Router(); //Dont forget to export router middleware
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

// @route   GET api/users
// @desc    Get users
// @access  Public
router.get("/", async (req, res) => {
  try {
    const user = await User.find();

    if (!user) {
      return res.status(400).json({ msg: "Profile does not exists" });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Server Error");
  }
});

// @route   GET api/users
// @desc    Get single user
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({ msg: "Profile does not exists" });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Server Error");
  }
});

// @route   GET api/users
// @desc    Get single user
// @access  Public
router.get("/:id/bookmarks/:bookmark_id/:list_id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({ msg: "Profile does not exists" });
    }

    res.json(
      user.bookmarks.find((bookmark) => bookmark.list === req.params.list_id)
    );
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Server Error");
  }
});

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post(
  "/",
  [
    //Express Validator
    check("name", "Name is required").not().notEmpty(),
    check("email", "Please enter a valid email adress").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  //Validator returns a promise thus the async
  async (req, res) => {
    const errors = validationResult(req);
    //if there is an error return the error msgs from validator
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      //Check if the user already exists
      if (user) {
        //Pushing a custom error handler to express validator hence the weird syntax
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      // Get avatar from email using gravata lib
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      //Create new User
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //Encrypt password using Bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //Save user to DB
      await user.save();

      res.send("User Registered");
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    POST api/users/:id/bookmarks/
// @desc     Add a bookmark
// @access   Private
router.post("/:id/bookmarks", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.params.id);

    const newBookmark = {
      list: req.body.list,
    };

    user.bookmarks.unshift(newBookmark);

    await user.save();

    res.json(user.bookmarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/users/:id/bookmarks/:id/:list_id
// @desc     Delete comment
// @access   Private
router.delete("/:id/bookmarks/:bookmark_id/:list_id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.list !== req.params.list_id
    );

    await user.save();

    return res.json(user.bookmarks);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
