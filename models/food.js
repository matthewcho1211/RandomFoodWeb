const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["meal", "snack"],
    required: true,
  },
});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
