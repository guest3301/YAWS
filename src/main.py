from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for, send_file, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from werkzeug.security import safe_join
import re

app = Flask(__name__, static_url_path='/uploads', static_folder='uploads')
CORS(app)
app.secret_key = 's3cr3tK3y'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/test_db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'test@admin'

# Add max file size limit (5MB)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

db = SQLAlchemy(app)

class Notice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    date_uploaded = db.Column(db.DateTime, default=datetime.utcnow)
    filename = db.Column(db.String(255))  # Store the filename separately
    
    # Add data validation
    def __init__(self, title, url, filename=None):
        if not title or len(title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if not url or len(url.strip()) == 0:
            raise ValueError("URL cannot be empty")
        # Sanitize inputs
        self.title = re.sub(r'[<>]', '', title.strip())
        self.url = url.strip()
        self.filename = filename

with app.app_context():
    db.create_all()

@app.route('/api/notices', methods=['GET'])
def get_notices():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)
    pagination = Notice.query.order_by(Notice.date_uploaded.desc()).paginate(page=page, per_page=per_page, error_out=False)
    notices = pagination.items
    return jsonify({
        'notices': [{
            'title': notice.title,
            'url': notice.url,
            'date_uploaded': notice.date_uploaded.isoformat()
        } for notice in notices],
        'has_next': pagination.has_next,
        'page': page
    })

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/notices', methods=['POST'])
def add_notice():
    if not session.get('logged_in'):
        return jsonify({'message': 'Unauthorized'}), 401
        
    try:
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Ensure unique filename
                base, ext = os.path.splitext(filename)
                counter = 1
                while os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
                    filename = f"{base}_{counter}{ext}"
                    counter += 1
                
                filepath = safe_join(app.config['UPLOAD_FOLDER'], filename)
                if not filepath:
                    return jsonify({'message': 'Invalid file path'}), 400
                    
                file.save(filepath)
                title = request.form.get('title', filename)
                # Store only filename in URL, not full path
                new_notice = Notice(title=title, url=f'/uploads/{filename}', filename=filename)
                db.session.add(new_notice)
                db.session.commit()
                return jsonify({'message': 'Notice added successfully'}), 201
            return jsonify({'message': 'Invalid file format'}), 400
            
        data = request.get_json()
        if not data or 'title' not in data or 'url' not in data:
            return jsonify({'message': 'Title and URL required'}), 400
            
        # Validate URL format
        if not data['url'].startswith(('http://', 'https://', '/uploads/')):
            return jsonify({'message': 'Invalid URL format'}), 400
            
        new_notice = Notice(title=data['title'], url=data['url'])
        db.session.add(new_notice)
        db.session.commit()
        return jsonify({'message': 'Notice added successfully'}), 201
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'An error occurred'}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect('/admin')
        return render_template('login.html', error='Invalid credentials')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect('/login')

@app.route('/admin', methods=['GET'])
def admin_panel():
    if not session.get('logged_in'):
        return redirect('/login')
    return render_template('admin.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # Sanitize filename and prevent directory traversal
    filename = secure_filename(filename)
    if not filename:
        return jsonify({'message': 'Invalid filename'}), 400
        
    try:
        filepath = safe_join(app.config['UPLOAD_FOLDER'], filename)
        if not filepath or not os.path.exists(filepath):
            return jsonify({'message': 'File not found'}), 404
            
        return send_file(filepath)
    except Exception as e:
        return jsonify({'message': 'Error accessing file'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)