const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const authRoutes = require('./routes/auth.route')
const meRoutes = require('./routes/me.route')
const { errorMiddleware } = require('./middlewares/error.middleware')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(helmet())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/me", meRoutes);
app.use(errorMiddleware);

app.listen(port, () => {
  console.info(`AUTH API listening on port ${port}`)
})
