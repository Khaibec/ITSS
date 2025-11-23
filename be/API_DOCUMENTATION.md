# Chat Boxes API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Base URL](#base-url)
4. [Authentication](#authentication)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Best Practices](#best-practices)
10. [Testing with Postman](#testing-with-postman)
11. [Changelog](#changelog)

---

## Overview

The Chat Boxes API provides endpoints to retrieve and manage chat conversations for users in the Japanese learning platform. This API allows you to fetch a list of chat groups (conversations) that a user is a member of, along with relevant metadata such as latest messages, unread counts, and group information.

### Key Features

- Retrieve all chat boxes (conversations) for a specific user
- Get latest message information for each chat group
- Retrieve the 40 most recent messages from a specific chat box
- Track unread message counts per conversation
- Access group metadata (name, icon, creation date)
- Automatic sorting by latest message time

---

## Getting Started

### Prerequisites

- Valid user account in the system
- API access credentials (if authentication is required)
- HTTP client or SDK for making API requests

### Quick Start

```bash
# Step 1: Login to get JWT token
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Step 2: Use token to get chat boxes
curl -X GET "http://localhost:3000/api/chat-boxes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Base URL

### Production
```
https://api.example.com
```

### Staging
```
https://staging-api.example.com
```

### Development
```
http://localhost:3000
```

**Note:** Replace `api.example.com` with your actual production domain.

---

## Authentication

The Chat Boxes API requires JWT (JSON Web Token) authentication. All requests must include a valid JWT token in the Authorization header.

### How to Authenticate

1. **Login to get a token:**
   ```bash
   POST /auth/login
   {
     "email": "user@example.com",
     "password": "password"
   }
   ```

2. **Use the token in requests:**
   Include the token in the Authorization header:
   ```
   Authorization: Bearer <YOUR_JWT_TOKEN>
   ```

### Token Format

- **Type:** Bearer Token
- **Location:** Authorization header
- **Format:** `Bearer <token>`
- **Expiration:** Tokens expire after 1 hour (default)

**Note:** The user ID is automatically extracted from the JWT token, so you don't need to pass `user_id` as a query parameter.

---

## API Endpoints

### Get Chat Boxes

Retrieves a list of all chat boxes (conversations) for a specific user. Each chat box represents a group conversation where the user is a member.

#### Endpoint

```
GET /api/chat-boxes
```

#### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token: `Bearer <JWT_TOKEN>`. The user ID is automatically extracted from the token. |

#### Request Parameters

No query parameters are required. The user ID is automatically extracted from the JWT token.

#### Request Example

```bash
GET /api/chat-boxes
Headers: Authorization: Bearer <JWT_TOKEN>
```

```javascript
// JavaScript (Fetch API)
const token = 'your_jwt_token_here'; // Get from login endpoint

const response = await fetch('https://api.example.com/api/chat-boxes', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
```

```python
# Python (requests)
import requests

url = "https://api.example.com/api/chat-boxes"
headers = {
    "Authorization": "Bearer your_jwt_token_here",  # Get from login endpoint
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
```

```curl
# cURL
curl -X GET "https://api.example.com/api/chat-boxes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

#### Response Format

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "group_id": 1,
      "group_name": "Japanese Learning Group",
      "icon_url": "https://example.com/icons/group-1.png",
      "latest_message": "こんにちは！今日は何を勉強しますか？",
      "latest_message_time": "2024-01-15T10:30:00.000Z",
      "latest_message_sender": "John Doe",
      "unread_count": 3,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "group_id": 2,
      "group_name": "Grammar Discussion",
      "icon_url": null,
      "latest_message": "Can someone explain the difference between は and が?",
      "latest_message_time": "2024-01-14T15:20:00.000Z",
      "latest_message_sender": "Jane Smith",
      "unread_count": 0,
      "created_at": "2024-01-05T08:00:00.000Z"
    },
    {
      "group_id": 3,
      "group_name": "Vocabulary Practice",
      "icon_url": "https://example.com/icons/group-3.png",
      "latest_message": null,
      "latest_message_time": null,
      "latest_message_sender": null,
      "unread_count": 0,
      "created_at": "2024-01-10T12:00:00.000Z"
    }
  ],
  "message": "Chat boxes retrieved successfully"
}
```

**Empty Response (200 OK)**

If the user is not a member of any groups:

```json
{
  "success": true,
  "data": [],
  "message": "Chat boxes retrieved successfully"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates whether the request was successful |
| `data` | array | Array of chat box objects (see [ChatBoxItem](#chatboxitem) model) |
| `message` | string | Optional success message |

#### Chat Box Item Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `group_id` | integer | No | Unique identifier of the chat group |
| `group_name` | string | No | Display name of the chat group |
| `icon_url` | string | Yes | URL to the group's icon image |
| `latest_message` | string | Yes | Content of the most recent message in the group |
| `latest_message_time` | datetime (ISO 8601) | Yes | Timestamp of the latest message |
| `latest_message_sender` | string | Yes | Name of the user who sent the latest message |
| `unread_count` | integer | No | Number of unread messages for the requesting user (always ≥ 0) |
| `created_at` | datetime (ISO 8601) | No | Timestamp when the group was created |

#### Sorting Behavior

Chat boxes are automatically sorted by the following rules:

1. **Groups with messages**: Sorted by `latest_message_time` in descending order (most recent first)
2. **Groups without messages**: Placed at the end of the list
3. **Multiple groups without messages**: Maintain their relative order

#### Error Responses

**401 Unauthorized**

Missing or invalid JWT token:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**404 Not Found**

User does not exist:

```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

**500 Internal Server Error**

Server or database error:

```json
{
  "statusCode": 500,
  "message": "Failed to retrieve chat boxes: [error details]",
  "error": "Internal Server Error"
}
```

---

### GET /api/chat-boxes/:groupId/messages

Retrieves the 40 most recent messages from a specific chat box (group). Messages are returned in chronological order (oldest to newest) for easy display in a chat interface.

#### Endpoint

```
GET /api/chat-boxes/:groupId/messages
```

#### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token: `Bearer <JWT_TOKEN>`. The user ID is automatically extracted from the token. |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `groupId` | integer | Yes | The ID of the chat group to retrieve messages from |

#### Request Example

```bash
GET /api/chat-boxes/1/messages
Headers: Authorization: Bearer <JWT_TOKEN>
```

```javascript
// JavaScript (Fetch API)
const token = 'your_jwt_token_here';
const groupId = 1;

const response = await fetch(`https://api.example.com/api/chat-boxes/${groupId}/messages`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
```

```python
# Python (requests)
import requests

token = 'your_jwt_token_here'
groupId = 1

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
}

response = requests.get(
    f'https://api.example.com/api/chat-boxes/{groupId}/messages',
    headers=headers
)

data = response.json()
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "message_id": 1,
      "content": "こんにちは",
      "created_at": "2024-01-15T10:30:00.000Z",
      "sender": {
        "user_id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "message_id": 2,
      "content": "今日はいい天気ですね",
      "created_at": "2024-01-15T10:31:00.000Z",
      "sender": {
        "user_id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ],
  "message": "Chat box messages retrieved successfully"
}
```

**Empty Response (200 OK)**

If the group has no messages:

```json
{
  "success": true,
  "data": [],
  "message": "Chat box messages retrieved successfully"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates whether the request was successful |
| `data` | array | Array of message objects (see [MessageItem](#messageitem) model) |
| `message` | string | Optional success message |

#### Message Item Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `message_id` | integer | No | Unique identifier of the message |
| `content` | string | No | Content/text of the message |
| `created_at` | datetime (ISO 8601) | No | Timestamp when the message was created |
| `sender` | object | Yes | Information about the message sender (null if sender was deleted) |
| `sender.user_id` | integer | No | Unique identifier of the sender |
| `sender.name` | string | No | Display name of the sender |
| `sender.email` | string | No | Email address of the sender |

#### Message Ordering

- Messages are returned in **chronological order** (oldest to newest)
- Only the **40 most recent messages** are returned
- If there are fewer than 40 messages, all messages are returned

#### Error Responses

**401 Unauthorized**

Missing or invalid JWT token:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**403 Forbidden**

User is not a member of the chat group:

```json
{
  "statusCode": 403,
  "message": "User 1 is not a member of group 2",
  "error": "Forbidden"
}
```

**404 Not Found**

User or chat group does not exist:

```json
{
  "statusCode": 404,
  "message": "Chat group with ID 999 not found",
  "error": "Not Found"
}
```

**500 Internal Server Error**

Server or database error:

```json
{
  "statusCode": 500,
  "message": "Failed to retrieve chat box messages: [error details]",
  "error": "Internal Server Error"
}
```

---

## Data Models

### ChatBoxItem

Represents a single chat box (conversation) in the system.

```typescript
interface ChatBoxItem {
  group_id: number;
  group_name: string;
  icon_url?: string | null;
  latest_message?: string | null;
  latest_message_time?: string | null;  // ISO 8601 format
  latest_message_sender?: string | null;
  unread_count: number;  // Always >= 0
  created_at: string;  // ISO 8601 format
}
```

### GetChatBoxesResponse

Standard response format for the Get Chat Boxes endpoint.

```typescript
interface GetChatBoxesResponse {
  success: boolean;
  data: ChatBoxItem[];
  message?: string;
}
```

### MessageItem

Represents a single message in a chat box.

```typescript
interface MessageItem {
  message_id: number;
  content: string;
  created_at: string;  // ISO 8601 format
  sender: {
    user_id: number;
    name: string;
    email: string;
  } | null;  // null if sender was deleted
}
```

### GetChatBoxMessagesResponse

Standard response format for the Get Chat Box Messages endpoint.

```typescript
interface GetChatBoxMessagesResponse {
  success: boolean;
  data: MessageItem[];
  message?: string;
}
```

---

## Error Handling

### HTTP Status Codes

The API uses standard HTTP status codes to indicate the result of a request:

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not have permission to access the resource |
| `404 Not Found` | Requested resource not found |
| `500 Internal Server Error` | Server error occurred |

### Error Response Format

All error responses follow this structure:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error Type"
}
```

### Common Error Scenarios

#### Missing Authorization Header

**Request:**
```
GET /api/chat-boxes
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Invalid JWT Token

**Request:**
```
GET /api/chat-boxes
Headers: Authorization: Bearer invalid_token
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Expired JWT Token

**Request:**
```
GET /api/chat-boxes
Headers: Authorization: Bearer <expired_token>
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Non-existent User (from token)

**Request:**
```
GET /api/chat-boxes
Headers: Authorization: Bearer <token_with_invalid_user_id>
```

**Response:**
```json
{
  "statusCode": 404,
  "message": "User with ID 999999 not found",
  "error": "Not Found"
}
```

---

## Rate Limiting

**Current Status:** Rate limiting is not currently implemented.

**Future Updates:** Rate limiting policies will be announced in future API versions. Recommended practices:

- Implement client-side request throttling
- Cache responses when appropriate
- Avoid making unnecessary requests

---

## Best Practices

### 1. Request Optimization

- **Cache responses**: Chat box lists don't change frequently. Cache the response for 30-60 seconds to reduce server load.
- **Polling intervals**: If implementing real-time updates, use reasonable polling intervals (e.g., 5-10 seconds minimum).

### 2. Error Handling

- Always check the `success` field in responses before processing data
- Implement retry logic for 500 errors with exponential backoff
- Handle 401 errors by redirecting to login or refreshing the token
- Handle null values for optional fields (`icon_url`, `latest_message`, etc.)

### 3. Authentication

- Store JWT tokens securely (e.g., httpOnly cookies or secure storage)
- Implement token refresh logic before expiration
- Handle token expiration gracefully by redirecting to login
- Never expose tokens in URLs or logs

### 4. Performance Considerations

- The API automatically sorts results, so no client-side sorting is needed
- Unread counts are calculated server-side for accuracy
- Large numbers of chat boxes may require pagination in future versions

### 5. Example Implementation

```javascript
// Recommended client-side implementation
async function getChatBoxes(token) {
  // Validate token
  if (!token) {
    throw new Error('JWT token is required');
  }

  try {
    const response = await fetch(
      'https://api.example.com/api/chat-boxes',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      throw new Error('Authentication required. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch chat boxes');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Request was not successful');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching chat boxes:', error);
    throw error;
  }
}

// Usage
// First, login to get token
const loginResponse = await fetch('https://api.example.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' }),
});
const { access_token } = await loginResponse.json();

// Then use token to get chat boxes
const chatBoxes = await getChatBoxes(access_token);
chatBoxes.forEach(box => {
  console.log(`${box.group_name}: ${box.unread_count} unread`);
});
```

---

## Testing with Postman

This section provides a step-by-step guide to test the Chat Boxes API using Postman.

### Quick Start: Import Postman Collection

**Option 1: Import Collection File (Recommended)**

1. Open Postman
2. Click **"Import"** button (top left)
3. Select the file: `be/postman/Chat_Boxes_API.postman_collection.json`
4. The collection will be imported with all requests pre-configured
5. Update the `base_url` variable if needed (default: `http://localhost:3000`)
6. Run **"1. Login - Get JWT Token"** first to get your token
7. The token will be automatically saved and used in other requests

**Option 2: Manual Setup**

Follow the detailed steps below to set up requests manually.

### Prerequisites

- Postman installed on your computer ([Download Postman](https://www.postman.com/downloads/))
- Backend server running on `http://localhost:3000` (or your configured port)
- Valid user account credentials (email and password)

### Step 1: Login to Get JWT Token

1. **Create a new request in Postman:**
   - Click **"New"** → **"HTTP Request"**
   - Name it: `Login - Get JWT Token`

2. **Configure the request:**
   - **Method:** Select `POST` from the dropdown
   - **URL:** Enter `http://localhost:3000/auth/login`
   - **Headers:** 
     - Click on the **"Headers"** tab
     - Add header:
       - Key: `Content-Type`
       - Value: `application/json`

3. **Add request body:**
   - Click on the **"Body"** tab
   - Select **"raw"** radio button
   - Select **"JSON"** from the dropdown (on the right)
   - Enter the following JSON:
     ```json
     {
       "email": "your-email@example.com",
       "password": "your-password"
     }
     ```
   - Replace `your-email@example.com` and `your-password` with your actual credentials

4. **Send the request:**
   - Click the **"Send"** button
   - You should receive a response with status `200 OK` containing:
     ```json
     {
       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": {
         "user_id": 1,
         "email": "your-email@example.com",
         ...
       }
     }
     ```

5. **Copy the JWT token:**
   - In the response body, find the `access_token` field
   - **Copy the entire token value** (it's a long string starting with `eyJ...`)
   - You'll need this token for the next step

### Step 2: Get Chat Boxes

1. **Create a new request:**
   - Click **"New"** → **"HTTP Request"**
   - Name it: `Get Chat Boxes`

2. **Configure the request:**
   - **Method:** Select `GET` from the dropdown
   - **URL:** Enter `http://localhost:3000/api/chat-boxes`

3. **Add Authorization header:**
   - Click on the **"Headers"** tab
   - Add header:
     - Key: `Authorization`
     - Value: `Bearer <YOUR_JWT_TOKEN>`
     - **Important:** Replace `<YOUR_JWT_TOKEN>` with the actual token you copied from Step 1
     - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

   **Alternative: Using Postman's Authorization tab:**
   - Click on the **"Authorization"** tab
   - Select **"Bearer Token"** from the **Type** dropdown
   - Paste your JWT token in the **Token** field (without the "Bearer" prefix - Postman adds it automatically)
   - This method is recommended as it's cleaner and easier to manage

4. **Send the request:**
   - Click the **"Send"** button
   - You should receive a response with status `200 OK` containing your chat boxes:
     ```json
     {
       "success": true,
       "data": [
         {
           "group_id": 1,
           "group_name": "Japanese Learning Group",
           "icon_url": "https://example.com/icon.png",
           "latest_message": "こんにちは",
           "latest_message_time": "2024-01-15T10:30:00.000Z",
           "latest_message_sender": "John Doe",
           "unread_count": 3,
           "created_at": "2024-01-01T00:00:00.000Z"
         }
       ],
       "message": "Chat boxes retrieved successfully"
     }
     ```

### Step 3: Test Error Scenarios

#### Test 3.1: Missing Authorization Header

1. Create a new request or duplicate the "Get Chat Boxes" request
2. Remove the `Authorization` header (or set Authorization Type to "No Auth")
3. Send the request
4. **Expected Result:** Status `401 Unauthorized` with message:
   ```json
   {
     "statusCode": 401,
     "message": "Unauthorized",
     "error": "Unauthorized"
   }
   ```

#### Test 3.2: Invalid JWT Token

1. Use the "Get Chat Boxes" request
2. Set Authorization header to: `Bearer invalid_token_12345`
3. Send the request
4. **Expected Result:** Status `401 Unauthorized`

#### Test 3.3: Expired Token

1. Wait for your token to expire (or use an old token)
2. Try to use it in the "Get Chat Boxes" request
3. **Expected Result:** Status `401 Unauthorized`

### Step 4: Organize Requests in a Collection (Optional but Recommended)

1. **Create a Collection:**
   - Click **"New"** → **"Collection"**
   - Name it: `Chat Boxes API`

2. **Add requests to collection:**
   - Drag and drop your requests into the collection
   - Or right-click on requests → **"Add to Collection"** → Select your collection

3. **Set Collection Variables (Optional):**
   - Click on your collection → **"Variables"** tab
   - Add variables:
     - `base_url`: `http://localhost:3000`
     - `jwt_token`: (leave empty, will be set automatically)
   - Update your requests to use variables:
     - URL: `{{base_url}}/api/chat-boxes`
     - Authorization: `Bearer {{jwt_token}}`

4. **Auto-save token (Advanced):**
   - In the Login request, go to **"Tests"** tab
   - Add this script to automatically save the token:
     ```javascript
     if (pm.response.code === 200) {
         const jsonData = pm.response.json();
         pm.collectionVariables.set("jwt_token", jsonData.access_token);
         console.log("JWT token saved to collection variable");
     }
     ```
   - Now when you login, the token will be automatically saved and used in other requests

### Tips and Best Practices

1. **Save your requests:** Always save your requests so you can reuse them later

2. **Use Environment Variables:**
   - Create different environments for Development, Staging, and Production
   - Set `base_url` as an environment variable
   - Switch between environments easily

3. **Test Response Structure:**
   - Use Postman's **"Tests"** tab to write automated tests
   - Example test:
     ```javascript
     pm.test("Status code is 200", function () {
         pm.response.to.have.status(200);
     });
     
     pm.test("Response has success field", function () {
         const jsonData = pm.response.json();
         pm.expect(jsonData).to.have.property('success');
         pm.expect(jsonData.success).to.be.true;
     });
     
     pm.test("Response has data array", function () {
         const jsonData = pm.response.json();
         pm.expect(jsonData).to.have.property('data');
         pm.expect(jsonData.data).to.be.an('array');
     });
     ```

4. **Pretty Print JSON:**
   - Postman automatically formats JSON responses
   - Use the **"Pretty"** view to read responses easily

5. **Export Collection:**
   - Share your collection with team members
   - Click on collection → **"..."** → **"Export"**
   - Import in other Postman instances

### Troubleshooting

**Problem: Getting 401 Unauthorized even with valid token**
- Check that you're using `Bearer` prefix (with a space after it)
- Verify the token is complete (not truncated)
- Make sure the token hasn't expired
- Check server logs for authentication errors

**Problem: Connection refused or timeout**
- Verify your backend server is running
- Check the URL is correct (should be `http://localhost:3000` for local development)
- Verify firewall settings

**Problem: 404 Not Found**
- Check the endpoint URL is correct: `/api/chat-boxes`
- Verify the base URL matches your server configuration

**Problem: Empty data array**
- This is normal if the user is not a member of any groups
- Verify the user exists and has group memberships in the database

---

## Changelog

### Version 1.0.0 (Current)

**Initial Release**
- ✅ Get Chat Boxes endpoint (`GET /api/chat-boxes`)
- ✅ Get Chat Box Messages endpoint (`GET /api/chat-boxes/:groupId/messages`)
- ✅ Support for user-specific chat box retrieval
- ✅ Latest message information
- ✅ Retrieve 40 most recent messages from a chat box
- ✅ Unread message count tracking
- ✅ Automatic sorting by latest message time
- ✅ Member validation (users can only access messages from groups they belong to)

**Known Limitations:**
- No pagination support (all chat boxes returned in single request)
- No filtering or search capabilities
- No rate limiting

**Planned Features:**
- 🔄 Pagination support for large result sets
- 🔄 Filtering by group name or date range
- 🔄 Search functionality
- ✅ Authentication and authorization (JWT implemented)
- 🔄 Rate limiting
- 🔄 WebSocket support for real-time updates

---

## Support

For API support, please contact:

- **Email:** api-support@example.com
- **Documentation:** https://docs.example.com/api
- **Status Page:** https://status.example.com

---

## License

This API documentation is proprietary and confidential. Unauthorized distribution is prohibited.

---

**Last Updated:** January 2024  
**API Version:** 1.0.0

