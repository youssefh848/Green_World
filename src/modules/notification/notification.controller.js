import { Server } from 'socket.io';
import { AppError } from '../../utils/appError.js';
import { messages } from '../../utils/constant/messages.js';
import axios from 'axios'; 

// Initialize Socket.IO
const io = new Server();

// Function to send a notification
export const sendNotification = (req, res, next) => {
  const { message } = req.body;
  const userId = req.authUser?._id; // Getting userId from token

  // Check if message is provided and user is authenticated
  if (!message || !userId) {
    return next(new AppError(messages.notification.failToSend, 400));
  }

  // Emit the notification to the specific user
  io.to(userId.toString()).emit('notification', { message });

  res.status(200).json({
    success: true,
    message: messages.notification.sentSuccessfully,
  });
};

// Function to fetch weather data and send notification
export const fetchWeatherAndNotify = async (req, res, next) => {
  const apiKey = process.env.WEATHER_API_KEY;
  const city = 'Cairo';

  const userId = req.authUser?._id;
  if (!userId) {
    return next(new AppError(messages.notification.userIdRequired, 400));
  }

  const weatherResponse = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  );
  const { main, weather } = weatherResponse.data;

  const message = `Current weather in ${city}: ${weather[0].description}, Temperature: ${main.temp}°C, Humidity: ${main.humidity}%`;

  io.to(userId.toString()).emit('notification', { message });

  res.status(200).json({
    success: true,
    message: messages.notification.sentSuccessfully,
  });
};

// Function to handle user connection
export const handleUserConnection = (socket) => {
  console.log('User connected:', socket.id);

  // Join a room based on user ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined the room.`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Listen for notifications
  socket.on('notification', (data) => {
    console.log("📩 New Notification:", data.message);
  });
};

// Export the Socket.IO instance
export { io };
