import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotel, getRoom } from "@/controllers";

const hotelRouter = Router();

hotelRouter
  .all("/*", authenticateToken)
  .get("/", getHotel)
  .get("/:hotelId", getRoom);

export { hotelRouter };
