from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task, Project, ProjectMember
from datetime import date

tasks_bp = Blueprint('tasks', __name__)

def get_member_role(project_id, user_id):
    member = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
    return member.role if member else None

@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def get_tasks(project_id):
    user_id = int(get_jwt_identity())
    role = get_member_role(project_id, user_id)
    if not role:
        return jsonify({'error': 'Forbidden'}), 403
    tasks = Task.query.filter_by(project_id=project_id).all()
    result = []
    for t in tasks:
        result.append({
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'status': t.status,
            'priority': t.priority,
            'due_date': t.due_date.isoformat() if t.due_date else None,
            'assignee_id': t.assignee_id,
            'created_by': t.created_by,
            'overdue': t.due_date < date.today() if t.due_date and t.status != 'done' else False
        })
    return jsonify(result), 200

@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    user_id = int(get_jwt_identity())
    role = get_member_role(project_id, user_id)
    if role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json()
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        status=data.get('status', 'todo'),
        priority=data.get('priority', 'medium'),
        due_date=date.fromisoformat(data['due_date']) if data.get('due_date') else None,
        project_id=project_id,
        assignee_id=int(data['assignee_id']) if data.get('assignee_id') else None,
        created_by=user_id
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({'id': task.id, 'title': task.title, 'status': task.status}), 201

@tasks_bp.route('/tasks/<int:task_id>', methods=['PATCH'])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.get_or_404(task_id)
    role = get_member_role(task.project_id, user_id)
    if not role:
        return jsonify({'error': 'Forbidden'}), 403
    if role == 'member' and task.assignee_id != user_id:
        return jsonify({'error': 'You can only update your own tasks'}), 403
    data = request.get_json()
    if 'title' in data and role == 'admin':
        task.title = data['title']
    if 'description' in data and role == 'admin':
        task.description = data['description']
    if 'status' in data:
        task.status = data['status']
    if 'priority' in data and role == 'admin':
        task.priority = data['priority']
    if 'due_date' in data and role == 'admin':
        task.due_date = date.fromisoformat(data['due_date']) if data['due_date'] else None
    if 'assignee_id' in data and role == 'admin':
        task.assignee_id = data['assignee_id']
    db.session.commit()
    return jsonify({'id': task.id, 'title': task.title, 'status': task.status}), 200

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.get_or_404(task_id)
    role = get_member_role(task.project_id, user_id)
    if role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200
