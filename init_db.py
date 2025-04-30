from app import app, db, School, Student, Preference, MatchingResult

def init_db():
    # Create all tables within application context
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

if __name__ == '__main__':
    init_db() 