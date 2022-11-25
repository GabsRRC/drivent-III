import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";

async function getHotel(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.TicketType.includesHotel !== true) {
    throw notFoundError();
  }

  const payment = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (payment.status !== "PAID") {
    throw notFoundError();
  }

  const hotel = await hotelRepository.findHotel();

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

async function getRoom(hotelId: number, userId: number) {
  const check = await hotelRepository.findHotelById(hotelId);
  if (!check) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.TicketType.includesHotel !== true) {
    throw notFoundError();
  }

  const payment = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (payment.status !== "PAID") {
    throw notFoundError();
  }

  const room = await hotelRepository.findRoom(hotelId);
  return room;
}

const hotelService = {
  getHotel,
  getRoom
};
  
export default hotelService;
