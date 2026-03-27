<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\SalespersonController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated routes (any role)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Customers — readable by all, writable by admin only
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);

    // Documents
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/documents/daily-stats', [DocumentController::class, 'dailyStats']);
    Route::get('/documents/{document}', [DocumentController::class, 'show']);
    Route::get('/documents/{document}/pdf', [PdfController::class, 'download']);

    // Salesperson: create & sync documents
    Route::middleware('role:salesperson|admin')->group(function () {
        Route::post('/documents', [DocumentController::class, 'store']);
        Route::post('/documents/sync', [DocumentController::class, 'sync']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin-only routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->group(function () {
        // Customer management
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::put('/customers/{customer}', [CustomerController::class, 'update']);
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

        // Salesperson management
        Route::get('/salespeople', [SalespersonController::class, 'index']);
        Route::post('/salespeople', [SalespersonController::class, 'store']);
        Route::get('/salespeople/{salesperson}', [SalespersonController::class, 'show']);
        Route::put('/salespeople/{salesperson}', [SalespersonController::class, 'update']);
    });
});
