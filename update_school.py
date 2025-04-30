from app import app, db
from database import School

def update_school_capacity(school_name, session_number, new_capacity):
    with app.app_context():
        # Find the school
        school = School.query.filter_by(school_name=school_name).first()
        if not school:
            return False
        
        # Update the capacity for the specified session
        if session_number == 1:
            school.session1_capacity = new_capacity
        elif session_number == 2:
            school.session2_capacity = new_capacity
        elif session_number == 3:
            school.session3_capacity = new_capacity
        elif session_number == 4:
            school.session4_capacity = new_capacity
        elif session_number == 5:
            school.session5_capacity = new_capacity
        elif session_number == 6:
            school.session6_capacity = new_capacity
        else:
            return False
        
        # Commit the changes
        db.session.commit()
        return True

if __name__ == "__main__":
    # Example usage
    school_name = "Carnegie Mellon University (Tepper)"
    session_number = 1  # First session
    new_capacity = 100
    
    update_school_capacity(school_name, session_number, new_capacity) 