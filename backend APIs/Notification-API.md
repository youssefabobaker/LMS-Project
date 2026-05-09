# Notification API

Base URL: `/api/notification`

> **Authentication Required:** All endpoints require a valid Bearer token (`Authorization: Bearer <token>`).

---

## Endpoints

### 1. Get My Notifications

Retrieves the notification inbox for the currently authenticated user, including an unread count and the list of notifications.

**`GET /api/notification`**

#### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| *(none)* | — | — | — | User identity is resolved from the JWT token. |

#### Response `200 OK`

```json
{
  "id": 1,
  "unreadCount": 3,
  "notifications": [
    {
      "id": 101,
      "title": "New Assignment Posted",
      "message": "A new assignment has been added to your course.",
      "isRead": false,
      "createdAt": "2026-05-08T10:30:00Z"
    },
    {
      "id": 102,
      "title": "Quiz Graded",
      "message": "Your quiz has been graded. Check your results.",
      "isRead": true,
      "createdAt": "2026-05-07T08:00:00Z"
    }
  ]
}
```

#### Response Schema

**`NotificationBoxResponse`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Notification box ID |
| `unreadCount` | `integer` | Number of unread notifications |
| `notifications` | `NotificationResponse[]` | List of notifications |

**`NotificationResponse`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Unique notification ID |
| `title` | `string` | Short notification title |
| `message` | `string` | Full notification body text |
| `isRead` | `boolean` | Whether the notification has been read |
| `createdAt` | `string (ISO 8601)` \| `null` | Timestamp the notification was created |

---

### 2. Mark Notification as Read

Marks a single notification as read for the currently authenticated user.

**`PUT /api/notification/{notificationId}/read`**

#### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `notificationId` | Path | `integer` | Yes | ID of the notification to mark as read |

#### Response `204 No Content`

No response body.

---

### 3. Mark All Notifications as Read

Marks **all** notifications as read for the currently authenticated user.

**`PUT /api/notification/read-all`**

#### Request

No parameters required. User identity is resolved from the JWT token.

#### Response `204 No Content`

No response body.

---

### 4. Delete Notification

Permanently deletes a specific notification for the currently authenticated user.

**`DELETE /api/notification/{notificationId}`**

#### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `notificationId` | Path | `integer` | Yes | ID of the notification to delete |

#### Response `204 No Content`

No response body.

---

## Error Responses

| Status Code | Description |
|-------------|-------------|
| `401 Unauthorized` | Missing or invalid Bearer token |
| `404 Not Found` | Notification not found or does not belong to the current user |

---

## Example Usage

```js
// GET all notifications
const res = await fetch('/api/notification', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();
// data.unreadCount → number of unread notifications
// data.notifications → array of notification objects

// Mark a single notification as read
await fetch('/api/notification/101/read', {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` }
});

// Mark all notifications as read
await fetch('/api/notification/read-all', {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` }
});

// Delete a notification
await fetch('/api/notification/101', {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});
```
