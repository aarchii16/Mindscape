# Mindscape Backend (Node.js/Express)

This is the Node.js/Express implementation of the Mindscape backend, migrated from the original Django backend.

## Migration Notes

This backend has been migrated from Django to Node.js/Express while maintaining compatibility with the existing frontend. The migration includes:

- Replacing Django REST Framework with Express.js
- Replacing Django's authentication with Passport.js and JWT
- Replacing Django ORM with Mongoose for MongoDB interaction
- Replacing Django Channels with Socket.io for WebSockets
- Replacing Django Redis with Node Redis for caching and session management

## Dependencies

The Node.js backend uses the following key dependencies:

- **Express**: Web framework
- **Mongoose**: MongoDB ODM
- **Passport**: Authentication middleware
- **JWT**: Token-based authentication
- **Socket.io**: WebSockets for real-time communication
- **Redis**: Caching and session storage
- **OpenAI**: AI integration for chat assistance
- **Winston**: Logging
- **Multer**: File uploads
- **Nodemailer**: Email sending

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=8000
   MONGODB_URL=your_mongodb_connection_string
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=3600
   REFRESH_TOKEN_EXPIRATION=604800
   OPENAI_API_KEY=your_openai_api_key
   FRONTEND_URL=http://localhost:8080
   CORS_ORIGIN=http://localhost:8080
   SESSION_SECRET=your_session_secret
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Seed the database with sample data (optional):
   ```
   npm run seed
   ```

   This will create sample users, slots, chats, and appointments for testing.

5. Start the production server:
   ```
   npm start
   ```

## API Endpoints

The API endpoints maintain compatibility with the original Django backend:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `GET /api/users/:id` - Get user by ID

### Chat
- `GET /api/chat/sessions` - Get all chat sessions for current user
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions/:id` - Get chat session by ID
- `PUT /api/chat/sessions/:id` - Update chat session
- `DELETE /api/chat/sessions/:id` - Delete chat session
- `GET /api/chat/sessions/:id/messages` - Get messages for a chat session
- `POST /api/chat/sessions/:id/messages` - Send message to chat session

### Booking
- `GET /api/booking/slots` - Get available booking slots (query params: counselorId, startDate, endDate, type)
- `POST /api/booking/slots` - Create new slot (counselor only)
- `GET /api/booking/counselor/slots` - Get counselor's slots (counselor only)
- `POST /api/booking/appointments` - Create new appointment
- `GET /api/booking/appointments` - Get user's appointments
- `GET /api/booking/appointments/:id` - Get appointment by ID
- `PUT /api/booking/appointments/:id` - Update appointment
- `DELETE /api/booking/appointments/:id` - Cancel appointment
- `GET /api/booking/counselor/appointments` - Get counselor's appointments (counselor only)

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create resource (admin only)
- `PUT /api/resources/:id` - Update resource (admin only)
- `DELETE /api/resources/:id` - Delete resource (admin only)

### Forum
- `GET /api/forum/topics` - Get all forum topics
- `POST /api/forum/topics` - Create new topic
- `GET /api/forum/topics/:id` - Get topic by ID
- `POST /api/forum/topics/:id/posts` - Create post in topic
- `PUT /api/forum/posts/:id` - Update post
- `DELETE /api/forum/posts/:id` - Delete post

### Analytics
- `GET /api/analytics/usage` - Get usage analytics (admin only)
- `GET /api/analytics/sentiment` - Get sentiment analytics (admin only)
- `GET /api/analytics/engagement` - Get engagement analytics (admin only)

## API Response Documentation

### Authentication Responses

#### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "john_student",
      "email": "john@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  },
  "message": "Login successful"
}
```

### Booking Responses

#### GET /api/booking/slots
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "slot_id",
      "counselor": {
        "_id": "counselor_id",
        "firstName": "Alice",
        "lastName": "Johnson",
        "username": "counselor_alice"
      },
      "startTime": "2024-01-15T09:00:00.000Z",
      "endTime": "2024-01-15T10:00:00.000Z",
      "type": "therapy",
      "isAvailable": true,
      "notes": "Initial consultation"
    }
  ],
  "message": "Available slots retrieved successfully"
}
```

#### POST /api/booking/appointments
**Request:**
```json
{
  "slotId": "slot_id",
  "type": "therapy",
  "notes": "First therapy session"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "appointment_id"
  },
  "message": "Appointment created successfully"
}
```

### Chat Responses

#### GET /api/chat/sessions
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "chat_id",
      "participants": [
        {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "username": "john_student",
          "role": "student"
        },
        {
          "_id": "counselor_id",
          "firstName": "Alice",
          "lastName": "Johnson",
          "username": "counselor_alice",
          "role": "counselor"
        }
      ],
      "type": "student-counselor",
      "title": "Support Chat",
      "isActive": true,
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:30:00.000Z"
    }
  ],
  "message": "Chat sessions retrieved successfully"
}
```

#### POST /api/chat/sessions/:id/messages
**Request:**
```json
{
  "content": "Hello, I need some help with stress management"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "message_id",
    "sender": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "username": "john_student"
    },
    "content": "Hello, I need some help with stress management",
    "timestamp": "2024-01-10T11:00:00.000Z",
    "isRead": false
  },
  "message": "Message sent successfully"
}
```

### Error Responses

All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## WebSocket Events

WebSocket events are handled through Socket.io:

- **Connection**: 'connection'
- **Chat Message**: 'chat:message'
- **Chat Typing**: 'chat:typing'
- **Notification**: 'notification'
- **Crisis Alert**: 'crisis:alert'

## Testing

Run tests with:
```
npm test
```

## Linting and Formatting

```
npm run lint
npm run format
```