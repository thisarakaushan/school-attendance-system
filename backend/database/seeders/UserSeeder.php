<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'admin'
        ]);

        User::create([
            'name' => 'Teacher',
            'email' => 'teacher@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'teacher'
        ]);
    }
}


// Run the seeder with: php artisan db:seed --class=UserSeeder