var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var RecordSchema = new Schema({
  // `title` is required and of type String
  deaths: {
    type: Number,
    required: true,
    unique: true,
  },
  // `link` is required and of type String
  duration: {
    type: String,
    required: true
  },
  // players:{
  //   type: Array,
  //   required: true
  // }
});

// This creates our model from the above schema, using mongoose's model method
var Record = mongoose.model("Record", RecordSchema);

// Export the Record model
module.exports = Record;
