const express = require("express");
//Middleware
const router = express.Router();
const auth = require("../../middleware/auth");
//Models
const User = require("../../models/User");
const List = require("../../models/List");
//Dependencies
const { check, validationResult } = require("express-validator");

// @route   Post api/lists
// @desc    Create a list
// @access  Private
router.post(
  "/",
  [auth, [check("text", "Text is required")]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      newList = new List({
        content: req.body.content,
        title: req.body.title,
        tag: req.body.tag,
        name: user.name,
        user: req.user.id,
      });

      await newList.save();

      console.log("list endpoint");

      res.json("List created");
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/lists
// @desc    Get all lists
// @access  Private
router.get("/", async (req, res) => {
  try {
    //Get lists and sort from new to old
    const lists = await List.find().sort({ date: -1 });
    res.json(lists);
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Server Error");
  }
});

// @route    GET api/lists/:id
// @desc     Get list by ID
// @access   Public
router.get("/:id", async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    res.json(list);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/lists/:id
// @desc     Delete a list
// @access   Private
router.delete("/:id", [auth], async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    // Check user
    if (list.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await list.remove();

    res.json({ msg: "List removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// @route    POST api/lists/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const list = await List.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id,
      };

      list.comments.unshift(newComment);

      await list.save();

      res.json(list.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/lists/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    // Pull out comment
    const comment = list.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    list.comments = list.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await list.save();

    return res.json(list.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
