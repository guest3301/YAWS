from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import re

db = SQLAlchemy()

class Notice(db.Model):
    __tablename__ = 'notices'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
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
        
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'url': self.url,
            'date_uploaded': self.date_uploaded.isoformat(),
            'filename': self.filename
        }
