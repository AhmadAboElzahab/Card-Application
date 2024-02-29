import { Request, Response } from 'express';
import STATUS_CODES from 'http-status-codes';
import hafilatCardInfo from '../service/hafilat.service';

const getHafilatCardInfo = async (
  req: Request<{ cardNumber: string }, {}, { cardNumber: string }>,
  res: Response,
) => {
  const { cardNumber } = req.body;
  if (!cardNumber) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ error: 'Card Number is Requierd' });
  }
  const regex = /^0{16}$/;
  if (!regex.test(cardNumber)) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ error: "Input does not match the required format '000000000000000'" });
  }

  try {
    const data = await hafilatCardInfo(cardNumber);
    return res.status(STATUS_CODES.OK).json(data);
  } catch (e) {
    console.error();
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};
export const hafilatController = { getHafilatCardInfo };
