const { saveTransaction, getTransactionsByEmail, updateTransaction, deleteTransaction } = require("./database.js");
const { SignUp } = require("./Auth/SignUp.js");
const { SignIn } = require("./Auth/SignIn.js");
const { createJWT, getJWT } = require("./Auth/JWTToken.js");

async function SaveUser(req, res) {
  const result = await SignUp(req.body);
  if (result === "Success") {
    const token = createJWT(req.body.email)
    res.set('Authorization', token).status(200).json({ result: result });
    return
  }

  let statusCode = 200;
  if (result === "Server error") statusCode = 500;
  res.status(statusCode).send({ result: result });
}

async function SignInUser(req, res) {
  const newUser = req.body
  const result = await SignIn(newUser);
  if (result === "Success") {
    const token = createJWT(newUser.email)
    res.set('authorization', token).status(200).json({ result: result });
    return
  }
  let statusCode = 200;
  if (result === "Server error") statusCode = 500;
  res.status(statusCode).send({ result: result });
}

function GetUserContext(req, res) {
  const result = getJWT(req);
  if (result === 'Unauthorized') {
    res.status(401).send({ result: result });
  } else {
    res.status(200).send({ result: result });
  }
}

async function SaveTransaction(req, res) {
  const email = getJWT(req);
  if (email === 'Unauthorized') {
    res.status(401).send();
  } else {
    const result = await saveTransaction({...req.body, user_email: email});
    let statusCode = 500;
    if (result === "Success") statusCode = 200;
    res.status(statusCode).send();
  }
}

async function UpdateTransaction(req, res) {
  const email = getJWT(req);
  if (email === 'Unauthorized') {
    res.status(401).send();
  } else {
    const result = await updateTransaction(req.body, email);
    let statusCode = 500;
    if (result === "Success") statusCode = 200;
    if (result === "Unauthorized") statusCode = 401;
    res.status(statusCode).send();
  }
}

async function DeleteTransaction(req, res) {
  const email = getJWT(req);
  if (email === 'Unauthorized') {
    res.status(401).send();
  } else {
    const result = await deleteTransaction(req.body.id, email);
    let statusCode = 500;
    if (result === "Success") statusCode = 200;
    if (result === "Unauthorized") statusCode = 401;
    res.status(statusCode).send();
  }
}

async function GetTransactions(req, res) {
  const result = getJWT(req);
  let transactions;
  let statusCode = 500;
  if (result === 'Unauthorized') {
    transactions = result
    statusCode = 401
  } else {
    transactions = await getTransactionsByEmail(result);
    if (transactions !== "Server error") statusCode = 200;
  }
  res.status(statusCode).json(transactions);
}

module.exports = {
  SaveUser,
  SignInUser,
  GetUserContext,
  SaveTransaction,
  GetTransactions,
  UpdateTransaction,
  DeleteTransaction,
};
