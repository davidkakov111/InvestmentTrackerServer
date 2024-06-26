const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  ssl: true
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

async function updateTransaction(updatedTransaction, email) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT user_email FROM investmenttracker WHERE id = $1", [updatedTransaction.id]);
    if (res.rows[0].user_email === email) {
      await client.query(`UPDATE investmenttracker SET operation = $1, what = $2, 
        frominstrument = $3, toinstrument = $4, fees = $5, amount = $6, timestamp = $7, 
        frominron = $8, toinron = $9 WHERE id = $10`, 
        [
          updatedTransaction.operation,
          updatedTransaction.what,
          updatedTransaction.frominstrument,
          updatedTransaction.toinstrument,
          updatedTransaction.fees,
          updatedTransaction.amount,
          updatedTransaction.timestamp,
          updatedTransaction.frominron,
          updatedTransaction.toinron,
          updatedTransaction.id
        ]
      );
      return "Success";
    } 
    return "Unauthorized";
  } catch (error) {
    console.error(
      "An error occurred while updating the new transaction record: ",
      error
    );
    return "Server error";
  } finally {
    client.release();
  }
}

async function deleteTransaction(id, email) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT user_email FROM investmenttracker WHERE id = $1", [id]);
    if (res.rows[0].user_email === email) {
      await client.query('DELETE FROM investmenttracker WHERE id = $1', [id]);
      return "Success";
    } 
    return "Unauthorized";
  } catch (error) {
    console.error(
      "An error occurred while deleting a transaction record: ",
      error
    );
    return "Server error";
  } finally {
    client.release();
  }
}

async function deleteAllTransactionHistory(email) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM investmenttracker WHERE user_email = $1', [email]);
    return "Success";
  } catch (error) {
    console.error(
      "An error occurred while deleting the transaction history: ",
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
      "INSERT INTO investerusers (email, password) VALUES ($1, $2)", 
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
    const { rows } = await client.query('SELECT * FROM investerusers WHERE email = $1', [email]);
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
        user_email VARCHAR(255) REFERENCES investerusers(email),
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

async function createInvesterUsersTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS investerusers (
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
  getUserByEmail,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactionHistory,
};
