const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const Food = require("./models/food");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

mongoose.connect("mongodb://127.0.0.1:27017/exampleDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post("/foods", async (req, res) => {
  const foodName = req.body.food;
  const foodType = req.body.foodType;

  const food = new Food({
    name: foodName,
    type: foodType,
  });

  try {
    await food.save();
    res.render("index", { randomFood: null, notification: "新增成功" });
  } catch (error) {
    console.log(error);
    res.render("index", { randomFood: null, notification: "新增失敗" });
  }
});

app.get("/foods", async (req, res) => {
  let query = {};

  const foodType = req.query.type;
  if (foodType && (foodType === "meal" || foodType === "snack")) {
    query = { type: foodType };
  }

  try {
    const foods = await Food.find(query);
    res.render("foods", { foods });
  } catch (error) {
    console.log(error);
    res.render("foods", { foods: [] });
  }
});

app.delete("/foods/:id", async (req, res) => {
  const foodId = req.params.id;

  try {
    await Food.findByIdAndRemove(foodId);
    res.redirect("/foods");
  } catch (error) {
    console.log(error);
    res.redirect("/foods");
  }
});

app.put("/foods/:id", async (req, res) => {
  try {
    const foodId = req.params.id;
    const updatedFoodName = req.body.foodName;
    const updatedFoodType = req.body.foodType;

    await Food.findByIdAndUpdate(
      foodId,
      {
        name: updatedFoodName,
        type: updatedFoodType,
      },
      { new: true }
    );

    res.redirect("/foods");
  } catch (error) {
    console.error("Error updating food", error);
    res.redirect("/foods");
  }
});

app.get("/foods/random", async (req, res) => {
  const foodType = req.query.type;

  let query = {};
  if (foodType && (foodType === "meal" || foodType === "snack")) {
    query = { type: foodType };
  }

  try {
    const count = await Food.countDocuments(query);

    if (count === 0) {
      res.render("index", { randomFood: null, notification: null });
      return;
    }

    const randomIndex = Math.floor(Math.random() * count);

    const randomFood = await Food.findOne(query).skip(randomIndex).exec();

    res.render("index", { randomFood, notification: null });
  } catch (error) {
    console.log(error);
    res.render("index", { randomFood: null, notification: null });
  }
});

app.get("/", (req, res) => {
  res.render("index", { randomFood: null, notification: null });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
