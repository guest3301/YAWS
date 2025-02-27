from flask import Flask, request, jsonify, send_from_directory, session, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import os

app = Flask(__name__)
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

db = SQLAlchemy(app)

class Notice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    date_uploaded = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route('/api/notices', methods=['GET'])
def get_notices():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)
    pagination = Notice.query.order_by(Notice.date_uploaded.desc()).paginate(page, per_page, error_out=False)
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
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            title = request.form.get('title', filename)
            new_notice = Notice(title=title, url=filepath)
            db.session.add(new_notice)
            db.session.commit()
            return jsonify({'message': 'Notice added successfully'}), 201
        return jsonify({'message': 'Invalid file format'}), 400
    data = request.get_json()
    if not data or 'title' not in data or 'url' not in data:
        return jsonify({'message': 'Title and URL required'}), 400
    new_notice = Notice(title=data['title'], url=data['url'])
    db.session.add(new_notice)
    db.session.commit()
    return jsonify({'message': 'Notice added successfully'}), 201

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect('/admin')
        return '<p>Invalid credentials</p>'
    return '<form method="post"><input name="username" placeholder="Username"><input name="password" type="password" placeholder="Password"><button type="submit">Login</button></form>'

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect('/login')

@app.route('/admin', methods=['GET'])
def admin_panel():
    if not session.get('logged_in'):
        return redirect('/login')
    return '<form id="noticeForm" method="post" enctype="multipart/form-data" action="/api/notices"><input type="text" name="title" placeholder="Title"><input type="text" name="url" placeholder="URL (leave empty if uploading file)"><input type="file" name="file" accept="application/pdf"><button type="submit">Submit</button></form><a href="/logout">Logout</a>'

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)