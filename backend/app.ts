import createError, { HttpError } from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import logsRouter from "./routes/logRouter";
import droneRouter from "./routes/droneRoute";
import incidentRouter from "./routes/incidentRoute";
import prePostCheckRouter from "./routes/prePostCheckRoute";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// CORS middleware
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, '');
app.use(cors({
  origin: frontendUrl,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
}));

app.use("/api/logs", logsRouter);
app.use("/api/drones", droneRouter);
app.use("/api/incidents", incidentRouter);
app.use("/api/prepostchecks", prePostCheckRouter);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler middelware
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json({ message: err.message, error: res.locals.error });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
