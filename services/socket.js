const { Server } = require('socket.io');

// 1. 'io' instance को store करने के लिए variable
// इसे 'null' से शुरू किया जाता है
let io = null;

// 2. Socket.io सर्वर को initialize (शुरू) करने का फ़ंक्शन
exports.initSocket = (httpServer) => {
  // 'httpServer' (जो Express से आता है) को पास किया जाता है
  io = new Server(httpServer, {
    // CORS (Cross-Origin Resource Sharing) सेटिंग्स
    // '*' का मतलब है कि किसी भी ऑरिजिन (domain) से कनेक्ट होने की अनुमति है
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // 'connection' (कनेक्शन) इवेंट के लिए listener
  // जब भी कोई नया client (जैसे, React ऐप) कनेक्ट होता है, यह चलता है
  io.on('connection', (socket) => {
    console.log(`Socket.io: Client connected [ID: ${socket.id}]`);

    // जब client डिस्कनेक्ट होता है
    socket.on('disconnect', () => {
      console.log(`Socket.io: Client disconnected [ID: ${socket.id}]`);
    });
  });

  // initialize किया गया 'io' instance लौटाएँ
  return io;
};

// 3. 'io' instance को प्राप्त (get) करने का फ़ंक्शन
exports.getIO = () => {
  // यह सुनिश्चित करता है कि सर्वर को initialize किए बिना
  // 'io' को access करने का प्रयास न किया जाए
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  // मौजूदा 'io' instance लौटाएँ
  return io;
};