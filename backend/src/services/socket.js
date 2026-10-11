let io = null;

function initSocket(socketIoInstance) {
  io = socketIoInstance;
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_canteen', (canteenId) => {
      socket.join(`canteen_${canteenId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined room canteen_${canteenId}`);
    });

    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

function emitOrderUpdate(canteenId, orderData) {
  if (io) {
    io.to(`canteen_${canteenId}`).emit('order_updated', orderData);
    if (orderData.user_id) {
      io.to(`user_${orderData.user_id}`).emit('order_status_change', orderData);
    }
  }
}

function emitAvailabilityChange(canteenId, itemData) {
  if (io) {
    io.to(`canteen_${canteenId}`).emit('availability_changed', itemData);
  }
}

function emitQueueUpdate(canteenId, queueData) {
  if (io) {
    io.to(`canteen_${canteenId}`).emit('queue_updated', queueData);
  }
}

module.exports = {
  initSocket,
  emitOrderUpdate,
  emitAvailabilityChange,
  emitQueueUpdate,
};
