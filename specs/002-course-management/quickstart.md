# Quickstart Validation: Course Management

Follow these steps to perform a full smoke test of the Course Management feature once implemented:

## 1. Prerequisites
- The backend API must be running.
- You must be logged in as an Administrator with the following permissions:
  `Course:readAll`, `Course:add`, `Course:update`, `Course:delete`, `Course:enrollInstructor`, `Course:unenrollInstructor`.

## 2. Validation Flow

1. **Navigation**
   - Click "Course Management" in the sidebar.
   - **Expected**: The page loads with a "Create Course" button and a grid of course cards (or an empty state message).

2. **Create a Course**
   - Click "Create Course". The form should collapse down.
   - Fill in all fields: Title, Description, Semester, Credit Hours, Academic Level.
   - Select an image file.
   - Click "Save Course".
   - **Expected**: A success toast appears, the form closes, and the new course card appears in the grid.

3. **Toggle Status**
   - On the newly created course card, click the status badge/button.
   - **Expected**: A success toast appears and the badge visually flips from Active to Disabled (or Published to Unpublished) without a full page reload.

4. **Edit Course (Without new image)**
   - Click the "Edit" button on the course.
   - The form opens with the existing data.
   - Change the Title and Description. *Do not select a new image.*
   - Click "Save Course".
   - **Expected**: The card updates with the new text, and the image remains intact.

5. **Instructor Assignment**
   - Click "Assign Instructor" on the course card.
   - Provide a valid user ID (or select from a simulated dropdown).
   - **Expected**: The instructor appears on the course card.

6. **Remove Course**
   - Click the "Remove" button on the course card.
   - Confirm the SweetAlert2 dialog.
   - **Expected**: The card disappears from the grid immediately.
