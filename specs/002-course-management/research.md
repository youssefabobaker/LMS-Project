# Phase 0: Outline & Research

## Research Findings & Decisions

### 1. `multipart/form-data` Handling in Angular HttpClient
- **Decision**: Use native `FormData` API to construct requests for `POST` and `PUT` endpoints.
- **Rationale**: The backend `CourseController` expects `[FromForm]` which maps directly to HTTP `multipart/form-data`. Angular's `HttpClient` automatically sets the correct `Content-Type` boundary when passed a `FormData` object.
- **Alternatives considered**: Passing JSON with a Base64-encoded string. Rejected because the API explicitly defines `ImageFile` as a file upload field in multipart form requests.

### 2. Omitted Image on Update (PUT)
- **Decision**: Do not append the `ImageFile` key to the `FormData` object if the user has not selected a new file. Append the existing `imageUrl` string to the payload (or rely on the backend keeping it if the file is omitted).
- **Rationale**: As clarified in the specification (Option C), the existing `imageUrl` must be sent.
- **Alternatives considered**: Sending an empty file, which could result in the backend replacing the current image with a 0-byte file.

### 3. Instructor Assignment UX
- **Decision**: Implement the instructor assignment UI directly on the Course Card instead of in the Create/Edit form.
- **Rationale**: Required by the specification clarification. Instructors are independent lifecycle entities and are assigned via `POST /api/Course/{courseId}/users`.

### 4. Enums and Data Types
- **Decision**: Define `Semester` (1-3), `AcademicLevel` (1-5), and `AssessmentType` (0-5) as TypeScript Enums in the `course.ts` model.
- **Rationale**: Ensures strong typing on the frontend and maps perfectly to the integer values expected by the backend endpoints.
