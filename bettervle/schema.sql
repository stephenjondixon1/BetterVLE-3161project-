-- Creating the database 
DROP DATABASE IF EXISTS betterVLE;

CREATE DATABASE betterVLE;

USE betterVLE;

CREATE TABLE
    users (
        user_id INT UNIQUE PRIMARY KEY AUTO_INCREMENT NOT NULL,
        user_name VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );

CREATE TABLE
    accounts (
        acc_id INT UNIQUE PRIMARY KEY AUTO_INCREMENT NOT NULL,
        acc_role ENUM ("student", "lecturer", "admin"),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

CREATE TABLE
    admin (
        admin_id INT UNIQUE PRIMARY KEY NOT NULL,
        admin_name VARCHAR(255) NOT NULL,
        admin_email VARCHAR(255) NOT NULL,
        FOREIGN KEY (admin_id) REFERENCES users (user_id)
    );

CREATE TABLE
    courses (
        course_code VARCHAR(20) NOT NULL PRIMARY KEY,
        course_title VARCHAR(100) NOT NULL,
        created_by INT NOT NULL,
        FOREIGN KEY (created_by) REFERENCES admin (admin_id)
    );

CREATE TABLE
    student (
        student_id INT UNIQUE PRIMARY KEY NOT NULL,
        sf_name VARCHAR(255) NOT NULL,
        sl_name VARCHAR(255) NOT NULL,
        major VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        gpa DECIMAL(3, 2) NOT NULL,
        CHECK (
            gpa >= 0.00
            AND gpa <= 4.30
        ),
        FOREIGN KEY (student_id) REFERENCES users (user_id)
    );

CREATE TABLE
    enroll (
        student_id INT NOT NULL,
        course_code VARCHAR(20) NOT NULL,
        grade INT,
        PRIMARY KEY (student_id, course_code),
        FOREIGN KEY (student_id) REFERENCES student (student_id),
        FOREIGN KEY (course_code) REFERENCES courses (course_code)
    );

CREATE TABLE
    lecturer (
        lecturer_id INT UNIQUE PRIMARY KEY NOT NULL,
        lf_name VARCHAR(255) NOT NULL,
        ll_name VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        FOREIGN KEY (lecturer_id) REFERENCES users (user_id)
    );

CREATE TABLE
    teaches (
        lecturer_id INT,
        course_code VARCHAR(20),
        PRIMARY KEY (lecturer_id, course_code),
        FOREIGN KEY (lecturer_id) REFERENCES lecturer (lecturer_id),
        FOREIGN KEY (course_code) REFERENCES courses (course_code)
    );

CREATE TABLE
    calendar_events (
        event_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        course_code VARCHAR(20) NOT NULL,
        title VARCHAR(100) NOT NULL,
        event_details TEXT,
        event_date DATE NOT NULL,
        FOREIGN KEY (course_code) REFERENCES courses (course_code)
    );

CREATE TABLE
    assignment (
        assign_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        weight DECIMAL(5, 2) NOT NULL,
        course_code VARCHAR(20) NOT NULL,
        FOREIGN KEY (course_code) REFERENCES courses (course_code)
    );

CREATE TABLE
    submits (
        student_id INT NOT NULL,
        assign_id INT NOT NULL,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submission_content TEXT,
        submission_grade DECIMAL(5, 2),
        PRIMARY KEY (student_id, assign_id),
        FOREIGN KEY (student_id) REFERENCES student (student_id),
        FOREIGN KEY (assign_id) REFERENCES assignment (assign_id)
    );

CREATE TABLE
    section (
        section_id INT PRIMARY KEY AUTO_INCREMENT,
        section_num INT NOT NULL,
        course_code VARCHAR(20) NOT NULL,
        FOREIGN KEY (course_code) REFERENCES courses (course_code)
    );

CREATE TABLE
    section_item (
        item_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        item_name VARCHAR(100) NOT NULL,
        section_id INT NOT NULL,
        FOREIGN KEY (section_id) REFERENCES section (section_id)
    );

CREATE TABLE
    link (
        link_id INT NOT NULL PRIMARY KEY,
        link_name VARCHAR(100) NOT NULL,
        url VARCHAR(500) NOT NULL,
        FOREIGN KEY (link_id) REFERENCES section_item (item_id)
    );

CREATE TABLE
    lecture_slide (
        slide_num INT NOT NULL PRIMARY KEY,
        slideset_name VARCHAR(100) NOT NULL,
        slide_url VARCHAR(500) NOT NULL,
        FOREIGN KEY (slide_num) REFERENCES section_item (item_id)
    );

CREATE TABLE
    discussion_forum (
        forum_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        created_by INT NOT NULL,
        course_code VARCHAR(20) NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users (user_id),
        FOREIGN KEY (course_code) REFERENCES courses (course_code)
    );

CREATE TABLE
    discussion_thread (
        thread_id INT NOT NULL PRIMARY KEY,
        forum_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        starter_post TEXT NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (forum_id) REFERENCES discussion_forum (forum_id),
        FOREIGN KEY (created_by) REFERENCES users (user_id)
    );

CREATE TABLE
    replies (
        reply_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        thread_id INT NOT NULL,
        parent_reply_id INT,
        content TEXT NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (thread_id) REFERENCES discussion_thread (thread_id),
        FOREIGN KEY (parent_reply_id) REFERENCES replies (reply_id),
        FOREIGN KEY (created_by) REFERENCES users (user_id)
    );

CREATE TABLE
    file_resource (
        file_id INT NOT NULL PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        FOREIGN KEY (file_id) REFERENCES section_item (item_id)
    );

-- REPORTS
-- All courses that have 50 or more students 
CREATE VIEW
    courses_50_plus AS
SELECT
    c.course_code,
    c.course_title,
    COUNT(e.student_id) AS total_students
FROM
    enroll e
    JOIN courses c ON e.course_code = c.course_code
GROUP BY
    c.course_code,
    c.course_title
HAVING
    COUNT(e.student_id) >= 50;

-- All students that do 5 or more courses 
CREATE VIEW
    students_5_plus AS
SELECT
    s.student_id,
    s.sf_name,
    s.sl_name,
    COUNT(e.course_code) AS total_courses
FROM
    enroll e
    JOIN student s ON e.student_id = s.student_id
GROUP BY
    s.student_id,
    s.sf_name,
    s.sl_name
HAVING
    COUNT(e.course_code) >= 5;

-- All lecturers that teach 3 or more courses
CREATE VIEW
    lecturers_3_plus AS
SELECT
    l.lecturer_id,
    l.lf_name,
    l.ll_name,
    COUNT(t.course_code) AS total_courses
FROM
    teaches t
    JOIN lecturer l ON t.lecturer_id = l.lecturer_id
GROUP BY
    l.lecturer_id,
    l.lf_name,
    l.ll_name
HAVING
    COUNT(t.course_code) >= 3;

-- The 10 most enrolled courses
CREATE VIEW
    top_10_courses AS
SELECT
    c.course_code,
    c.course_title,
    COUNT(e.student_id) AS total_students
FROM
    enroll e
    JOIN courses c ON e.course_code = c.course_code
GROUP BY
    c.course_code,
    c.course_title
ORDER BY
    total_students DESC
LIMIT
    10;

-- The top 10 students with the highest overall averages
CREATE VIEW
    top_10_students AS
SELECT
    s.student_id,
    s.sf_name,
    s.sl_name,
    AVG(e.grade) AS avg_grade
FROM
    enroll e
    JOIN student s ON e.student_id = s.student_id
WHERE
    e.grade IS NOT NULL
GROUP BY
    s.student_id,
    s.sf_name,
    s.sl_name
ORDER BY
    avg_grade DESC
LIMIT
    10;