import { notFoundError, requestError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";

async function checkTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw requestError(403, "Forbidden");
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.TicketType.includesHotel !== true) {
    throw requestError(403, "Forbidden");
  }

  const payment = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (payment.status !== "PAID") {
    throw requestError(402, "Payment Required");
  }
}

async function getHotels(userId: number) {
  await checkTicket(userId);
  const hotelData = await hotelRepository.findHotel();

  if (!hotelData) {
    throw requestError(403, "Forbidden");
  }
  return hotelData;
}

async function getRooms(userId: number, hotelId: number) {
  const checkHotelId = await hotelRepository.findHotelById(hotelId);
  if (!checkHotelId) {
    throw notFoundError();
  }
  await checkTicket(userId);

  const roomData = await hotelRepository.findRoom(hotelId);

  if (!roomData) {
    throw requestError(403, "Forbidden");
  }
  return roomData;
}

const hotelService = {
  getHotels,
  getRooms
};
  
export default hotelService;
