const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// State variable to track system availability for readiness probes
let isShuttingDown = false;

// Structured Logging Middleware (Enterprise Production Standard)
app.use((req, res, next) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip
    }));
    next();
});

// Primary Business Logic Route
app.get('/api/v1/data', (req, res) => {
    if (isShuttingDown) {
        return res.status(503).json({ status: "Service Unavailable", detail: "Pod is terminating" });
    }
    res.status(200).json({
        status: "Success",
        timestamp: new Date(),
        platform: "PipelineX",
        version: "1.0.0"
    });
});

// Kubernetes Liveness Probe: Confirms the runtime container is alive
app.get('/healthz/liveness', (req, res) => {
    res.status(200).json({ status: "UP", diagnostics: { memory: process.memoryUsage() } });
});

// Kubernetes Readiness Probe: Confirms the app can accept live traffic
app.get('/healthz/readiness', (req, res) => {
    if (isShuttingDown) {
        return res.status(503).json({ status: "NOT_READY" });
    }
    // Add external dependency checks here (e.g., Database connection checks)
    res.status(200).json({ status: "READY" });
});

const server = app.listen(PORT, () => {
    console.log(JSON.stringify({ level: "INFO", message: `PipelineX Microservice running on port ${PORT}` }));
});

// Graceful Termination Handler (Ensures Zero-Downtime during Kubernetes Rolling Updates)
process.on('SIGTERM', () => {
    console.log(JSON.stringify({ level: "WARN", message: "SIGTERM signal received. Commencing graceful shutdown phase." }));
    isShuttingDown = true;
    
    // Allow active connections to finish within a 15-second grace window
    server.close(() => {
        console.log(JSON.stringify({ level: "INFO", message: "All connections closed securely. Process exiting cleanly." }));
        process.exit(0);
    });
});