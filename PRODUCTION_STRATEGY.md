# Production Deployment Architecture & Reliability Plan

This document outlines the high-availability, scalable architecture plan for the **CareerGrid MERN Platform**.

## 1. Core Infrastructure

### A. Compute: Node.js Backend
- **Process Management**: Use **PM2** in cluster mode (`pm2 start server.js -i max`).
- **Reliability**: PM2 will automatically restart the application on crashes and manage log rotation.
- **Graceful Shutdown**: The application is configured to handle `SIGTERM` and `SIGINT`, ensuring active database connections and socket sessions are closed cleanly before the process exits.

### B. Database: MongoDB Atlas (Global Cluster)
- **Deployment**: Managed MongoDB Atlas cluster with at least 3-node replica set for high availability.
- **Backups**: Automated daily snapshots with point-in-time recovery.
- **Performance**: Integrated with the optimized indexes recently added to `Application`, `User`, and `PracticeAttempt` models.

### C. Reverse Proxy: NGINX
- **SSL Termination**: Let's Encrypt for automated SSL management.
- **Static Asset Serving**: NGINX serves the Vite-built frontend assets directly, reducing Node.js load.
- **Buffer Management**: Optimized for large file uploads (Resumes/Practice Materials).

## 2. Scalability Strategy

### A. Horizontal Scaling
- **Load Balancing**: Utilize a Cloud Load Balancer (AWS ALB / DigitalOcean LB) to distribute traffic across multiple Node.js droplets/instances.
- **Statelessness**: Ensure all session data is moved to the JWT and ephemeral state to Redis if needed.

### B. Real-time Synergy (Socket.io)
- **Sticky Sessions**: Cloud Load Balancers must be configured with "Sticky Sessions" (Session Affinity) to ensure the initial HTTP handshake for a socket connects to the same server that maintains the WebSocket upgrade.
- **Redis Adapter**: When scaling to multiple nodes, use `@socket.io/redis-adapter` to synchronize events across all backend instances.

## 3. Reliability & Monitoring

### A. Error Tracking (Sentry)
- **Unified Logging**: Sentry is integrated into both Frontend and Backend to capture unhandled exceptions, 500-level API errors, and socket failures.
- **Performance Profiling**: Tracing is enabled to identify slow database queries or bottleneck middleware.

### B. Health Checks
- **Endpoint**: `/api/health` (or simple `/` check) monitored by UptimeRobot or equivalent to trigger automated failovers.
- **Heartbeats**: Configured `pingTimeout` (60s) and `pingInterval` (25s) in Socket.io to prevent zombie connections and ensure rapid discovery of client disconnects.

## 4. Environment Management
- **Security**: Use `.env.production` for sensitive credentials (API Keys, DB URIs, Sentry DSNs).
- **CI/CD**: Github Actions recommended for automated testing (`npm test`) and zero-downtime deployment (Rolling Updates).

---
*Prepared by Reliability Engineering Team*
