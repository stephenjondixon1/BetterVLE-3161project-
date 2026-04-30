# BetterVLE REST API
A REST API for a Virtual Learning Environment (VLE) supporting course management, forums, assignments, calendar events, and course content delivery.

## Tech Stack

- Node.js with Express
- MySQL 
- JWT for authentication

Authorization: Bearer <your_token_here>

### Login request
`POST /api/auth/login`

```json
{
  "user_name": "admin1",
  "password": "admin123"
}
```

## Main endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Courses
- `GET /api/courses`
- `POST /api/courses`
- `POST /api/courses/:courseCode/assign-lecturer`
- `POST /api/courses/:courseCode/register`
- `GET /api/courses/:courseCode/members`
- `GET /api/courses/students/:studentId`
- `GET /api/courses/lecturers/:lecturerId`

### Calendar
- `GET /api/calendar/courses/:courseCode/events`
- `POST /api/calendar/courses/:courseCode/events`
- `GET /api/calendar/students/:studentId/events?date=YYYY-MM-DD`

### Forums
- `GET /api/forums/courses/:courseCode/forums`
- `POST /api/forums/courses/:courseCode/forums`
- `GET /api/forums/forums/:forumId/threads`
- `POST /api/forums/forums/:forumId/threads`
- `GET /api/forums/threads/:threadId/replies`
- `POST /api/forums/threads/:threadId/replies`

### Course content
- `GET /api/content/courses/:courseCode/content`
- `POST /api/content/courses/:courseCode/sections`
- `POST /api/content/sections/:sectionId/links`
- `POST /api/content/sections/:sectionId/slides`
- `POST /api/content/sections/:sectionId/files`

### Assignments
- `POST /api/assignments/courses/:courseCode/assignments`
- `POST /api/assignments/assignments/:assignmentId/submissions`
- `PUT /api/assignments/assignments/:assignmentId/submissions/:studentId/grade`
- `GET /api/assignments/students/:studentId/submissions`

### Reports
- `GET /api/reports/courses-50-plus`
- `GET /api/reports/students-5-plus`
- `GET /api/reports/lecturers-3-plus`
- `GET /api/reports/top-10-courses`
- `GET /api/reports/top-10-students`

## Demo flow for Postman

1. Login as admin
2. Create a course
3. Assign a lecturer to the course
4. Login as a student
5. Register the student for the course
6. Retrieve student courses
7. Create a forum
8. Create a thread
9. Reply to the thread
10. Create a calendar event
11. Create a section
12. Add a link / slide / file
13. Create an assignment
14. Submit assignment
15. Grade submission
16. Open the reports endpoints

