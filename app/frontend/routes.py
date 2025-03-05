from flask import Blueprint, request, session, redirect, url_for, render_template, current_app, flash

frontend_bp = Blueprint('frontend', __name__)

@frontend_bp.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@frontend_bp.route('/student/<string:subpath>', methods=['GET'])
def student(subpath):
    if subpath == 'notice':
        return render_template('student/notice.html')
    elif subpath == 'attendance':
        return render_template('student/attendance.html')
    else:
        return render_template('404.html')
    
@frontend_bp.route('/about/<string:subpath>', methods=['GET'])
def about(subpath):
    if subpath == 'message':
        return render_template('about/message.html')
    elif subpath == 'committee':
        return render_template('about/committee.html')
    else:
        return render_template('404.html')