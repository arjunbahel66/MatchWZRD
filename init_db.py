from app import db, School, Student, Preference, MatchingResult

def init_db():
    # Create all tables
    db.create_all()
    print("Database tables created successfully!")

if __name__ == '__main__':
    init_db() 