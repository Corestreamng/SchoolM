<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\ParentModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $password = Hash::make('12345678');

    // Create Admin User
    $admin = User::create([
      'name' => 'Admin User',
      'email' => 'admin@coreskool.edu',
      'password' => $password,
      'role' => 'admin',
      'phone' => '+2348012345678',
      'address' => '123 Admin Street, Lagos',
    ]);

    // Create Staff User
    $staff = User::create([
      'name' => 'Staff User',
      'email' => 'staff@coreskool.edu',
      'password' => $password,
      'role' => 'staff',
      'phone' => '+2348012345679',
      'address' => '123 Staff Street, Lagos',
    ]);

    // Create Teachers
    $teachers = [
      [
        'name' => 'Mr. Adeyemi',
        'email' => 'adeyemi@coreskool.edu',
        'teacher_id' => 'TCH001',
        'qualification' => 'B.Sc Mathematics',
        'specialization' => 'Mathematics',
        'hire_date' => '2018-08-15',
      ],
      [
        'name' => 'Mrs. Eze',
        'email' => 'eze@coreskool.edu',
        'teacher_id' => 'TCH002',
        'qualification' => 'B.A English',
        'specialization' => 'English Language',
        'hire_date' => '2019-09-10',
      ],
      [
        'name' => 'Dr. Okoye',
        'email' => 'okoye@coreskool.edu',
        'teacher_id' => 'TCH003',
        'qualification' => 'Ph.D Sciences',
        'specialization' => 'Sciences',
        'hire_date' => '2017-08-20',
      ],
      [
        'name' => 'Prof. Akinwande',
        'email' => 'akinwande@coreskool.edu',
        'teacher_id' => 'TCH004',
        'qualification' => 'Ph.D History',
        'specialization' => 'History & Government',
        'hire_date' => '2015-09-05',
      ],
      [
        'name' => 'Mr. Hassan',
        'email' => 'hassan@coreskool.edu',
        'teacher_id' => 'TCH005',
        'qualification' => 'M.Sc Physics',
        'specialization' => 'Physics',
        'hire_date' => '2020-08-12',
      ],
    ];

    foreach ($teachers as $teacherData) {
      $user = User::create([
        'name' => $teacherData['name'],
        'email' => $teacherData['email'],
        'password' => $password,
        'role' => 'teacher',
        'phone' => '+2348012345' . rand(100, 999),
      ]);

      Teacher::create([
        'user_id' => $user->id,
        'teacher_id' => $teacherData['teacher_id'],
        'qualification' => $teacherData['qualification'],
        'specialization' => $teacherData['specialization'],
        'hire_date' => $teacherData['hire_date'],
        'status' => 'active',
      ]);
    }

    // Create Parents
    $parents = [
      [
        'name' => 'Mr. Adekunle',
        'email' => 'adekunle.parent@coreskool.edu',
        'parent_id' => 'PAR001',
        'occupation' => 'Engineer',
        'relationship' => 'Father',
      ],
      [
        'name' => 'Mrs. Okafor',
        'email' => 'okafor.parent@coreskool.edu',
        'parent_id' => 'PAR002',
        'occupation' => 'Doctor',
        'relationship' => 'Mother',
      ],
      [
        'name' => 'Mr. Nwankwo',
        'email' => 'nwankwo.parent@coreskool.edu',
        'parent_id' => 'PAR003',
        'occupation' => 'Lawyer',
        'relationship' => 'Father',
      ],
      [
        'name' => 'Mrs. Lawal',
        'email' => 'lawal.parent@coreskool.edu',
        'parent_id' => 'PAR004',
        'occupation' => 'Teacher',
        'relationship' => 'Mother',
      ],
      [
        'name' => 'Mr. Ahmed',
        'email' => 'ahmed.parent@coreskool.edu',
        'parent_id' => 'PAR005',
        'occupation' => 'Businessman',
        'relationship' => 'Father',
      ],
    ];

    $parentUsers = [];
    foreach ($parents as $parentData) {
      $user = User::create([
        'name' => $parentData['name'],
        'email' => $parentData['email'],
        'password' => $password,
        'role' => 'parent',
        'phone' => '+2348012345' . rand(100, 999),
      ]);

      $parentModel = ParentModel::create([
        'user_id' => $user->id,
        'parent_id' => $parentData['parent_id'],
        'occupation' => $parentData['occupation'],
        'relationship' => $parentData['relationship'],
      ]);

      $parentUsers[] = $parentModel;
    }

    // Create Students
    $students = [
      [
        'name' => 'John Adekunle',
        'email' => 'john.adekunle@coreskool.edu',
        'student_id' => 'STU001',
        'date_of_birth' => '2010-05-15',
        'gender' => 'male',
        'admission_date' => '2022-09-15',
        'parent_index' => 0,
      ],
      [
        'name' => 'Sarah Okafor',
        'email' => 'sarah.okafor@coreskool.edu',
        'student_id' => 'STU002',
        'date_of_birth' => '2009-03-20',
        'gender' => 'female',
        'admission_date' => '2021-09-10',
        'parent_index' => 1,
      ],
      [
        'name' => 'Chioma Nwankwo',
        'email' => 'chioma.nwankwo@coreskool.edu',
        'student_id' => 'STU003',
        'date_of_birth' => '2008-07-10',
        'gender' => 'female',
        'admission_date' => '2020-09-12',
        'parent_index' => 2,
      ],
      [
        'name' => 'Oluwaseun Lawal',
        'email' => 'oluwaseun.lawal@coreskool.edu',
        'student_id' => 'STU004',
        'date_of_birth' => '2011-11-25',
        'gender' => 'male',
        'admission_date' => '2023-01-20',
        'parent_index' => 3,
      ],
      [
        'name' => 'Zainab Ahmed',
        'email' => 'zainab.ahmed@coreskool.edu',
        'student_id' => 'STU005',
        'date_of_birth' => '2007-09-08',
        'gender' => 'female',
        'admission_date' => '2019-09-08',
        'parent_index' => 4,
      ],
    ];

    foreach ($students as $studentData) {
      $user = User::create([
        'name' => $studentData['name'],
        'email' => $studentData['email'],
        'password' => $password,
        'role' => 'student',
        'phone' => '+2348012345' . rand(100, 999),
      ]);

      Student::create([
        'user_id' => $user->id,
        'student_id' => $studentData['student_id'],
        'date_of_birth' => $studentData['date_of_birth'],
        'gender' => $studentData['gender'],
        'parent_id' => $parentUsers[$studentData['parent_index']]->id,
        'admission_date' => $studentData['admission_date'],
        'status' => 'active',
        // class_id can be set later when classes are created
      ]);
    }

    $this->command->info('Users seeded successfully!');
    $this->command->info('All users have the password: 12345678');
  }
}
