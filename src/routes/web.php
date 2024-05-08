<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\ProfileController;
// 2
use App\Http\Controllers\TestController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/test', [TestController::class, 'index']); // テスト連携用

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/index', function () {
    return Inertia::render('Index');
})->middleware(['auth', 'verified'])->name('index');

//Index画面
Route::middleware('auth')->group(function () {
    Route::get('/api/items', [ItemController::class, 'index']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

<<<<<<< HEAD
#2　変更します。
Route::get('/items', [ItemController::class, 'index']);
// Route::get('/items/create', [ItemController::class, 'create'])->name('items.create');
// Route::post('/items', [ItemController::class, 'store'])->name('items.store');

#3 変更します。
Route::get('/items/createTest', [ItemController::class, 'create'])->name('items.createTest');
Route::post('/items', [ItemController::class, 'store'])->name('items.store');
=======
// 2
Route::get('/items', [ItemController::class, 'index']);
// Route::get('/items/create', [ItemController::class, 'create'])->name('items.create');
// Route::post('/items', [ItemController::class, 'store'])->name('items.store');
>>>>>>> eb1233cf33e682590b24942ef940e11fd177ea34
