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
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('documento_id');
            $table->foreign('documento_id')->references('id')->on('documentos');            
            $table->unsignedBigInteger('provincia_id');
            $table->foreign('provincia_id')->references('id')->on('provincias');
            $table->unsignedBigInteger('canton_id');
            $table->foreign('canton_id')->references('id')->on('cantones');
            $table->unsignedBigInteger('parroquia_id');
            $table->foreign('parroquia_id')->references('id')->on('parroquias');
            $table->string('documento',20)->unique();
            $table->string('nombre',100);
            $table->string('tipo_cliente',20);
            $table->string('cedula_representante_legal',100)->nullable();
            $table->string('representante_legal',100)->nullable();            
            $table->integer('compania')->default(0);
            $table->integer('artesano_calificado')->default(0);
            $table->string('direccion',100);
            $table->string('sector',100)->nullable();
            $table->string('referencia',100)->nullable();
            $table->string('telefonos',30)->nullable();
            $table->string('email',50)->nullable();            
            $table->string('archivo_fisico',10)->nullable();
            $table->string('estado',10)->default('ACTIVO');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
