import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotel-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotel(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotel = await hotelService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotel);
  } catch (error) {
    if (error.status === 402) {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function getRoom(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;
  const { userId } = req;
  try {
    const room = await hotelService.getRooms(userId, Number(hotelId));
    return res.status(httpStatus.OK).send(room);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.status === 402) {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
