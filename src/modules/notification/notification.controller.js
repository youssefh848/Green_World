import { Server } from 'socket.io';
import { AppError } from '../../utils/appError.js';
import { messages } from '../../utils/constant/messages.js';
import axios from 'axios'; // Import axios for making API requests

// Initialize Socket.IO
const io = new Server();

// Function to send a notification
export const sendNotification = (req, res, next) => {
  const { message, userId } = req.body;

  // Check if message and userId are provided
  if (!message || !userId) {
    return next(new AppError(messages.notification.failToSend, 400));
  }

  // Emit the notification to the specific user
  io.to(userId).emit('notification', { message });

  res.status(200).json({
    success: true,
    message: messages.notification.sentSuccessfully,
  });
};

// Function to fetch weather data and send notification
export const fetchWeatherAndNotify = async (req, res, next) => {
  const apiKey = process.env.WEATHER_API_KEY; // Ensure you have your API key set in your environment variables
  const city = 'Cairo'; // You can modify this to accept city as a parameter

  try {
    // Fetch weather data from OpenWeather API
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    
    const { main, weather } = weatherResponse.data;
    const message = `Current weather in ${city}: ${weather[0].description}, Temperature: ${main.temp}°C, Humidity: ${main.humidity}%`;

    // Emit the notification to the specific user (you can modify this to get userId from the request)
    const userId = req.body.userId; // Assuming userId is sent in the request body
    io.to(userId).emit('notification', { message });

    res.status(200).json({
      success: true,
      message: "Weather notification sent successfully.",
    });
  } catch (error) {
    return next(new AppError("Failed to fetch weather data.", 500));
  }
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
