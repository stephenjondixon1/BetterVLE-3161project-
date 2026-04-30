const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const forumRoutes = require('./routes/forumRoutes');
const contentRoutes = require('./routes/contentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: 'BetterVLE API is running.',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      calendar: '/api/calendar',
      forums: '/api/forums',
      content: '/api/content',
      assignments: '/api/assignments',
      reports: '/api/reports',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal server error.',
    error: err.message,
  });
});

module.exports = app;
