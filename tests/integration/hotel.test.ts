import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createTicketTypeNoHotel,
  createTicketTypeIncludeHotel,
  createHotel,
  createRoom
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

// GET '/hotel' with invalid token

// should respond with status 401 if no token is given

// should respond with status 401 if given token is not valid

// should respond with status 401 if there is no session for given token

// GET '/hotel' with valid token

// should respond with status 403 if no enrollment found

// should respond with status 403 if no ticket found

// should respond with status 403 if no hotel included on ticketType found

// should respond with status 402 if no payment found

// should respond with status 200 and empty array when there are no hotel created

// should respond with status 200 and with hotel data

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    beforeEach(async () => {
      await cleanDb();
    });
    it("should respond with status 403 if no enrollment found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 if no ticket found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 if no hotel included on ticketType found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNoHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 if no payment found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 empty array when there are no hotel created", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.body).toEqual([]);
    });

    it("should respond with status 200 and with hotel data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotel();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });
  });
});

// GET '/hotel/hotelId' with invalid token

// should respond with status 401 if no token is given

// should respond with status 401 if given token is not valid

// should respond with status 401 if there is no session for given token

// GET '/hotel/hotelId' with valid token

// should respond with status 403 if no enrollment found 

// should respond with status 403 if no ticket found 

// should respond with status 403 if no hotel on ticketType found 

// should respond with status 402 if no payment found

// should respond with status 404 if no hotelId found

// should respond with status 200 empty array when there are no hotel room created

// should respond with status 200 and with hotel room data

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const newHotel = await createHotel();
    const hotelId = newHotel.id;
    const response = await server.get(`/hotels/${hotelId}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const newHotel = await createHotel();
    const hotelId = newHotel.id;
    const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const newHotel = await createHotel();
    const hotelId = newHotel.id;
    const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    beforeEach(async () => {
      await cleanDb();
    });

    it("should respond with status 404 if no hotelId found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotelId = 0;
      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if no enrollment found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const newHotel = await createHotel();
      const hotelId = newHotel.id;
  
      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if no ticket found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const newHotel = await createHotel();
      const hotelId = newHotel.id;
  
      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if no hotel on ticketType found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNoHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const newHotel = await createHotel();
      const hotelId = newHotel.id;
  
      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 if no payment found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const newHotel = await createHotel();
      const hotelId = newHotel.id;

      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 and empty array when there are no hotel room created", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const newHotel = await createHotel();
      const hotelId = newHotel.id;
    
      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
      
      expect(response.body).toEqual({
        id: hotelId,
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: []
      },);
    });
    
    it("should respond with status 200 and with hotel room data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const newHotel = await createHotel();
      const hotelId = newHotel.id;
      const newRoom = await createRoom(hotelId);
      const roomId = newRoom.id;
    
      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        {
          id: hotelId,
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          Rooms: [{
            id: roomId,
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: hotelId,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }]
        },
      );
    });
  });
});
