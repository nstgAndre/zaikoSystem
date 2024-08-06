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

//ナビゲーションメニュー
Route::get('/index', function () {
    return Inertia::render('Index');
})->middleware(['auth', 'verified'])->name('index');


Route::get('/DeliverRegister', function () {
    return Inertia::render('DeliverRegister');
})->middleware(['auth', 'verified'])->name('DeliverRegister');

Route::get('/StorageRegister', function () {
    return Inertia::render('StorageRegister');
})->middleware(['auth', 'verified'])->name('StorageRegister');

//商品情報取得api

Route::middleware('auth')->group(function () {
    Route::get('/api/items', [ItemController::class, 'index']);
});
//csv取得
Route::middleware('auth')->group(function () {
Route::post('/api/items/csv', [ItemController::class, 'csv']);
});

//一括
Route::middleware('auth')->group(function () {
    Route::post('/api/items/bulk', [ItemController::class, 'insItemBulk']);
    });

//編集
Route::middleware('auth')->group(function () {
    Route::put('/api/items/{id}', [ItemController::class, 'updateItemDetails']);
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';


#2　変更します。
Route::get('/items', [ItemController::class, 'index']);


#3 変更します。
Route::get('/items/createTest', [ItemController::class, 'create'])->name('items.createTest');
Route::post('/items', [ItemController::class, 'store'])->name('items.store');


