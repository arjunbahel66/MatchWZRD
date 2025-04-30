from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# Initialize SQLAlchemy
db = SQLAlchemy()

# Define the Schools model
class School(db.Model):
    __tablename__ = 'schools'
    
    id = db.Column(db.Integer, primary_key=True)
    school_name = db.Column(db.String(255), nullable=False, unique=True)
    session1_capacity = db.Column(db.Integer, nullable=False)
    session2_capacity = db.Column(db.Integer, nullable=False)
    session3_capacity = db.Column(db.Integer, nullable=False)
    session4_capacity = db.Column(db.Integer, nullable=False)
    session5_capacity = db.Column(db.Integer, nullable=False)
    session6_capacity = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<School {self.school_name}>'

# Define the Students model
class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Student {self.first_name} {self.last_name}>'

# Define the Preferences model
class Preference(db.Model):
    __tablename__ = 'preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=False)
    points = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define relationships
    student = db.relationship('Student', backref=db.backref('preferences', lazy=True))
    school = db.relationship('School', backref=db.backref('preferences', lazy=True))
    
    # Ensure unique student-school combination
    __table_args__ = (db.UniqueConstraint('student_id', 'school_id', name='unique_student_school'),)
    
    def __repr__(self):
        return f'<Preference {self.student_id} - {self.school_id}: {self.points}>'

# Define the Matching Results model
class MatchingResult(db.Model):
    __tablename__ = 'matching_results'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=False)
    session_number = db.Column(db.Integer, nullable=False)
    algorithm_used = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define relationships
    student = db.relationship('Student', backref=db.backref('matching_results', lazy=True))
    school = db.relationship('School', backref=db.backref('matching_results', lazy=True))
    
    def __repr__(self):
        return f'<MatchingResult {self.student_id} - {self.school_id} - Session {self.session_number}>'

# Function to initialize the database
def init_db(app):
    # Initialize the database with the app
    db.init_app(app)
    
    # Ensure the database directory exists
    db_path = os.path.dirname(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', ''))
    if db_path and not os.path.exists(db_path):
        os.makedirs(db_path)
    
    # Create all tables
    with app.app_context():
        db.create_all() 