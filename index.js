const { saveTransaction, getTransactions } = require('./database.js');

const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));

const PORT = 8080;

app.post('/SaveTransaction', (req, res) => {
  async function api(){
    const result = await saveTransaction(req.body)
    let statusCode = 500
    if (result === "Success") statusCode = 200
    res.status(statusCode).send();
  }
  api()
});

app.get('/GetTransactions', (req, res) => {
  async function api(){
    const transactions = await getTransactions();
    let statusCode = 500
    if (transactions !== "Server error") statusCode = 200 
    res.status(statusCode).json(transactions);
  }
  api();
});

app.listen(PORT, () => console.log(`Server is running on: http://localhost:${PORT}`));
