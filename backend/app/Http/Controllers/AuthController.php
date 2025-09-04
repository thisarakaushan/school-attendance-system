<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {          // Check email/password
            $user = Auth::user();
            $token = $user->createToken('authToken')->plainTextToken;  // Create token
            return response()->json([
                'token' => $token,
                'user' => $user
            ]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function logout()
    {
        Auth::user()->tokens()->delete();           // Delete all tokens
        return response()->json(['message' => 'Logged out']);
    }
}
