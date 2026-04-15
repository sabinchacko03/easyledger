<?php

use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\CustomerController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DocumentController;
use App\Http\Controllers\Web\InviteRegistrationController;
use App\Http\Controllers\Web\SalespersonController;
use App\Http\Controllers\Web\SuperAdminController;
use App\Http\Controllers\Web\TenantController;
use Illuminate\Support\Facades\Route;

// Invite registration (token-gated, no session required)
Route::get('/invite/{token}', [InviteRegistrationController::class, 'show'])->name('invite.show');
Route::post('/invite/{token}/register', [InviteRegistrationController::class, 'register'])->name('invite.register');
Route::get('/invite/{token}/success', [InviteRegistrationController::class, 'success'])->name('invite.success');

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated admin routes
Route::middleware(['auth', 'role:admin,web'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Salesperson management
    Route::get('/salespeople', [SalespersonController::class, 'index'])->name('salespeople.index');
    Route::get('/salespeople/create', [SalespersonController::class, 'create'])->name('salespeople.create');
    Route::post('/salespeople', [SalespersonController::class, 'store'])->name('salespeople.store');
    Route::get('/salespeople/{salesperson}', [SalespersonController::class, 'show'])->name('salespeople.show');
    Route::patch('/salespeople/{salesperson}/toggle', [SalespersonController::class, 'toggle'])->name('salespeople.toggle');

    // Customer management
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // Document viewer
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
    Route::get('/documents/{document}/pdf', [DocumentController::class, 'pdf'])->name('documents.pdf');

    // Company settings
    Route::get('/settings', [TenantController::class, 'edit'])->name('settings.edit');
    Route::post('/settings', [TenantController::class, 'update'])->name('settings.update');
    Route::delete('/settings/logo', [TenantController::class, 'deleteLogo'])->name('settings.logo.delete');
});

// Super admin portal
Route::middleware(['auth', 'super.admin'])->prefix('super')->name('super.')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/',             [SuperAdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/settings',     [SuperAdminController::class, 'settings'])->name('settings');
    Route::put('/settings/{key}', [SuperAdminController::class, 'updateSetting'])->name('settings.update');
    Route::get('/invitations',  [SuperAdminController::class, 'invitations'])->name('invitations');
    Route::post('/invitations/{invitation}/resend', [SuperAdminController::class, 'resendInvitation'])->name('invitations.resend');
    Route::get('/tenants',      [SuperAdminController::class, 'tenants'])->name('tenants');
});
