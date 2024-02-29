import { Router } from 'express';
import { hafilatController } from '../controller/hafilat.controller';

export const HafilatRouter = Router();

HafilatRouter.post('/balance', hafilatController.getHafilatCardInfo);
