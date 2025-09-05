# School Attendance System

A simple full-stack School Attendance System built with Laravel (PHP) for the backend, React.js for the frontend, and MySQL for the database. It includes secure authentication with roles (Admin &amp; Teacher), student and teacher management, attendance marking, and basic reporting for students and classes.

## Features

### User Authentication with Roles (Admin, Teacher)
#### Admin:
- Register Students
- Register Teachers
- View all reports

#### Teacher:
- View students by class
- Mark attendance (Present/Absent)
- View reports for their classes
- Attendance Reports:
    - Individual student report
    - Class report (Secure APIs using Laravel Sanctum)

## Tech Stack
- Backend: Laravel 12+ (PHP)
- Frontend: React.js 
- Database: MySQL
 Authentication: Laravel Sanctum

## Project Structure
```
school-management-system/
│
├── backend/     # Laravel backend API
└── frontend/    # React.js frontend
        ├── src/     
        |    ├── pages/    
        |    |       ├── AdminPage.js 
        |    |       ├── HomePage.js 
        |    |       ├── LoginPage.js 
        |    |       ├── ReportsPage.js
        |    |       └── TeacherPage.js
        |    | 
        |    ├── App.js
        |    └── index.js
        |
        └── .env
```

### API Endpoints:
- User Authentication & Roles
    - api/login → login api
    - api/logout → logout api.

- User Management (Admin only)
    - api/register-student → Register student api
    - api/register-teacher → Register teacher api
    - api/students → List students (Admin & Teacher)
    - api/teachers → List teachers

- Attendance Module (Teacher only)
    - api/students-by-class/{class} → Api to fetch students for a class
    - api/mark-attendance → Api to mark attendance, prevents duplicates for the day.

- Basic Reporting (Admin & Teacher)
    - api/student-report/{student_id} → Api to get student report with summary.
    - api/class-report/{class_grade}/{month} → Api for getting class report with summary.

## How to Run the Project

#### 1. Clone the Repository
```
git clone https://github.com/thisarakaushan/school-attendance-system.git
cd school-attendance-system
```

#### 2. Backend Setup (Laravel)
First, create backend using:
```
composer create-project laravel/laravel backend or your_name
```

Go to the backend folder:
```
cd backend
```

Step 2.1: Install Dependencies
```
composer install

```

Step 2.2: Create Environment File
```
cp .env.example .env
```

Step 2.3: Set Database Credentials
Open .env and update:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=school_db
DB_USERNAME=root
DB_PASSWORD=*****
```

- Cache & session store in file not in database
```
SESSION_DRIVER=file
CACHE_STORE=file
```

Step 2.4: Install Laravel Sanctum (For API Authentication)
Sanctum is used for token-based authentication:
```
Install Laravel Sanctum (For API Authentication)
```
Publish Sanctum config:
```
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Step 2.5: Generate App Key
```
php artisan key:generate
```

Step 2.6: Run Migrations
```
php artisan migrate
```

Step 2.7: Seed Admin & Teacher Users
Create a seeder or run Tinker to add these users.
Example:
```
// Admin
User::create([
    'name' => 'Admin',
    'email' => 'admin@school.com',
    'password' => bcrypt('password'),
    'role' => 'admin'
]);

// Teacher
User::create([
    'name' => 'Teacher',
    'email' => 'teacher@school.com',
    'password' => bcrypt('password'),
    'role' => 'teacher'
]);
```

Step 2.8: Start Laravel Server
```
php artisan serve
```
Backend runs at: http://127.0.0.1:8000

#### 3. CORS Configuration (Laravel)
Install CORS package if missing:
```
composer require fruitcake/laravel-cors
```
Then configure in ```config/cors.php```:
```
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
```

#### 4. Frontend Setup (React.js)
First, create project using:
```
npx create-react-app@latest frontend    
```
Then go to the frontend folder:
```
cd ../frontend
```

Step 4.1: Install Dependencies
```
npm install
```
Then, install dependencies for axios and datepicker:
```
npm install react-router-dom axios  
npm install react-datepicker
```

Step 4.2: Create Environment File
```
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

Step 4.3: Start Frontend
```
npm start
```
Frontend runs at: http://localhost:3000

### Test Login Credentials

Admin
Email: admin@example.com
Password: password123

Teacher
Email: teacher@example.com
Password: teach123

- Admin logs in → Registers students & teachers → Views reports

- Teacher logs in → Selects class → Marks attendance → Views class/student reports

## UI Screenshots

### Database (MySQL):
![Database structure](<Screenshot 2025-09-05 105437.png>)


### Login:
![Login Page](<Screenshot 2025-09-05 104638.png>)


### Admin
- Admin dashboard:
![Admin dashboard](<Screenshot 2025-09-05 104738.png>)


- Register Student:
![Register Student UI](<Screenshot 2025-09-05 104828.png>)

![Registered Student](<Screenshot 2025-09-05 104859.png>)



- Register Teacher:
![Register Teacher UI](<Screenshot 2025-09-05 104942.png>)

![Registered Teacher](<Screenshot 2025-09-05 105048.png>)


- List of students & teachers:
![List](<Screenshot 2025-09-05 105018.png>)

- View Reports: same as teacher view reports

### Teacher:
- Teacher dashboard:
![Teacher dashboard](<Screenshot 2025-09-05 104305.png>)


- List of students and mark attendance view:
![List of students](<Screenshot 2025-09-05 104404.png>)


- Reports view:
![Reports view UI](<Screenshot 2025-09-05 104417.png>)

![Individual Student Report-1](<Screenshot 2025-09-05 104447.png>)

![Individual Student Report-2](<Screenshot 2025-09-05 104508.png>)

![Class Report](<Screenshot 2025-09-05 104535.png>)

![Full Report view](<Screenshot 2025-09-05 104602.png>)

### Bonus Features

✅ Class report with monthly attendance percentage
✅ Role-based route protection (Admin & Teacher)
✅ Secure authentication using Laravel Sanctum

## License

This project is for educational purposes only.