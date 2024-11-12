const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // For parsing JSON requests

// Example route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const userRoutes = require('./routes/recipies');
app.use('/api/recipies', userRoutes);
