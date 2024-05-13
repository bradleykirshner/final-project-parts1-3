// index.js
var express = require("express");

// import express from 'express'; // for ESM (EcmaScript Module)
// const express = reqire('express'); // for CJS (Common JS Modle)
// as your package type by default it is CJS

// MongoDB findall()

const app = express();
const port = process.env.port || 3000;

let data = [
  { name: "Arjun Tripathi", course: "MCA", roll_no: "14", id: 1 },
  { name: "Rahul Durgapal", course: "MCA", roll_no: "36", id: 2 },
  { name: "Aman Yadav", course: "MCA", roll_no: "08", id: 3 },
];

app.get("/", function (req, res) {
  res.status(200).json(data);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});

app.get("/:id", function (req, res) {
  let found = data.find(function (item) {
    return item.id === parseInt(req.params.id);
  });
  if (found) {
    res.status(200).json(found);
  } else {
    res.sendStatus(404);
  }
});

app.post("/", function (req, res) {
  let items = data.map((item) => item.id);

  let newId = items.length > 0 ? Math.max.apply(Math, items) + 1 : 1;

  let newItem = {
    id: newId,
    name: req.body.name,
    course: req.body.course,
    roll_no: req.body.roll_no,
  };

  data.push(newItem);

  res.status(201).json({
    message: "successfully created",
  });
});
