from app import app
from database import School

with app.app_context():
    schools = School.query.all()
    for school in schools:
        print(f"School: {school.school_name}")
        print(f"Session 1 Capacity: {school.session1_capacity}")
        print(f"Session 2 Capacity: {school.session2_capacity}")
        print(f"Session 3 Capacity: {school.session3_capacity}")
        print(f"Session 4 Capacity: {school.session4_capacity}")
        print(f"Session 5 Capacity: {school.session5_capacity}")
        print(f"Session 6 Capacity: {school.session6_capacity}")
        print("-" * 50) 