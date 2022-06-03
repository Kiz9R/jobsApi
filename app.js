require("dotenv").config();
require("express-async-errors");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const express = require("express");
const app = express();

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// connectDB

const connectDB = require("./db/connect");
const authenticateUser = require(`./middleware/authentication`);

// routers

const authRouter = require("./routes/auth");
const jobRouter = require("./routes/jobs");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());
// extra packages

// app.use("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

app.get("/", (req, res) => {
  res.send('<h1> JOBS API </h1><a href="/api-docs">Documentation</a>');
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// routes
app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/jobs`, authenticateUser, jobRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
