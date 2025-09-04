<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    // Register a student
    public function registerStudent(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'class_grade' => 'required|string'
        ]);

        $student = Student::create([
            'name' => $request->name,
            'class_grade' => $request->class_grade,
        ]);

        return response()->json(['message' => 'Student registered successfully', 'student' => $student], 201);
    }

    // Register a teacher
    public function registerTeacher(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6'
        ]);

        $teacher = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'teacher',
        ]);

        return response()->json(['message' => 'Teacher registered successfully', 'teacher' => $teacher], 201);
    }

    // List all students
    public function listStudents()
    {
        return response()->json(Student::all());
    }

    // List all teachers
    public function listTeachers()
    {
        return response()->json(User::where('role', 'teacher')->get());
    }
}
