# New endpoint to check for existing matching results
@app.route('/api/results/check', methods=['GET'])
def check_results():
    try:
        # Check if any matching results exist in the database
        results = MatchingResult.query.first()
        return jsonify({'exists': results is not None})
    except Exception as e:
        return jsonify({'exists': False, 'error': str(e)})

# Results endpoint
@app.route('/api/results', methods=['GET'])
def get_results():
    try:
        # Get all matching results from the database
        results = MatchingResult.query.all()
        
        # Convert to the format expected by the frontend
        matches = []
        for result in results:
            match = {
                'id': result.id,
                'student_id': result.student_id,
                'student_name': f"{result.student.first_name} {result.student.last_name}",
                'school_id': result.school_id,
                'school_name': result.school.school_name,
                'session_number': result.session_number,
                'preference_score': result.student.preferences.filter_by(school_id=result.school_id).first().points
            }
            matches.append(match)
        
        return jsonify({
            'success': True,
            'matches': matches
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error retrieving results: {str(e)}'
        }), 500 