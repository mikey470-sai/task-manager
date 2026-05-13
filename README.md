# Task Manager

A full-stack team task management app with role-based access control.

## Tech Stack
- **Backend:** Python, Flask, MySQL, JWT
- **Frontend:** React, Vite, Tailwind CSS

## Setup

### 1. Update MySQL password
Open `backend/config.py` and replace `1234` with your MySQL root password.

### 2. Create the database
```sql
mysql -u root -p
CREATE DATABASE taskmanager;
EXIT;
```

### 3. Run setup script
```
setup.bat
```

### 4. Start both servers

**Terminal 1 - Backend:**
```
cd backend
venv\Scripts\activate
python app.py
```

**Terminal 2 - Frontend:**
```
cd frontend
npm run dev
```

Open http://localhost:5173

## Features
- Signup / Login with JWT auth
- Create projects, manage team members
- Create tasks with priority, due date, assignee
- Role-based access: Admin (full control) / Member (update own tasks)
- Dashboard with stats: total, done, in-progress, overdue tasks
- more over manage that task to improve that project
  
