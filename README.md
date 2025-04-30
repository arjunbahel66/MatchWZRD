# MatchWZRD

A matching algorithm application for student-school assignments.

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd MatchWZRD
```

2. Set up the Python environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Initialize the database:
```bash
python init_db.py
```

5. Start the application:
```bash
# Terminal 1 (Backend)
python app.py

# Terminal 2 (Frontend)
cd frontend
npm start
```

## Database Management

The application uses SQLite for data storage. The database file (`matchWZRD.db`) is created automatically when you run the application for the first time.

To reset the database:
1. Delete the existing `matchWZRD.db` file
2. Run `python init_db.py` to create a fresh database

## Data Flow

1. Upload configuration file to set up schools and sessions
2. Upload preferences file with student preferences
3. Process preferences to run the matching algorithm
4. View results and statistics

## Notes

- The database is not version controlled
- Make sure to back up your database file regularly
- Configuration and preferences files should be uploaded in the correct order

## Features

- Upload and manage school configuration data
- Upload and manage student preferences data
- Edit data directly in the grid
- Save data to SQLite database
- Calculate row and column totals
- Match students to schools based on preferences

## Usage

### Configuration Page

1. Upload a school configuration Excel file or CSV file
2. Edit the data in the grid if needed
3. Click "Save Configuration" to persist the data to the database

### Preferences Page

1. Upload a student preferences Excel file or CSV file
2. Edit the data in the grid if needed
3. Click "Save Preferences" to persist the data to the database

## Data Format

### Configuration Data

The configuration Excel file should have the following columns:
- School Name
- Session 1 Capacity
- Session 2 Capacity
- Session 3 Capacity
- Session 4 Capacity
- Session 5 Capacity
- Session 6 Capacity

### Preferences Data

The preferences Excel file should have the following columns:
- Student Name
- School 1 Points
- School 2 Points
- ...
- School N Points

## License

This project is licensed under the MIT License - see the LICENSE file for details.