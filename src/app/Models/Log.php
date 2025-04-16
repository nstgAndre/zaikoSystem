<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;


    // 暫定
    protected $fillable = [
        'item_id', 
    ];

    // 暫定！！！！！！！！！！！１

    // public function item()
    // {
    //     return $this->belongsTo(Item::class, 'item_id');
    // }
}
