const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaderBoardSchema = new Schema({
  question: {
    type: String,
    required: true,
    unique: true
  },
  choices: {
    type: Map,
    of: String,
    required: true,
    validate: {
      validator: function (choices) {
        const keys = Array.from(choices.keys());
        return (
          keys.length === 4 &&
          ['a', 'b', 'c', 'd'].every(k => keys.includes(k))
        );
      },
      message: 'Choices must include exactly 4 labeled options: a, b, c, d'
    }
  },
  correctOption: {
    type: String,
    enum: ['a', 'b', 'c', 'd'], // restrict to valid option keys
    required: true
  }
});

module.exports = mongoose.model('questions', questionSchema);
