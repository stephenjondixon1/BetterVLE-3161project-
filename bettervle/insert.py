import mysql.connector
import random
from faker import Faker
from collections import defaultdict 

fake = Faker()
#Database Connection
conn = mysql.connector.connect(
    host = "localhost",
    user = "root",
    password = "Database2016!",
    database = "betterVLE"
)
cursor = conn.cursor()

majors_departments = [
    ("Computer Science", "Computing"),
    ("Information Technology", "Computing"),
    ("Software Engineering", "Computing"),
    ("Business Administration", "Business"),
    ("Accounting", "Business"),
    ("Marketing", "Business"),
    ("Mechanical Engineering", "Engineering"),
    ("Electrical Engineering", "Engineering"),
    ("Civil Engineering", "Engineering"),
    ("Biology", "Science"),
    ("Chemistry", "Science"),
    ("Physics", "Science")
]

course_names = [
    "Database Systems", "Data Structures", "Operating Systems", "Artificial Intelligence",
    "Computer Networks", "Software Design", "Web Development", "Cyber Security",
    "Machine Learning", "Cloud Computing", "Digital Marketing", "Financial Accounting",
    "Thermodynamics", "Circuit Analysis", "Genetics", "Organic Chemistry"
]

file = open("insertions.sql","w")
file.write("USE betterVLE;\n\n")

#Insert Admin
sql = "INSERT INTO users(user_id, user_name, password) VALUES (1, 'admin1', 'admin123');"
file.write(sql + "\n")
cursor.execute(sql)

sql = "INSERT INTO accounts(acc_role, user_id) VALUES ('admin', 1);"
file.write(sql + "\n")
cursor.execute(sql)

sql = "INSERT INTO admin(admin_id, admin_name, admin_email) VALUES (1,'System Admin','admin@email.com');"
file.write(sql + "\n")
cursor.execute(sql)

#Insert Lecturers
for i in range(2,52):  
    fname = fake.first_name()
    lname = fake.last_name()
    dept = random.choice([d for _, d in majors_departments]) 
    sql1 = f"INSERT INTO users VALUES ({i},  'lecturer{i}', 'pass123');"
    sql2 = f"INSERT INTO accounts(acc_role, user_id) VALUES ('lecturer', {i});"
    sql3 = f"""
    INSERT INTO lecturer (lecturer_id, lf_name, ll_name, department)
    VALUES ({i}, '{fname}', '{lname}', '{dept}');
    """

    file.write(sql1 + "\n")
    file.write(sql2 + "\n")
    file.write(sql3 + "\n")

    cursor.execute(sql1)
    cursor.execute(sql2)
    cursor.execute(sql3)
    
conn.commit()
print("Lecturers inserted")

#Insert Students
for i in range(52,100052):
        sql1 = f"INSERT INTO users (user_id, user_name, password) VALUES ({i}, 'student{i}', 'pass123');"
        sql2 = f"INSERT INTO accounts(acc_role, user_id) VALUES ('student', {i});"
        
        fname = fake.first_name()
        lname = fake.last_name()
        major, dept = random.choice(majors_departments)
        gpa = round(random.uniform(2.0, 4.3), 2)

        sql3 = f"""
        INSERT INTO student (student_id, sf_name, sl_name, major, department, gpa)
        VALUES ({i}, '{fname}', '{lname}', '{major}', '{dept}', {gpa});
        """
        
        file.write(sql1 + "\n")
        file.write(sql2 + "\n")
        file.write(sql3 + "\n")

        cursor.execute(sql1)
        cursor.execute(sql2)
        cursor.execute(sql3)
        
        if i % 2000 == 0:
            conn.commit()
            print(f"{i} students inserted")
        
       

# Insert Courses

courses = []

for i in range(1, 201):
    code = f"COMP{str(i).zfill(4)}"
    courses.append(code)

    course_title = random.choice(course_names) + f" {i}"
    sql = f"""
    INSERT INTO courses (course_code, course_title, created_by)
    VALUES ('{code}', '{course_title}', 1);
    """
    file.write(sql + "\n")
    cursor.execute(sql)
    

conn.commit()
print("Courses inserted")

#Assign Lecturers
lecturer_id = 2
count = 0
for course in courses:
    sql = f"INSERT INTO teaches (lecturer_id, course_code) VALUES ({lecturer_id}, '{course}');"

    file.write(sql + "\n")
    cursor.execute(sql)

    count += 1
    if count == 4:
        lecturer_id += 1
        count = 0
conn.commit()
print("Lecturer Assigned")


#Enroll Students
student_enrollments = defaultdict(set)
student_ids = list(range(52,100052))
print("Enrolling minimum 10 students per course")
for course in courses:
    selected_students = random.sample(student_ids,10)
    for student_id in selected_students:
        grade = round(random.uniform(50,100), 2)
        
        if course not in student_enrollments[student_id]:
            student_enrollments[student_id].add(course)
            sql = f"INSERT INTO enroll (student_id, course_code, grade) VALUES({student_id}, '{course}', {grade});"
            
            file.write(sql +"\n")
            cursor.execute(sql)
    conn.commit()
print("Minimum course enrollment satisfied")

print("Ensuring all students have 3-6 courses")
student_fixed = 0
for student_id in range(52, 100052): 
    current_courses = student_enrollments[student_id]
    current_count = len(current_courses)
    
    if current_count < 3:
        target_total = random.randint(3,6)
        needed = target_total - current_count
    
        remaining_courses = [c for c in courses if c not in current_courses]
        
        needed = min(needed, len(remaining_courses))
            
        if needed > 0:
            selected = random.sample(remaining_courses, needed)

            for course in selected:
                student_enrollments[student_id].add(course)
                grade = round(random.uniform(50,100), 2)
                        
                sql = f"INSERT INTO enroll (student_id, course_code, grade) VALUES ({student_id}, '{course}', {grade});"
                file.write(sql + "\n")
                cursor.execute(sql)
            student_fixed += 1
    
    elif current_count > 6:
        pass

    if student_id % 1000 == 0:
        conn.commit()
        print(f"Processed {student_id} student enrollments")

conn.commit()
cursor.close()
conn.close()
file.close()

print("All data inserted ")