<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockOut extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id', 'outItem'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }
}
