# Cheating Report & Quiz Attempts API Documentation

> **Base URL:** `https://{your-domain}/api`
> **Authentication:** All endpoints require a valid JWT Bearer token.
> Add the header: `Authorization: Bearer {token}`

---

## Table of Contents

1. [Quiz Attempts Controller](#quiz-attempts-controller) — `/api/quiz-attempts`
   - [Get All Attempts for a Quiz (with Details)](#1-get-all-attempts-for-a-quiz-with-details)

2. [Cheating Report Controller](#cheating-report-controller) — `/api/cheating-report`
   - [Get Cheating Report by Attempt](#1-get-cheating-report-by-attempt)
   - [Delete Report](#2-delete-report)
   - [Delete Violation](#3-delete-violation)
   - [Get Risk Assessment Result](#4-get-risk-assessment-result)

---

### 1. Get All Attempts for a Quiz (with Details)

Returns **all submitted attempts** for a specific quiz by its ID. Each attempt includes the student's full name, score, and a complete per-question answer breakdown. Intended for instructors and admins.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/quiz-attempts/quizzes/{quizId}/attempts` |
| **Auth** | permission: `Quiz:addOrUpdate` |

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `quizId` | `int` | The database ID of the quiz |

#### Success Response — `200 OK`

```json
[
  {
    "attemptId": 12,
    "studentId": "abc-123",
    "studentFullName": "Ahmed Ali",
    "score": 7,
    "submittedAt": "2026-06-19T18:00:00Z",
    "studentAnswers": [
      {
        "questionText": "What is the capital of France?",
        "studentChoice": "Paris",
        "correctChoice": "Paris",
        "isCorrect": true
      },
      {
        "questionText": "What is 2 + 2?",
        "studentChoice": "3",
        "correctChoice": "4",
        "isCorrect": false
      }
    ]
  }
]
```

---

## Cheating Report Controller

**Base path:** `/api/cheating-report`

> All endpoints in this controller require the `GetCheatingReport`, `AddCheatingReport`, or `DeleteCheatingReport` permission claim depending on the operation.

---

### 1. Get Cheating Report by Attempt

Returns the cheating report for a specific quiz attempt, including the student's identity and all recorded violations.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/cheating-report/attempt/{attemptId}` |
| **Auth** | Required (`CheatingReport:read` permission) |

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `attemptId` | `int` | The quiz attempt ID |

#### Success Response — `200 OK`

```json
{
  "id": 3,
  "quizAttemptId": 12,
  "studentId": "abc-123",
  "studentName": "Ahmed Ali",
  "violations": [
    {
      "id": 7,
      "description": "Looking away from screen",
      "evidenceUrl": "https://storage.example.com/evidence/7.jpg",
      "timestamp": "2026-06-19T18:10:00Z"
    }
  ]
}
```

> **Note:** Save the `id` field (Cheating Report ID) — it is needed for fetching the Risk Assessment Result.

#### Error Responses

| Status | Reason |
|---|---|
| `404 Not Found` | No cheating report exists for this attempt |
| `403 Forbidden` | Missing `GetCheatingReport` permission |

---

### 2. Delete Report

Permanently deletes a cheating report and all its associated violations.

| Property | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/cheating-report/{reportId}` |
| **Auth** | Required (`CheatingReport:delete` permission) |

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `reportId` | `int` | The cheating report ID to delete |

#### Success Response — `204 No Content`

#### Error Responses

| Status | Reason |
|---|---|
| `404 Not Found` | Report not found |

---

### 3. Delete Violation

Permanently deletes a single violation from a cheating report.

| Property | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/cheating-report/violations/{violationId}` |
| **Auth** | Required (`CheatingReport:delete` permission) |

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `violationId` | `int` | The violation ID to delete |

#### Success Response — `204 No Content`

#### Error Responses

| Status | Reason |
|---|---|
| `404 Not Found` | Violation not found |

---

### 4. Get Risk Assessment Result

Returns the full AI-calculated risk assessment for a cheating report, including a per-question breakdown comparing the student's risk score against the cohort average.

> **Prerequisites:** The risk analysis job must have completed (submitted via `POST /api/risk-analysis`). The result may be `404` if the background job has not finished yet.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/cheating-report/{reportId}/risk-assessment` |
| **Auth** | Required (`CheatingReport:read` permission) |

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `reportId` | `int` | The cheating report ID |

#### Success Response — `200 OK`

```json
{
  "id": 1,
  "studentId": "abc-123",
  "attemptId": 12,
  "cheatingReportId": 3,
  "sessionViolationRate": 0.25,
  "overallSessionRiskScore": 0.78,
  "questions": [
    {
      "questionId": 101,
      "studentRiskScore": 0.85,
      "cohortAvgRiskScore": 0.40
    },
    {
      "questionId": 102,
      "studentRiskScore": 0.60,
      "cohortAvgRiskScore": 0.55
    }
  ]
}
```

#### Response Field Reference

| Field | Type | Description |
|---|---|---|
| `sessionViolationRate` | `double` | Raw violation rate from the proctoring session (0–1) |
| `overallSessionRiskScore` | `decimal` | Final normalized, weighted risk score for the entire session |
| `questions[].studentRiskScore` | `decimal` | This student's normalized risk score for the question |
| `questions[].cohortAvgRiskScore` | `decimal` | Average risk score across all students who answered this question (benchmark) |

#### Error Responses

| Status | Reason |
|---|---|
| `404 Not Found` | Risk assessment not yet computed or report not found |

---

## Common Workflow Examples

### Instructor: Review a student's full exam performance

```
1. GET /api/quiz-attempts/quizzes/{quizId}/attempts
   → Find the attemptId for the target student

2. GET /api/quiz-attempts/attempts/{attemptId}/details
   → View full answer breakdown (correct/incorrect per question)

3. GET /api/cheating-report/attempt/{attemptId}
   → Get the cheating report and save the report `id`

4. GET /api/cheating-report/{reportId}/risk-assessment
   → View the AI risk scores per question vs. cohort average
```

### Proctoring App: Submit session data

```
1. POST /api/cheating-report/attempt/{attemptId}
   → Create an empty report at session start

2. POST /api/cheating-report/{reportId}/violations  (repeat per event)
   → Add each violation as it occurs during the exam

3. POST /api/risk-analysis
   → Submit final raw data; triggers background risk score calculation
```
