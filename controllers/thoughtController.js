const { User, Thought } = require('../models');

module.exports = {
  // Get all thoughts
  getThoughts(req, res) {
    Thought.find()
      .populate('reactions')
      .then((thoughts) => res.json(thoughts))
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },

  // Get a single thought
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .select('-__v')
      .populate('reactions')
      .then(async (thought) =>
        !thought
          ? res.status(404).json({ message: 'No thought with that ID :I' })
          : res.json({
              thought,
            })
      )
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },

  createThought(req, res) {
    Thought.create(req.body)
      .then((thought) => {
        return User.findOneAndUpdate(
          { username: req.body.username },
          { $addToSet: { thoughts: thought._id } },
          { new: true }
        );
      })
      .then((user) =>
        !user
          ? res.status(404).json({
            message: 'Successfully created thought; However, could not find a user with that ID :I',
          })
          : res.json('Created the thought 🎉')
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },

  deleteThought(req, res) {
    Thought.findOneAndRemove({ _id: req.params.thoughtId })
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'Could not find a thought with that ID :I' })
          : User.findOneAndUpdate(
              { thoughts: req.params.thoughtId },
              { $pull: { thoughts: req.params.thoughtId } },
              { new: true }
            )
      )
      .then((user) =>
        !user
          ? res.status(404).json({
              message: 'Successfully deleted thought; However, could not find a user with that ID :I',
            })
          : res.json({ message: 'Thought successfully deleted :I' })
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },



  createReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reaction: req.body } },
      { runValidators: true, new: true }
    )
      .select('-__v')
      .then((thought) =>
        !thought
          ? res
              .status(404)
              .json({ message: 'Could not find thought with that ID :I' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
 
  deleteReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reaction: { reactionId: req.params.reactionId } } },
      { runValidators: true, new: true }
    )
      .then(async (thought) =>
        !thought
          ? res
              .status(404)
              .json({ message: 'Could not find thought with that ID :I' })
          : await res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },

};
