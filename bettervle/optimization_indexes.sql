
-- To demonstrate the improvement:
--   EXPLAIN SELECT * FROM enroll WHERE course_code = 'COMP0001';
--   (before: type=ALL, rows=400k+ | after: type=ref, rows=~2k)
-- ============================================================

USE betterVLE;

-- =====================
-- USERS
-- =====================
-- Login query does: WHERE u.user_name = ?
-- user_name has a UNIQUE constraint so it already has an index. ✓ No action needed.

-- =====================
-- ACCOUNTS
-- =====================
-- Login JOIN: accounts a ON a.user_id = u.user_id
-- FK on user_id already creates an index. ✓ No action needed.

-- =====================
-- ENROLL (biggest table, ~400k+ rows — most impactful)
-- =====================
CREATE INDEX idx_enroll_course_code ON enroll(course_code);

CREATE INDEX idx_enroll_course_student ON enroll(course_code, student_id);

CREATE INDEX idx_enroll_student_grade ON enroll(student_id, grade);

CREATE INDEX idx_teaches_course_code ON teaches(course_code);

CREATE INDEX idx_calendar_course_date ON calendar_events(course_code, event_date);
-- Upcoming events query filters by event_date range:
CREATE INDEX idx_calendar_event_date ON calendar_events(event_date);

CREATE INDEX idx_assignment_course_weight ON assignment(course_code, weight);

CREATE INDEX idx_submits_assign_id ON submits(assign_id);
-- Filtering graded submissions for weighted average:
CREATE INDEX idx_submits_student_grade ON submits(student_id, submission_grade);

-- Content retrieval orders by section_num:
CREATE INDEX idx_section_course_num ON section(course_code, section_num);

-- Threads are ordered by created_at DESC:
CREATE INDEX idx_thread_forum_created ON discussion_thread(forum_id, created_at);

-- =====================
-- REPLIES
-- =====================
-- FK on thread_id already indexed. ✓
-- Replies are ordered by created_at ASC:
CREATE INDEX idx_replies_thread_created ON replies(thread_id, created_at);



-- ============================================================
-- VERIFICATION QUERIES (run these to confirm indexes exist)
-- ============================================================
-- SHOW INDEX FROM enroll;
-- SHOW INDEX FROM teaches;
-- SHOW INDEX FROM calendar_events;
-- SHOW INDEX FROM submits;
-- SHOW INDEX FROM discussion_thread;
-- SHOW INDEX FROM replies;
--
-- PERFORMANCE TEST (run before and after to show improvement):
-- EXPLAIN SELECT c.course_code, c.course_title, COUNT(e.student_id)
--   FROM enroll e JOIN courses c ON e.course_code = c.course_code
--   GROUP BY c.course_code, c.course_title
--   HAVING COUNT(e.student_id) >= 50;
-- ============================================================
