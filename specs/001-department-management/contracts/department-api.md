# API Contracts: Department Management

**Feature**: `001-department-management`
**Base URL**: `https://localhost:7289/api/Department`
**Auth**: Bearer JWT — `Authorization: Bearer <token>`
**Note**: Server-side auth enforcement is currently disabled on this controller.
The frontend MUST enforce permissions via `PermissionService` as a safety layer.

---

## 1. Get All Departments

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/Department` |
| **Permission** | `dept:read` (frontend guard) |
| **Angular method** | `DepartmentService.getDepartments()` |

### Response `200 OK`

```json
[
  { "id": 1, "title": "Computer Science" },
  { "id": 2, "title": "Software Engineering" }
]
```

### Error Responses

| Status | Trigger |
|--------|---------|
| `500` | Server error — show error toast + retry button |

---

## 2. Create Department

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/Department` |
| **Content-Type** | `application/json` |
| **Permission** | `dept:add` (frontend guard) |
| **Angular method** | `DepartmentService.createDepartment(data)` |

### Request Body

```json
{ "title": "Cybersecurity" }
```

### Response `201 Created`

```json
{ "id": 3, "title": "Cybersecurity" }
```

### Error Responses

| Status | Trigger | UI Behavior |
|--------|---------|------------|
| `400` | Validation failed | SweetAlert2 error toast |
| `409` | Title already exists | SweetAlert2 error toast ("Department already exists") |

---

## 3. Update Department

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/Department/{id}` |
| **Content-Type** | `application/json` |
| **Permission** | `dept:update` (frontend guard) |
| **Angular method** | `DepartmentService.updateDepartment(id, data)` |

### Request Body

```json
{ "title": "Updated Department Name" }
```

### Response `200 OK`

```json
{}
```

### Error Responses

| Status | Trigger | UI Behavior |
|--------|---------|------------|
| `400` | Validation failed | SweetAlert2 error toast |
| `404` | Department not found | SweetAlert2 error toast; reset form |
| `409` | Title already exists | SweetAlert2 error toast |

---

## 4. Delete Department (Soft Delete = Remove from List)

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/Department/{id}` |
| **Permission** | `dept:delete` (frontend guard) |
| **Angular method** | `DepartmentService.deleteDepartment(id)` |
| **Pre-condition** | SweetAlert2 confirmation dialog MUST be shown and confirmed |
| **Note** | Soft delete — record is not physically removed on the backend |

### Response `200 OK`

```json
{}
```

### Error Responses

| Status | Trigger | UI Behavior |
|--------|---------|------------|
| `404` | Department not found | SweetAlert2 error toast; row stays |
| `500` | Server error | SweetAlert2 error toast; row stays |

---

## Frontend Permission Map

| UI Control | Required Permission |
|------------|-------------------|
| View department table | `dept:read` |
| "Create New Department" button | `dept:add` |
| Edit icon button (per row) | `dept:update` |
| Remove icon button (per row) | `dept:delete` |
