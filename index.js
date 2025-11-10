// 1. आवश्यक पैकेज (dependencies) को Import करना
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // 1. 'http' module को Import करना
const { initSocket } = require('./services/socket.js'); // 2. initSocket को Import करना
const mainApiRouter = require('./routes/index');

// 3. .env फ़ाइल को कॉन्फ़िगर करना
dotenv.config();

// 4. एक्सप्रेस ऐप को Initialize करना
const app = express();

// 5. मिडलवेयर (Middleware) का उपयोग करना

app.use(cors());
app.use(express.json());

// 6. Routes (रूट्स) को सेट अप करना
app.get('/', (req, res) => {
  res.json({ message: "CRM Backend API is running!" });
});

// मुख्य API Routes को 'mount' (माउंट) करना
app.use('/api', mainApiRouter);

// 7. सर्वर को शुरू (Start) करना (Socket.io के साथ)
const PORT = process.env.PORT || 3001;

// 4. app.listen() के बजाय...
//    Express ऐप का उपयोग करके एक HTTP सर्वर बनाएँ
const httpServer = http.createServer(app);

// 5. Socket.io को HTTP सर्वर से Attach (अटैच) करें
initSocket(httpServer);

// 6. app.listen() के बजाय httpServer.listen() का उपयोग करें
httpServer.listen(PORT, () => {
  console.log(`सर्वर http://localhost:${PORT} पर सफलतापूर्वक चल रहा है (Socket.io enabled)`);
});