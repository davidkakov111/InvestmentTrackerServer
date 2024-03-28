const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT
});

async function getTransactionsByEmail(email) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM investmenttracker WHERE user_email = $1", [email])
    return res.rows;
  } catch (error) {
    console.error("Error durring query:", error);
    return "Server error";
  } finally {
    client.release();
  }
}

async function saveTransaction(newTransaction) {
  const client = await pool.connect();
  try {
    let sql;
    let values;
    if (newTransaction.operation === 'TRANSFER') {
      sql = "INSERT INTO investmenttracker (operation, user_email, what, frominstrument, toinstrument, fees, amount, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
      values = [
        newTransaction.operation,
        newTransaction.user_email,
        newTransaction.what,
        newTransaction.frominstrument,
        newTransaction.toinstrument,
        newTransaction.fees,
        newTransaction.amount,
        newTransaction.timestamp
      ];
    } else {
      sql = "INSERT INTO investmenttracker (operation, user_email, frominstrument, toinstrument, frominron, toinron, fees, amount, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
      values = [
        newTransaction.operation,
        newTransaction.user_email,
        newTransaction.frominstrument,
        newTransaction.toinstrument,
        newTransaction.frominron,
        newTransaction.toinron,
        newTransaction.fees,
        newTransaction.amount,
        newTransaction.timestamp
      ];
    }
    await client.query(sql, values);
    return "Success";
  } catch (error) {
    console.error(
      "An error occurred while saving the new transaction record: ",
      error
    );
    return "Server error";
  } finally {
    client.release();
  }
}

async function saveUser(newUser) {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)", 
      [newUser.email, newUser.password]
    );
    return "Success";
  } catch (error) {
    // Check if the email already exists 
    if (error.code === "23505") {
      return 'SignIn';
    }
    console.error(
      "An error occurred while saving the new user record: ",
      error
    );
    return "Server error";
  } finally {
    client.release();
  }
}

async function getUserByEmail(email) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length < 1) return 'SignUp';
    return rows;
  } catch (error) {
    console.error(
      "Error during query:",
      error
    );
    return "Server error";
  } finally {
    client.release();
  }
}

async function createInvestmentTrackerTable() {
  const client = await pool.connect();
  try {
    // what field structure: [cryptoName, String(txLink)]
    // fees field structure: [{ instrument: '', amount: '', priceInRON:''}, ...]
    await client.query(`
      CREATE TABLE IF NOT EXISTS investmenttracker (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) REFERENCES users(email),
        operation VARCHAR(10) NOT NULL CHECK (operation IN ('BUY', 'SELL', 'TRANSFER', 'EXCHANGE')),
        what TEXT,
        frominstrument TEXT,
        toinstrument TEXT,
        frominron NUMERIC,
        toinron NUMERIC,
        fees TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        timestamp NUMERIC NOT NULL
      );
    `);
    return "success";
  } catch (error) {
    console.error("Error during table creation:", error);
    return "Server error";
  } finally {
    client.release();
  }
}

async function createUsersTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);
    return "success";
  } catch (error) {
    console.error("Error during table creation:", error);
    return "Server error";
  } finally {
    client.release();
  }
}

module.exports = {
  getTransactionsByEmail,
  saveTransaction,
  saveUser,
  getUserByEmail
};
