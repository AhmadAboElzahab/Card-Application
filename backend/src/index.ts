import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';

import cookieParser from 'cookie-parser';
import { HafilatRouter } from './routes/hafilat.route';

dotenv.config();

(async function () {
  const app: Application = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(morgan('dev'));

  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use('/hafilat', HafilatRouter);

  const PORT: number = parseInt(process.env.PORT || '8082', 10);

  mongoose.set('strictQuery', false);

  try {
    const dbConnectString = process.env.DB_CONNECT;

    if (!dbConnectString) {
      throw new Error('DB_CONNECT environment variable is not set');
    }

    await mongoose.connect(dbConnectString);
    app.listen(PORT, () => {
      console.log(`Connected on http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(error);
  }
})();
