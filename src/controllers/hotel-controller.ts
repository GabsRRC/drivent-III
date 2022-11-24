import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotel-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotel(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotel = await hotelService.getHotel(userId);

    return res.status(httpStatus.OK).send(hotel);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getRoom(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;
  try {
    const room = await hotelService.getRoom(Number(hotelId));
  
    return res.status(httpStatus.OK).send(room);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
