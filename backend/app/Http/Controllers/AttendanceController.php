<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    // Get students by class
    public function getStudentsByClass($class)
    {
        return response()->json(Student::where('class_grade', $class)->get());
    }

    // Mark attendance for multiple students
    public function markAttendance(Request $request)
    {
        $request->validate([
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent'
        ]);

        $today = now()->format('Y-m-d');

        foreach ($request->attendances as $att) {
            // Prevent duplicates
            if (Attendance::where('student_id', $att['student_id'])->where('date', $today)->exists()) {
                return response()->json(['error' => 'Attendance already marked for today'], 400);
            }

            Attendance::create([
                'student_id' => $att['student_id'],
                'date' => $today,
                'status' => $att['status'],
                'marked_by_teacher_id' => Auth::id(),
            ]);
        }

        return response()->json(['message' => 'Attendance marked successfully']);
    }

    // Student Attendance Report
    public function studentReport($student_id)
    {
        $attendances = Attendance::where('student_id', $student_id)->get(['date', 'status']);
        $total = $attendances->count();
        $present = $attendances->where('status', 'present')->count();
        $absent = $total - $present;

        return response()->json([
            'attendances' => $attendances,
            'summary' => "Total Days: $total, Present: $present, Absent: $absent"
        ]);
    }

    // Class Attendance Report 
    public function classReport($class_grade, $month)
    {
        \Log::info("Class Report Request: class_grade=$class_grade, month=$month");

        try {
            // Parse month to year and month
            [$year, $month_num] = explode('-', $month);
            if (!is_numeric($year) || !is_numeric($month_num)) {
                \Log::error("Invalid month format: $month");
                return response()->json(['error' => 'Invalid month format'], 400);
            }

            // Decode class_grade
            $decoded_class = urldecode($class_grade);
            \Log::info("Decoded class_grade: $decoded_class");

            // Get students in the class
            $students = Student::where('class_grade', $decoded_class)->get();
            if ($students->isEmpty()) {
                \Log::warning("No students found for class_grade: $decoded_class");
                return response()->json([
                    'summary' => [
                        'total_students' => 0,
                        'total_days' => 0,
                        'average_attendance' => 0,
                        'total_absences' => 0
                    ],
                    'students' => []
                ], 200);
            }

            // Get attendances for the month
            $attendances = Attendance::whereIn('student_id', $students->pluck('id'))
                ->whereYear('date', $year)
                ->whereMonth('date', $month_num)
                ->get();

            \Log::info("Found " . $attendances->count() . " attendance records");

            // Unique school days
            $total_days = $attendances->unique('date')->count();

            // Compute per student
            $student_data = [];
            $total_absences = 0;
            foreach ($students as $student) {
                $student_att = $attendances->where('student_id', $student->id);
                $present_days = $student_att->where('status', 'present')->count();
                $absent_days = $student_att->where('status', 'absent')->count();
                $attendance_percentage = $total_days > 0 ? round(($present_days / $total_days) * 100) : 0;

                $student_data[] = [
                    'name' => $student->name,
                    'present_days' => $present_days,
                    'absent_days' => $absent_days,
                    'attendance_percentage' => $attendance_percentage
                ];

                $total_absences += $absent_days;
            }

            // Class summary
            $total_students = $students->count();
            $average_attendance = $total_students * $total_days > 0 
                ? round((($total_students * $total_days - $total_absences) / ($total_students * $total_days)) * 100) 
                : 0;

            return response()->json([
                'summary' => [
                    'total_students' => $total_students,
                    'total_days' => $total_days,
                    'average_attendance' => $average_attendance,
                    'total_absences' => $total_absences
                ],
                'students' => $student_data
            ]);
        } catch (\Exception $e) {
            \Log::error("Class Report Error: " . $e->getMessage());
            return response()->json(['error' => 'Server error while fetching class report'], 500);
        }
    }
}
