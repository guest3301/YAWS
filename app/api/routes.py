from flask import Blueprint, request, jsonify, current_app, send_file, session
from app.models.models import db, Notice
from app.utils.helpers import allowed_file, generate_unique_filename
from werkzeug.security import safe_join
import os
from werkzeug.utils import secure_filename

api_bp = Blueprint('api', __name__)

@api_bp.route('/notices', methods=['GET'])
def get_notices():
    """
    Get paginated notices
    ---
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
        description: Page number
      - name: per_page
        in: query
        type: integer
        default: 5
        description: Items per page
    responses:
      200:
        description: A list of notices
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)
    
    pagination = Notice.query.order_by(Notice.date_uploaded.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    notices = pagination.items
    
    return jsonify({
        'notices': [notice.to_dict() for notice in notices],
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
        'page': page,
        'pages': pagination.pages,
        'total': pagination.total
    })

@api_bp.route('/notices', methods=['POST'])
def add_notice():
    """
    Add a new notice
    ---
    parameters:
      - name: file
        in: formData
        type: file
        description: PDF file to upload
      - name: title
        in: formData
        type: string
        description: Notice title
      - name: url
        in: formData
        type: string
        description: URL (if no file is uploaded)
    responses:
      201:
        description: Notice created successfully
      400:
        description: Bad request
      401:
        description: Unauthorized
      500:
        description: Server error
    """
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized', 'message': 'Login required'}), 401
        
    try:
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = generate_unique_filename(file.filename)
                
                filepath = safe_join(current_app.config['UPLOAD_FOLDER'], filename)
                if not filepath:
                    return jsonify({'error': 'Invalid file path', 'message': 'Security issue with file path'}), 400
                    
                file.save(filepath)
                title = request.form.get('title', filename)
                # Store only filename in URL, not full path
                new_notice = Notice(title=title, url=f'/uploads/{filename}', filename=filename)
                db.session.add(new_notice)
                db.session.commit()
                return jsonify({'success': True, 'message': 'Notice added successfully', 'notice': new_notice.to_dict()}), 201
            return jsonify({'error': 'Invalid file', 'message': 'Invalid file format'}), 400
            
        data = request.get_json()
        if not data or 'title' not in data or 'url' not in data:
            return jsonify({'error': 'Missing data', 'message': 'Title and URL required'}), 400
            
        # Validate URL format
        if not data['url'].startswith(('http://', 'https://', '/uploads/')):
            return jsonify({'error': 'Invalid URL', 'message': 'Invalid URL format'}), 400
            
        new_notice = Notice(title=data['title'], url=data['url'])
        db.session.add(new_notice)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Notice added successfully', 'notice': new_notice.to_dict()}), 201
        
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

@api_bp.route('/notices/<int:notice_id>', methods=['DELETE'])
def delete_notice(notice_id):
    """
    Delete a notice
    ---
    parameters:
      - name: notice_id
        in: path
        type: integer
        required: true
        description: Notice ID to delete
    responses:
      200:
        description: Notice deleted successfully
      401:
        description: Unauthorized
      404:
        description: Notice not found
      500:
        description: Server error
    """
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized', 'message': 'Login required'}), 401
        
    try:
        notice = Notice.query.get_or_404(notice_id)
        
        # Delete file if it exists
        if notice.filename:
            filepath = safe_join(current_app.config['UPLOAD_FOLDER'], notice.filename)
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
                
        db.session.delete(notice)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Notice deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

@api_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """
    Serve uploaded files
    ---
    parameters:
      - name: filename
        in: path
        type: string
        required: true
        description: File name to retrieve
    responses:
      200:
        description: File content
      400:
        description: Invalid filename
      404:
        description: File not found
      500:
        description: Error accessing file
    """
    # Sanitize filename and prevent directory traversal
    filename = secure_filename(filename)
    if not filename:
        return jsonify({'error': 'Invalid filename', 'message': 'Invalid filename'}), 400
        
    try:
        filepath = safe_join(current_app.config['UPLOAD_FOLDER'], filename)
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'File not found', 'message': 'File not found'}), 404
            
        return send_file(filepath)
    except Exception as e:
        return jsonify({'error': 'File access error', 'message': str(e)}), 500
