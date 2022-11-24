import { prisma } from "@/config";

async function findHotel() {
  return prisma.hotel.findMany();
}

async function findTicketTypeById(ticketId: number) {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      TicketType: {
        select: {
          includesHotel: true,
        }
      }
    } });
}

async function findHotelById(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId
    }
  });
}

async function findRoom(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId
    },
    include: {
      Rooms: true
    }
  });
}

const hotelRepository = {
  findHotel,
  findTicketTypeById,
  findRoom,
  findHotelById
};
  
export default hotelRepository;
