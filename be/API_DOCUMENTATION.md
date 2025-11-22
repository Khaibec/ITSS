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
10. [Changelog](#changelog)

---

## Overview

The Chat Boxes API provides endpoints to retrieve and manage chat conversations for users in the Japanese learning platform. This API allows you to fetch a list of chat groups (conversations) that a user is a member of, along with relevant metadata such as latest messages, unread counts, and group information.

### Key Features

- Retrieve all chat boxes (conversations) for a specific user
- Get latest message information for each chat group
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
# Example: Get chat boxes for user ID 1
curl -X GET "https://api.example.com/api/chat-boxes?user_id=1" \
  -H "Content-Type: application/json"
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

Currently, the Chat Boxes API does not require authentication tokens. However, user identification is required through the `user_id` query parameter.

**Future Updates:** Authentication via Bearer tokens or API keys may be implemented in future versions. Please refer to the [Changelog](#changelog) for updates.

---

## API Endpoints

### Get Chat Boxes

Retrieves a list of all chat boxes (conversations) for a specific user. Each chat box represents a group conversation where the user is a member.

#### Endpoint

```
GET /api/chat-boxes
```

#### Request Parameters

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `user_id` | integer | Yes | Query | The unique identifier of the user. Must be a positive integer. |

#### Request Example

```bash
GET /api/chat-boxes?user_id=1
```

```javascript
// JavaScript (Fetch API)
const response = await fetch('https://api.example.com/api/chat-boxes?user_id=1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

```python
# Python (requests)
import requests

url = "https://api.example.com/api/chat-boxes"
params = {"user_id": 1}

response = requests.get(url, params=params)
data = response.json()
```

```curl
# cURL
curl -X GET "https://api.example.com/api/chat-boxes?user_id=1" \
  -H "Content-Type: application/json"
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

**400 Bad Request**

Invalid `user_id` parameter:

```json
{
  "statusCode": 400,
  "message": "Invalid user_id. Must be a positive integer.",
  "error": "Bad Request"
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

---

## Error Handling

### HTTP Status Codes

The API uses standard HTTP status codes to indicate the result of a request:

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `400 Bad Request` | Invalid request parameters |
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

#### Invalid user_id Format

**Request:**
```
GET /api/chat-boxes?user_id=abc
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid user_id. Must be a positive integer.",
  "error": "Bad Request"
}
```

#### Missing user_id Parameter

**Request:**
```
GET /api/chat-boxes
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid user_id. Must be a positive integer.",
  "error": "Bad Request"
}
```

#### Non-existent User

**Request:**
```
GET /api/chat-boxes?user_id=999999
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
- Handle null values for optional fields (`icon_url`, `latest_message`, etc.)

### 3. Data Validation

- Validate `user_id` on the client side before making requests
- Ensure `user_id` is a positive integer
- Handle empty data arrays gracefully

### 4. Performance Considerations

- The API automatically sorts results, so no client-side sorting is needed
- Unread counts are calculated server-side for accuracy
- Large numbers of chat boxes may require pagination in future versions

### 5. Example Implementation

```javascript
// Recommended client-side implementation
async function getChatBoxes(userId) {
  // Validate user_id
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Invalid user_id');
  }

  try {
    const response = await fetch(
      `https://api.example.com/api/chat-boxes?user_id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

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
const chatBoxes = await getChatBoxes(1);
chatBoxes.forEach(box => {
  console.log(`${box.group_name}: ${box.unread_count} unread`);
});
```

---

## Changelog

### Version 1.0.0 (Current)

**Initial Release**
- ✅ Get Chat Boxes endpoint (`GET /api/chat-boxes`)
- ✅ Support for user-specific chat box retrieval
- ✅ Latest message information
- ✅ Unread message count tracking
- ✅ Automatic sorting by latest message time

**Known Limitations:**
- No pagination support (all chat boxes returned in single request)
- No filtering or search capabilities
- No authentication required
- No rate limiting

**Planned Features:**
- 🔄 Pagination support for large result sets
- 🔄 Filtering by group name or date range
- 🔄 Search functionality
- 🔄 Authentication and authorization
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

