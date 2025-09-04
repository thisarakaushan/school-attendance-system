<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\AttendanceController;

// Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Routes for Admin only
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Register students and teachers
    Route::post('/register-student', [UserManagementController::class, 'registerStudent']);
    Route::post('/register-teacher', [UserManagementController::class, 'registerTeacher']);

    // List teachers
    Route::get('/teachers', [UserManagementController::class, 'listTeachers']);

    // Add a student (StudentController)
    Route::post('/students/add', [StudentController::class, 'store']); 
});

// Routes for Teachers only
Route::middleware(['auth:sanctum', 'role:teacher'])->group(function () {
    Route::get('/students-by-class/{class}', [AttendanceController::class, 'getStudentsByClass']);
    Route::post('/mark-attendance', [AttendanceController::class, 'markAttendance']);
});

// Reports and list students for Admin & Teacher
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/student-report/{student_id}', [AttendanceController::class, 'studentReport']);
    Route::get('/class-report/{class_grade}/{month}', [AttendanceController::class, 'classReport']);
    Route::get('/students', [UserManagementController::class, 'listStudents']);
});
