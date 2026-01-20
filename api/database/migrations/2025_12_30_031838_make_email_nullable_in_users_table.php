<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the unique constraint on email
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });

        // Make email nullable
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });

        // Add unique constraint back (nullable unique allows multiple NULLs)
        Schema::table('users', function (Blueprint $table) {
            $table->unique('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Make email required again
            // First, ensure all emails are not null (set a default for any null values)
            DB::statement('UPDATE users SET email = CONCAT("user_", id, "@coreskool.local") WHERE email IS NULL');

            // Drop unique constraint, make it required, then add unique back
            $table->dropUnique(['email']);
            $table->string('email')->nullable(false)->unique()->change();
        });
    }
};
