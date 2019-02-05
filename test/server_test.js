"use strict";

const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const request = require("supertest");
const bcrypt = require("bcrypt");

const server = require("../server");
const baseUrl = "http://localhost:3000";

describe("server", () => {
  before(() => {
    server.listen(3000);
  });

  it('GET request to / responds with "Hello, World!"', done => {
    request(baseUrl)
      .get("/")
      .expect(200)
      .expect("Content-Type", "text/plain; charset=utf-8")
      .end((error, response) => {
        if (error) {
          done(error);
          return;
        }
        response.text.should.equal("Hello, World!");
        done();
      });
  });

  it("POST request to /messsage with message data returns message id", done => {
    request(baseUrl)
      .post("/message")
      .send({ message: "This is a test message." })
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((error, response) => {
        if (error) {
          done(error);
          return;
        }
        let result = JSON.parse(response.text);
        result.should.be.a("number");
        done();
      });
  });

  it("GET request to /messages returns a list of all the messages", done => {
    request(baseUrl)
      .get("/messages")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((error, response) => {
        if (error) {
          done(error);
          return;
        }
        let result = JSON.parse(response.text);
        result.should.be.a("Array");
        result[0].should.eql({ id: 1, message: "This is a test message." });
        done();
      });
  });

  it("GET request to /message/:id returns the message matching the id", done => {
    request(baseUrl)
      .get("/message/1")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((error, response) => {
        if (error) {
          done(error);
          return;
        }
        let result = JSON.parse(response.text);
        result.should.be.a("object");
        result.should.eql({ id: 1, message: "This is a test message." });
        done();
      });
  });

  it("GET request to /message/:id?encrypt=true returns the message encyrpted", done => {
    request(baseUrl)
      .get("/message/1?encrypt=true")
      .expect(200)
      .expect("Content-Type", "text/plain; charset=utf-8")
      .end((error, response) => {
        if (error) {
          done(error);
          return;
        }
        const hash = response.text;
        const plainText = JSON.stringify({
          id: 1,
          message: "This is a test message."
        });
        let result = bcrypt.compareSync(plainText, hash);
        result.should.be.true;
      });
  });

  it("GET request to /messages?encrypt=true returns all the messages encrypted", done => {
    request(baseUrl)
      .get("/messages?encrypt=true")
      .expect(200)
      .expect("Content-Type", "text/plain; charset=utf-8")
      .end((error, response) => {
        if (error) {
          done(error);
          return;
        }
        const hash = response.text;
        const plainText = JSON.stringify([
          { id: 1, message: "This is a test message." }
        ]);
        let result = bcrypt.compareSync(plainText, hash);
        result.should.be.true;
      });
  });

  after(() => {
    server.close();
  });
});
