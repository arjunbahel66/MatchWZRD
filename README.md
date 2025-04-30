# MatchWZRD

A web application for matching students with schools based on preferences.

## Prerequisites

- Python 3.9 (recommended) or Python 3.12
- Node.js (latest LTS version)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/arjunbahel66/MatchWZRD.git
cd MatchWZRD
```

2. Set up Python virtual environment:
```bash
# For Python 3.9
python3.9 -m venv venv

# For Python 3.12
python3.12 -m venv venv
```

3. Activate the virtual environment:
```bash
# On macOS/Linux
source venv/bin/activate

# On Windows
.\venv\Scripts\activate
```

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

5. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

## Running the Application

1. Start both servers using the start script:
```bash
./start.sh
```

2. The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Development

- Backend: Python/Flask
- Frontend: React
- Database: SQLite (default) or PostgreSQL

## Project Structure

```
MatchWZRD/
├── frontend/           # React frontend
├── venv/              # Python virtual environment
├── app.py             # Flask application
├── database.py        # Database models
├── init_db.py         # Database initialization
├── requirements.txt   # Python dependencies
└── start.sh           # Startup script
```

## Troubleshooting

If you encounter any issues:

1. Make sure you're using the correct Python version
2. Ensure all dependencies are installed
3. Check that both servers are running
4. Look for error messages in the terminal windows

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

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