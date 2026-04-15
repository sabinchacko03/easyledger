<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EasyController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\SalespersonController;
use App\Http\Controllers\Api\SuperAdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Easy mode — no authentication required
Route::prefix('easy')->group(function () {
    Route::get('/config', [EasyController::class, 'config']);
    Route::post('/invite', [EasyController::class, 'invite']);
    Route::post('/resend', [EasyController::class, 'resend']);
    Route::get('/status', [EasyController::class, 'status']);
});

/*
|--------------------------------------------------------------------------
| Authenticated routes (any role)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Easy receipt sync — called on first full login after easy-mode upgrade
    Route::post('/easy/sync', [EasyController::class, 'sync']);

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

    /*
    |--------------------------------------------------------------------------
    | Super admin routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\IsSuperAdmin::class)->prefix('super')->group(function () {
        Route::get('/settings', [SuperAdminController::class, 'indexSettings']);
        Route::put('/settings/{key}', [SuperAdminController::class, 'updateSetting']);
        Route::get('/invitations', [SuperAdminController::class, 'indexInvitations']);
        Route::post('/invitations/{invitation}/resend', [SuperAdminController::class, 'resendInvitation']);
    });
});
