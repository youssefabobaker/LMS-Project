# API Contracts: Course Management

## Base URL
`/api/Course`

## Endpoints

### 1. Get All Courses
- **Method**: `GET`
- **Path**: `/api/Course`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "title": "Algorithms",
      "description": "Study of algorithms",
      "imageUrl": "https://cdn.example.com/algo.jpg",
      "semster": 1,
      "credit_Hour": 3,
      "isPublished": true,
      "learningOutcomes": "Understand sorting",
      "academicLevel": 3
    }
  ]
  ```

### 2. Create Course
- **Method**: `POST`
- **Path**: `/api/Course`
- **Headers**: `Authorization: Bearer <token>` (Browser auto-sets `multipart/form-data` boundary)
- **Body (`FormData`)**:
  - `title` (text)
  - `description` (text)
  - `semster` (number)
  - `credit_Hour` (number)
  - `academicLevel` (number)
  - `learningOutcomes` (text, optional)
  - `ImageFile` (File, optional)
- **Response**: `201 Created`

### 3. Update Course
- **Method**: `PUT`
- **Path**: `/api/Course/{id}`
- **Headers**: `Authorization: Bearer <token>` 
- **Body (`FormData`)**:
  - `id` (number)
  - `title` (text)
  - `description` (text)
  - `semster` (number)
  - `credit_Hour` (number)
  - `academicLevel` (number)
  - `imageUrl` (text, send existing if no file)
  - `ImageFile` (File, only if a new image is selected)
- **Response**: `200 OK`

### 4. Delete Course
- **Method**: `DELETE`
- **Path**: `/api/Course/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### 5. Toggle Status
- **Method**: `PUT`
- **Path**: `/api/Course/{id}/Toggle_Status`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### 6. Enroll / Unenroll Instructor
- **Enroll (POST)**: `/api/Course/{id}/users`
  - Body: `{ "userId": "guid" }`
  - Response: `201 Created`
- **Unenroll (DELETE)**: `/api/Course/{id}/users/{userId}`
  - Response: `204 No Content`
- **Get Enrolled (GET)**: `/api/Course/{id}/users`
  - Response: `200 OK` array of `EnrolledUser`
