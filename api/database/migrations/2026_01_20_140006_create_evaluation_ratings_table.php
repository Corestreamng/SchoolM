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
        Schema::create('evaluation_ratings', function (Blueprint $table) {
            $table->id();
            $table->integer('min_score');
            $table->integer('max_score');
            $table->string('grade'); // A+, A, B+, etc.
            $table->string('remark'); // Excellent, Very Good, etc.
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default evaluation ratings
        DB::table('evaluation_ratings')->insert([
            ['min_score' => 90, 'max_score' => 100, 'grade' => 'A+', 'remark' => 'Outstanding', 'description' => 'Outstanding performance', 'created_at' => now(), 'updated_at' => now()],
            ['min_score' => 80, 'max_score' => 89, 'grade' => 'A', 'remark' => 'Excellent', 'description' => 'Excellent performance', 'created_at' => now(), 'updated_at' => now()],
            ['min_score' => 70, 'max_score' => 79, 'grade' => 'B+', 'remark' => 'Very Good', 'description' => 'Very good performance', 'created_at' => now(), 'updated_at' => now()],
            ['min_score' => 60, 'max_score' => 69, 'grade' => 'B', 'remark' => 'Good', 'description' => 'Good performance', 'created_at' => now(), 'updated_at' => now()],
            ['min_score' => 50, 'max_score' => 59, 'grade' => 'C', 'remark' => 'Credit', 'description' => 'Credit performance', 'created_at' => now(), 'updated_at' => now()],
            ['min_score' => 40, 'max_score' => 49, 'grade' => 'D', 'remark' => 'Pass', 'description' => 'Pass performance', 'created_at' => now(), 'updated_at' => now()],
            ['min_score' => 0, 'max_score' => 39, 'grade' => 'F', 'remark' => 'Fail', 'description' => 'Fail performance', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_ratings');
    }
};
