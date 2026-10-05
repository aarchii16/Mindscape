# Django to Node.js Migration Guide

This document outlines the migration process from the Django backend to the Node.js/Express backend for the Mindscape project.

## Architecture Changes

### Framework Equivalents

| Django Component | Node.js Equivalent | Notes |
|------------------|-------------------|-------|
| Django | Express.js | Web framework |
| Django REST Framework | Express.js + custom middleware | API framework |
| Django ORM | Mongoose | Database ORM |
| Django Channels | Socket.io | WebSockets |
| Django Redis | Node Redis | Caching and sessions |
| Django SimpleJWT | jsonwebtoken + passport.js | Authentication |
| Django Middleware | Express middleware | Request processing |
| Django Settings | .env + config files | Configuration |
| Django Apps | Express Routers | API organization |
| Django Templates | N/A (API only) | Frontend handled separately |
| Django Admin | Custom admin routes | Admin functionality |
| Django Signals | Mongoose middleware + events | Data change events |
| Django Celery | Node.js worker threads or separate microservices | Background tasks |

## Database Changes

- MongoDB connection is now handled through Mongoose instead of Djongo
- Models are defined using Mongoose Schema instead of Django Models
- Queries use Mongoose methods instead of Django QuerySets
- Validation is handled through Mongoose Schema validation and express-validator

## Authentication Changes

- JWT authentication is implemented using passport-jwt instead of SimpleJWT
- User registration and login flows remain similar but use different libraries
- Password hashing is done with bcrypt instead of Django's built-in hashers
- Session management uses express-session with Redis store

## API Endpoint Changes

The API endpoints maintain the same structure and naming conventions to ensure compatibility with the frontend:

- All endpoints still use the `/api/` prefix
- Resource naming remains consistent (users, chat, booking, etc.)
- HTTP methods (GET, POST, PUT, DELETE) are used in the same way
- Response formats remain consistent (JSON with similar structure)

## WebSocket Changes

- Django Channels is replaced with Socket.io
- Event names and payload structures remain consistent
- Authentication for WebSockets now uses Socket.io middleware with JWT

## Configuration Changes

- Django's settings.py is replaced with:
  - .env file for environment variables
  - config/ directory with separate configuration files
  - app.js for Express application setup

## Error Handling Changes

- Django's exception handling is replaced with Express error middleware
- HTTP status codes and error response formats remain consistent

## Testing Changes

- Django's test framework is replaced with Jest and Supertest
- Test structure and organization is similar but uses different syntax
- Test database setup is handled through Jest configuration

## Deployment Changes

- Gunicorn is replaced with Node.js's built-in HTTP server
- Process management can be handled with PM2 instead of systemd
- Docker configuration is updated to use Node.js base image

## Migration Steps for Developers

1. **Environment Setup**:
   - Install Node.js 18 or higher
   - Install MongoDB and Redis (same as before)
   - Set up environment variables in .env file

2. **Code Familiarization**:
   - Review Express.js basics if you're new to it
   - Understand Mongoose for MongoDB interaction
   - Learn about Passport.js for authentication

3. **Testing**:
   - Run the test suite to ensure functionality
   - Compare API responses with the Django backend
   - Verify WebSocket functionality

4. **Frontend Integration**:
   - No changes needed if frontend uses the same API endpoints
   - Update any hardcoded URLs to point to the new backend

5. **Deployment**:
   - Update CI/CD pipelines for Node.js
   - Update Docker configurations
   - Set up monitoring for the new backend

## Common Issues and Solutions

1. **Authentication Tokens**:
   - Tokens from the Django backend won't work with the Node.js backend
   - Users will need to log in again to get new tokens

2. **Database Compatibility**:
   - The MongoDB schema remains compatible
   - Some field validations might behave differently

3. **WebSocket Connections**:
   - Socket.io uses a different connection protocol
   - Frontend WebSocket code might need updates

4. **File Uploads**:
   - Multer handles file uploads differently than Django
   - File paths and storage might need adjustments

5. **Error Messages**:
   - Error formats are kept consistent but message text might differ
   - Frontend error handling should be tested thoroughly

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)