<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Attendance;

class StudentController extends Controller
{
    // 1. Add a student (Admin only)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class_grade' => 'required|string|max:50',
        ]);

        $student = Student::create([
            'name' => $request->name,
            'class_grade' => $request->class_grade,
        ]);

        return response()->json([
            'message' => 'Student added successfully',
            'student' => $student
        ], 201);
    }

    // 2. View all students (Admin only)
    public function index()
    {
        return response()->json(Student::all());
    }
}
