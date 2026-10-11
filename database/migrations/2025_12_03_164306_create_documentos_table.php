<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 20)->unique();
            $table->timestamps();
        });

        DB::table('documentos')->insert(array('id'=>'1','nombre'=>'CÉDULA'));
        DB::table('documentos')->insert(array('id'=>'2','nombre'=>'PASAPORTE'));
        DB::table('documentos')->insert(array('id'=>'3','nombre'=>'RUC'));
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};
