<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['student_id', 'date', 'status', 'marked_by_teacher_id'];
}
