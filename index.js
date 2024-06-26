const {
  SaveUser,
  SignInUser,
  GetUserContext,
  SaveTransaction,
  GetTransactions,
  UpdateTransaction,
  DeleteTransaction,
  DeleteAllTransactionHistory,
} = require("./IndexFunctions.js");

const express = require("express");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://romaniancryptoinvestmenttracker.vercel.app"],
    exposedHeaders: ['Authorization']
  })
);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = 8080;

app.post("/SaveUser", (req, res) => {
  SaveUser(req, res);
});

app.post("/SignInUser", (req, res) => {
  SignInUser(req, res);
});

app.get("/GetUserContext", (req, res) => {
  GetUserContext(req, res);
});

app.post("/SaveTransaction", (req, res) => {
  SaveTransaction(req, res);
});

app.post("/UpdateTransaction", (req, res) => {
  UpdateTransaction(req, res);
});

app.post("/DeleteTransaction", (req, res) => {
  DeleteTransaction(req, res);
});

app.post("/DeleteAllTransactionHistory", (req, res) => {
  DeleteAllTransactionHistory(req, res);
});

app.get("/GetTransactions", (req, res) => {
  GetTransactions(req, res);
});

app.listen(PORT, () =>
  console.log(`Server is running on: http://localhost:${PORT}`)
);
