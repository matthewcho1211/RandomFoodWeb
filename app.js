const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const Food = require("./models/food");

const app = express();
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/exampleDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.render("index", { randomFood: null, notification: null });
});

app.post("/add", (req, res) => {
  const foodName = req.body.food;
  const foodType = req.body.foodType;

  const food = new Food({
    name: foodName,
    type: foodType,
  });

  food
    .save()
    .then(() => {
      res.render("index", { randomFood: null, notification: "新增成功" });
    })
    .catch((error) => {
      console.error("Error saving food", error);
      res.render("index", { randomFood: null, notification: "新增失败" });
    });
});

app.get("/foods", (req, res) => {
  let query = {};

  const foodType = req.query.type;
  if (foodType && (foodType === "meal" || foodType === "snack")) {
    query = { type: foodType };
  }

  Food.find(query)
    .then((foods) => {
      res.render("foods", { foods });
    })
    .catch((error) => {
      console.error("Error fetching foods", error);
      res.render("foods", { foods: [] });
    });
});

app.post("/delete/:id", (req, res) => {
  const foodId = req.params.id;

  Food.findByIdAndRemove(foodId)
    .then(() => {
      res.redirect("/foods");
    })
    .catch((error) => {
      console.error("Error deleting food", error);
      res.redirect("/foods");
    });
});

app.get("/random", (req, res) => {
  const foodType = req.query.type;

  let query = {};
  if (foodType && (foodType === "meal" || foodType === "snack")) {
    query = { type: foodType };
  }

  Food.countDocuments(query)
    .then((count) => {
      if (count === 0) {
        res.render("index", { randomFood: null, notification: null });
        return;
      }

      const randomIndex = Math.floor(Math.random() * count);

      Food.findOne(query)
        .skip(randomIndex)
        .then((randomFood) => {
          res.render("index", { randomFood, notification: null });
        })
        .catch((error) => {
          console.error("Error fetching random food", error);
          res.render("index", { randomFood: null, notification: null });
        });
    })
    .catch((error) => {
      console.error("Error counting foods", error);
      res.render("index", { randomFood: null, notification: null });
    });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
