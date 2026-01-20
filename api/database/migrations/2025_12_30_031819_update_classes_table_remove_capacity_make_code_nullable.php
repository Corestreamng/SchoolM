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
        Schema::table('classes', function (Blueprint $table) {
            // Remove capacity column
            $table->dropColumn('capacity');

            // Make code nullable (it will be auto-generated if not provided)
            $table->string('code')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            // Restore capacity column
            $table->integer('capacity')->default(30)->after('class_teacher_id');

            // Make code required again
            $table->string('code')->nullable(false)->change();
        });
    }
};
