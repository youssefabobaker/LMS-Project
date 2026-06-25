# Quiz & Question API Documentation

> **Base URL:** `https://<host>/api`  
> **Auth:** All endpoints require a valid **Bearer JWT token** in the `Authorization` header.  
> **Content-Type:** `application/json`

---

## Table of Contents

- [Quiz Controller](#quiz-controller)
  - [GET – Get All Quizzes for a Course](#1-get-all-quizzes-for-a-course)
  - [GET – Get Quiz by ID (with Questions)](#2-get-quiz-by-id-with-questions)
  - [POST – Create or Update Quiz](#3-create-or-update-quiz)
  - [DELETE – Delete Quiz](#4-delete-quiz)
  - [PATCH – Toggle Quiz Active Status](#5-toggle-quiz-active-status)
- [Question Controller](#question-controller)
  - [POST – Add Question to Quiz](#6-add-question-to-quiz)
  - [POST – Toggle Question Active Status](#7-toggle-question-active-status)
  - [POST – Update Question](#8-update-question)
- [Shared Schemas](#shared-schemas)

---

## Quiz Controller

Base route: `/api/Quiz`

---

### 1. Get All Quizzes for a Course

Retrieves a summary list of quizzes for the given course.

> **🔒 Role behaviour:**  
> - **Students** → only quizzes where `isActive = true` are returned.  
> - **all except Students** → all quizzes (active and inactive) are returned.

```
GET /api/Quiz/course/{courseId}
```

#### Path Parameters

| Parameter  | Type  | Required | Description          |
|------------|-------|----------|----------------------|
| `courseId` | `int` | ✅       | ID of the course     |

#### Required Permission
`Quiz:read`

#### Success Response `200 OK`

```json
[
  {
    "id": 1,
    "title": "Midterm Exam",
    "scheduledDate": "2026-06-25T10:00:00",
    "duration": "01:30:00",
    "description": "Covers chapters 1-5",
    "quizCode": "A3F9BC12"
  }
]
```

| Field           | Type       | Description                                      |
|----------------|------------|--------------------------------------------------|
| `id`           | `int`      | Quiz ID                                          |
| `title`        | `string`   | Quiz title                                       |
| `scheduledDate`| `datetime` | Scheduled date/time (ISO 8601 UTC)               |
| `duration`     | `string`   | Duration in `HH:mm:ss` format                   |
| `description`  | `string`   | Short description                                |
| `quizCode`     | `string`   | 8-character unique code students use to enter the quiz |

---

### 2. Get Quiz by ID (with Questions)

Returns the full details of a single quiz including all its questions and choices.

```
GET /api/Quiz/{id}
```

#### Path Parameters

| Parameter | Type  | Required | Description   |
|-----------|-------|----------|---------------|
| `id`      | `int` | ✅       | ID of the quiz |

#### Required Permission
`questions:read`

#### Success Response `200 OK`

```json
{
  "id": 1,
  "title": "Midterm Exam",
  "description": "Covers chapters 1-5",
  "scheduledDate": "2026-06-25T10:00:00",
  "duration": "01:30:00",
  "totalMarks": 100.0,
  "isActive": true,
  "quizCode": "A3F9BC12",
  "courseId": 3,
  "quizQuestions": [
    {
      "id": 10,
      "isActive": true,
      "questionText": "What is polymorphism?",
      "questionType": "MultipleChoice",
      "isAllowableToLookDown": false,
      "questionChoices": [
        { "id": 1, "choiceText": "A design pattern", "isCorrect": false },
        { "id": 2, "choiceText": "Many forms of a method", "isCorrect": true },
        { "id": 3, "choiceText": "A type of loop", "isCorrect": false }
      ]
    }
  ]
}
```

| Field                 | Type       | Description                                           |
|-----------------------|------------|-------------------------------------------------------|
| `id`                  | `int`      | Quiz ID                                               |
| `title`               | `string`   | Quiz title                                            |
| `description`         | `string`   | Quiz description                                      |
| `scheduledDate`       | `datetime` | Scheduled date/time (ISO 8601 UTC)                    |
| `duration`            | `string`   | Duration in `HH:mm:ss` format                         |
| `totalMarks`          | `double`   | Total marks for the quiz                              |
| `isActive`            | `bool`     | Whether the quiz is currently active                  |
| `quizCode`            | `string`   | 8-character unique code for the quiz                  |
| `courseId`            | `int`      | ID of the owning course                               |
| `quizQuestions`       | `array`    | List of questions (see [QuestionResponseDto](#questionresponsedto)) |

---

### 3. Create or Update Quiz

Creates a new quiz **or** updates an existing one, both under a specific course.

- **Omit `id` (or set to `null`)** → creates a new quiz.  
- **Include a valid `id`** → updates that existing quiz. A new `quizCode` is generated on update.

```
POST /api/Quiz/course/{courseId}
```

#### Path Parameters

| Parameter  | Type  | Required | Description        |
|------------|-------|----------|--------------------|
| `courseId` | `int` | ✅       | ID of the course   |

#### Required Permission
`Quiz:addOrUpdate`

#### Request Body

```json
{
  "id": null,
  "title": "Final Exam",
  "description": "Full semester coverage",
  "scheduledDate": "2026-07-10T09:00:00",
  "duration": "02:00:00",
  "totalMarks": 100.0,
  "isActive": true
}
```

| Field          | Type       | Required | Description                                    |
|----------------|------------|----------|------------------------------------------------|
| `id`           | `int?`     | ❌       | Omit or `null` to create; provide to update    |
| `title`        | `string`   | ✅       | Quiz title                                     |
| `description`  | `string`   | ✅       | Quiz description                               |
| `scheduledDate`| `datetime` | ✅       | ISO 8601 UTC datetime                          |
| `duration`     | `string`   | ✅       | `HH:mm:ss` format (e.g. `"01:30:00"`)          |
| `totalMarks`   | `double`   | ✅       | Total marks                                    |
| `isActive`     | `bool`     | ✅       | Active state                                   |

#### Success Response `200 OK`

Returns a [QuizResponseDto](#quizresponsedto) (summary, without questions list).

---

### 4. Delete Quiz

Permanently deletes a quiz and invalidates cached quiz data.

```
DELETE /api/Quiz/{id}
```

#### Path Parameters

| Parameter | Type  | Required | Description    |
|-----------|-------|----------|----------------|
| `id`      | `int` | ✅       | ID of the quiz |

#### Required Permission
`Quiz:delete`

#### Success Response `200 OK`

```json
"Done"
```

---

### 5. Toggle Quiz Active Status

Flips the `isActive` field of a quiz (`true → false` or `false → true`) and invalidates all cached quiz data.

```
PATCH /api/Quiz/{id}/toggle-active
```

#### Path Parameters

| Parameter | Type  | Required | Description    |
|-----------|-------|----------|----------------|
| `id`      | `int` | ✅       | ID of the quiz |

#### Required Permission
`Quiz:addOrUpdate`

#### Request Body
None.

#### Success Response `200 OK`

```json
{
  "isActive": false
}
```

| Field      | Type   | Description                        |
|------------|--------|------------------------------------|
| `isActive` | `bool` | The **new** state after the toggle |

---

## Question Controller

> **⚠️ Note:** The `QuestionController` uses absolute route paths (not relative to `/api/Question`). The exact routes are listed below.

---

### 6. Add Question to Quiz

Creates a new question (with its choices) and attaches it to the specified quiz.

```
POST /Quiz/{quizId}
```

#### Path Parameters

| Parameter | Type  | Required | Description            |
|-----------|-------|----------|------------------------|
| `quizId`  | `int` | ✅       | ID of the target quiz  |

#### Required Permission
`questions:add`

#### Request Body

```json
{
  "id": 0,
  "questionText": "What does OOP stand for?",
  "questionType": 0,
  "marks": 5.0,
  "correctAnswerIndex": 2,
  "isAllowableToLookDown": false,
  "questionChoices": [
    "Object Oriented Pattern",
    "Oriented Object Programming",
    "Object Oriented Programming",
    "None of the above"
  ]
}
```

| Field                   | Type           | Required | Description                                          |
|------------------------|----------------|----------|------------------------------------------------------|
| `id`                   | `int`          | ✅       | Set to `0` when creating a new question              |
| `questionText`         | `string`       | ✅       | The question text                                    |
| `questionType`         | `int`          | ✅       | `0` = MultipleChoice, `1` = TrueFalse                |
| `marks`                | `double`       | ✅       | Points allocated to this question                    |
| `correctAnswerIndex`   | `int`          | ✅       | Zero-based index of the correct choice in `questionChoices` |
| `isAllowableToLookDown`| `bool`         | ✅       | `true` if student is allowed to look down (e.g. math) |
| `questionChoices`      | `string[]`     | ✅       | List of answer choice texts                          |

#### Success Response `200 OK`

Returns a [QuestionResponseDto](#questionresponsedto).

---

### 7. Toggle Question Active Status

Flips the `isActive` state of a specific question within a quiz.

```
POST /ToggleStatus/QuizId/{quizId}/QuestionId{questionId}
```

#### Path Parameters

| Parameter    | Type  | Required | Description              |
|--------------|-------|----------|--------------------------|
| `quizId`     | `int` | ✅       | ID of the quiz           |
| `questionId` | `int` | ✅       | ID of the question       |

#### Required Permission
`questions:update`

#### Request Body
None.

#### Success Response `200 OK`

Returns a [QuestionResponseDto](#questionresponsedto) reflecting the new state.

---

### 8. Update Question

Updates an existing question's text, type, marks, choices, etc.

```
POST /Update/QuizId/{quizId}
```

#### Path Parameters

| Parameter | Type  | Required | Description          |
|-----------|-------|----------|----------------------|
| `quizId`  | `int` | ✅       | ID of the owning quiz |

#### Required Permission
`questions:update`

#### Request Body

Same shape as [Add Question](#6-add-question-to-quiz). Provide the existing `id` of the question to update:

```json
{
  "id": 10,
  "questionText": "What does OOP stand for? (updated)",
  "questionType": 0,
  "marks": 10.0,
  "correctAnswerIndex": 2,
  "isAllowableToLookDown": false,
  "questionChoices": [
    "Object Oriented Pattern",
    "Oriented Object Programming",
    "Object Oriented Programming",
    "None of the above"
  ]
}
```

#### Success Response `200 OK`

Returns a [QuestionResponseDto](#questionresponsedto) with updated values.

---

## Shared Schemas

### QuizResponseDto

Returned by **list** and **create/update** endpoints (no questions list).

```json
{
  "id": 1,
  "title": "Midterm Exam",
  "scheduledDate": "2026-06-25T10:00:00",
  "duration": "01:30:00",
  "description": "Covers chapters 1-5",
  "quizCode": "A3F9BC12"
}
```

---

### QuizResponseInDetailsDto

Returned by the **Get Quiz by ID** endpoint.

```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "scheduledDate": "2026-06-25T10:00:00",
  "duration": "01:30:00",
  "totalMarks": 100.0,
  "isActive": true,
  "quizCode": "A3F9BC12",
  "courseId": 3,
  "quizQuestions": [ /* QuestionResponseDto[] */ ]
}
```

---

### QuestionResponseDto

```json
{
  "id": 10,
  "isActive": true,
  "questionText": "What is polymorphism?",
  "questionType": "MultipleChoice",
  "isAllowableToLookDown": false,
  "questionChoices": [
    { "id": 1, "choiceText": "A design pattern", "isCorrect": false },
    { "id": 2, "choiceText": "Many forms of a method", "isCorrect": true }
  ]
}
```

| Field                   | Type     | Description                                        |
|------------------------|----------|----------------------------------------------------|
| `id`                   | `int`    | Question ID                                        |
| `isActive`             | `bool`   | Whether the question is active                     |
| `questionText`         | `string` | The question text                                  |
| `questionType`         | `string` | `"MultipleChoice"` or `"TrueFalse"`                |
| `isAllowableToLookDown`| `bool`   | Whether looking down is permitted for this question |
| `questionChoices`      | `array`  | List of [QuestionChoiceResponseDto](#questionchoiceresponsedto) |

---

### QuestionChoiceResponseDto

```json
{
  "id": 1,
  "choiceText": "Many forms of a method",
  "isCorrect": true
}
```

| Field        | Type     | Description                              |
|-------------|----------|------------------------------------------|
| `id`        | `int`    | Choice ID                                |
| `choiceText`| `string` | The answer choice text                   |
| `isCorrect` | `bool`   | Whether this choice is the correct answer |

---

## Error Responses

All endpoints follow a consistent error shape:

```json
{
  "statusCode": 404,
  "errorMessage": "Quiz with this Id : 99 is Not Found"
}
```

| Status | Meaning                                      |
|--------|----------------------------------------------|
| `400`  | Bad request / validation failure             |
| `401`  | Unauthorized – missing or invalid JWT        |
| `403`  | Forbidden – insufficient permission          |
| `404`  | Resource not found                           |
| `409`  | Conflict (e.g. duplicate attempt)            |
| `500`  | Internal server error                        |
