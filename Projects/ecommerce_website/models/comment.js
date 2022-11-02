const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: "product",
    required: true,
  },
  comment: {
    type: String,
    require: true,
  },
  rating: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
