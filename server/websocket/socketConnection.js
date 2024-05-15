const socketProperties = {
  cors: {
    origin: process.env.clientUrl || 'http://localhost:3000',
  },
  pingTimeout: process.env.SOCKET_TIMEOUT || 60000,
};

const users = new Map();
const rooms = new Map();

const connectSocket = (server) => {
  const io = require('socket.io')(server, socketProperties);

  io.on('connection', (socket) => {
    console.log('Connected to Socket.io');

    socket.on('setup', (userData) => {
      socket.join(userData._id);
      users.set(socket.id, userData);
      console.log('User joined: ' + userData._id);
      socket.emit('connected');
    });

    socket.on('join chat', (room) => {
      const userData = users.get(socket.id);
      const currentRoom = rooms.get(socket.id);
      if (currentRoom) {
        socket.leave(currentRoom);
        console.log(`User: ${userData._id} left Room: ${currentRoom}`);
      }
      socket.join(room);
      rooms.set(socket.id, room);
      console.log(`User: ${userData._id} joined Room: ${room}`);
    });

    socket.on('typing', (room) => {
      socket.in(room).emit('typing');
    });

    socket.on('stop typing', (room) => {
      socket.in(room).emit('stop typing');
    });

    socket.on('new message', (newMessageReceived) => {
      let chat = newMessageReceived.chat;
      if (!chat.users) return console.log('chat users not defined');

      chat.users.forEach((user) => {
        if (user._id === newMessageReceived.sender._id) {
          return;
        }
        socket.in(user._id).emit('message received', newMessageReceived);
      });
    });

    socket.on('disconnect', () => {
      const userData = users.get(socket.id);
      if (userData) {
        users.delete(socket.id);
        socket.leave(userData._id);
        console.log(`User: ${userData._id} DISCONNECTED`);
      }
      const currentRoom = rooms.get(socket.id);
      if (currentRoom) {
        rooms.delete(socket.id);
        socket.leave(currentRoom);
      }
    });
  });
};

module.exports = connectSocket;
