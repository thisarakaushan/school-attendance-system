<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
             $table->id();
            $table->foreignId('student_id')->constrained(); // links to students.id
            $table->date('date');
            $table->enum('status', ['present', 'absent']);
            $table->foreignId('marked_by_teacher_id')->constrained('users'); // links to users.id
            $table->timestamps();
            $table->unique(['student_id', 'date']); // prevent multiple attendance per student per day
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
