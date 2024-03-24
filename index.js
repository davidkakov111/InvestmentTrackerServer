const { saveTransaction, getTransactions } = require("./database.js");
const { SignUp } = require("./Auth/SignUp.js");
const { SignIn } = require("./Auth/SignIn.js");
const { createJWT, getJWT } = require("./Auth/JWTToken.js");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const PORT = 8080;

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.post("/SaveUser", (req, res) => {
  async function api() {
    const result = await SignUp(req.body);

    if (result === "Success") {
      const token = createJWT(req.body.email)
      // Set JWT as a cookie
      res.status(200).cookie('JWTToken', token).json({ result: result });
      return
    }

    let statusCode = 200;
    if (result === "Server error") statusCode = 500;
    res.status(statusCode).send({ result: result });
  }
  api();
});

app.post("/SignInUser", (req, res) => {
  async function api() {
    const newUser = req.body
    const result = await SignIn(newUser);

    if (result === "Success") {
      const token = createJWT(newUser.email)
      // Set JWT as a cookie
      res.status(200).cookie('JWTToken', token).json({ result: result });
      return
    }

    let statusCode = 200;
    if (result === "Server error") statusCode = 500;
    res.status(statusCode).send({ result: result });
  }
  api();
});

app.get("/GetUserContext", (req, res) => {
  const result = getJWT(req);
  if (result === 'Unauthorized') {
    res.status(500).send({ result: result });
  } else {
    res.status(200).send({ result: result });
  }
});

app.post("/SaveTransaction", (req, res) => {
  async function api() {
    const result = await saveTransaction(req.body);
    let statusCode = 500;
    if (result === "Success") statusCode = 200;
    res.status(statusCode).send();
  }
  api();
});

app.get("/GetTransactions", (req, res) => {
  async function api() {
    const transactions = await getTransactions();
    let statusCode = 500;
    if (transactions !== "Server error") statusCode = 200;
    res.status(statusCode).json(transactions);
  }
  api();
});

app.listen(PORT, () =>
  console.log(`Server is running on: http://localhost:${PORT}`)
);
