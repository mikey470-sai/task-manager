from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Project, ProjectMember, User

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = int(get_jwt_identity())
    memberships = ProjectMember.query.filter_by(user_id=user_id).all()
    project_ids = [m.project_id for m in memberships]
    owned = Project.query.filter_by(owner_id=user_id).all()
    owned_ids = [p.id for p in owned]
    all_ids = list(set(project_ids + owned_ids))
    projects = Project.query.filter(Project.id.in_(all_ids)).all()
    result = []
    for p in projects:
        member = ProjectMember.query.filter_by(project_id=p.id, user_id=user_id).first()
        role = member.role if member else 'admin'
        result.append({
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'owner_id': p.owner_id,
            'role': role,
            'member_count': ProjectMember.query.filter_by(project_id=p.id).count(),
            'task_count': len(p.tasks),
            'created_at': p.created_at.isoformat()
        })
    return jsonify(result), 200

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data.get('name'):
        return jsonify({'error': 'Project name is required'}), 400
    project = Project(name=data['name'], description=data.get('description', ''), owner_id=user_id)
    db.session.add(project)
    db.session.flush()
    member = ProjectMember(project_id=project.id, user_id=user_id, role='admin')
    db.session.add(member)
    db.session.commit()
    return jsonify({'id': project.id, 'name': project.name, 'description': project.description}), 201

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.get_or_404(project_id)
    member = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
    if not member and project.owner_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    members = []
    for m in ProjectMember.query.filter_by(project_id=project_id).all():
        u = User.query.get(m.user_id)
        members.append({'user_id': u.id, 'name': u.name, 'email': u.email, 'role': m.role})
    return jsonify({
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'owner_id': project.owner_id,
        'members': members
    }), 200

@projects_bp.route('/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_member(project_id):
    user_id = int(get_jwt_identity())
    member = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
    if not member or member.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json()
    new_user = User.query.filter_by(email=data.get('email')).first()
    if not new_user:
        return jsonify({'error': 'User not found'}), 404
    existing = ProjectMember.query.filter_by(project_id=project_id, user_id=new_user.id).first()
    if existing:
        return jsonify({'error': 'User already a member'}), 409
    new_member = ProjectMember(project_id=project_id, user_id=new_user.id, role=data.get('role', 'member'))
    db.session.add(new_member)
    db.session.commit()
    return jsonify({'message': 'Member added successfully'}), 201

@projects_bp.route('/<int:project_id>/members/<int:member_user_id>', methods=['DELETE'])
@jwt_required()
def remove_member(project_id, member_user_id):
    user_id = int(get_jwt_identity())
    member = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
    if not member or member.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    to_remove = ProjectMember.query.filter_by(project_id=project_id, user_id=member_user_id).first()
    if not to_remove:
        return jsonify({'error': 'Member not found'}), 404
    db.session.delete(to_remove)
    db.session.commit()
    return jsonify({'message': 'Member removed'}), 200
