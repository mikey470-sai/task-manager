@echo off
echo === Task Manager Setup ===

echo.
echo [1/4] Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo [2/4] Setting up database...
set FLASK_APP=app.py
flask db init
flask db migrate -m "initial"
flask db upgrade

echo.
echo [3/4] Setting up frontend...
cd ..\frontend
npm install

echo.
echo [4/4] Done! Now run these in separate terminals:
echo   Terminal 1 (backend): cd backend ^&^& venv\Scripts\activate ^&^& python app.py
echo   Terminal 2 (frontend): cd frontend ^&^& npm run dev
pause
