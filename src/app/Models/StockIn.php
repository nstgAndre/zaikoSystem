<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockIn extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id', 'inItem'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }
}
