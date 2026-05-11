from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Task, ProjectMember
from datetime import date

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = int(get_jwt_identity())
    memberships = ProjectMember.query.filter_by(user_id=user_id).all()
    project_ids = [m.project_id for m in memberships]
    all_tasks = Task.query.filter(Task.project_id.in_(project_ids)).all() if project_ids else []
    my_tasks = Task.query.filter_by(assignee_id=user_id).all()
    today = date.today()
    return jsonify({
        'total': len(all_tasks),
        'done': sum(1 for t in all_tasks if t.status == 'done'),
        'in_progress': sum(1 for t in all_tasks if t.status == 'in_progress'),
        'overdue': sum(1 for t in all_tasks if t.due_date and t.due_date < today and t.status != 'done'),
        'my_tasks': [{'id': t.id, 'title': t.title, 'status': t.status, 'priority': t.priority,
                      'due_date': t.due_date.isoformat() if t.due_date else None} for t in my_tasks]
    }), 200
