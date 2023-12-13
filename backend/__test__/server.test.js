import request from "supertest";
import { app } from "../server";

describe("POST /flashcards", () => {
    it("Should return all flashcards of the default user", async () => {
        let req = await request(app).post("/flashcards").send({userId: 'default'}).set('Accept', 'application/json')
        req.expect('Content-Type', /json/).expect(200)
      });
})

