package com.ceibosyazaleas.model;

/**
 * TipoDeUsuario
 */
public enum TipoDeUsuario {
    CLIENTE ("CLIENTE"),
    EMPLEADO("EMPLEADO"),
    ADMINISTRADOR("ADMINISTRADOR");


    private String descripcion;

    private TipoDeUsuario(String descripcion){
        this.descripcion = descripcion;
    }

    public String getDescripcion(){
        return this.descripcion;
    }
}   
