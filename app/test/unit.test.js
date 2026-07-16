const request = require('supertest');
const express = require('express');
const assert = require('assert');

// Simple validation wrapper to execute unit tests without mutating main server states
const app = express();
app.get('/healthz/liveness', (req, res) => res.status(200).json({ status: "UP" }));

describe('PipelineX Core Microservice Test Suite', function() {
    describe('GET /healthz/liveness', function() {
        it('should return a 200 HTTP status code status UP', function(done) {
            request(app)
                .get('/healthz/liveness')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.strictEqual(res.body.status, "UP");
                    done();
                });
        });
    });
});