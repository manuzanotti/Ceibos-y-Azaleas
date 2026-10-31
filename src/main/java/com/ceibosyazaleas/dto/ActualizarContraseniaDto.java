package com.ceibosyazaleas.dto;



public class ActualizarContraseniaDto {
    private String passwordActual;
    private String passwordNueva;

    // Getters y Setters
    public String getPasswordActual() { 
        return passwordActual; 
    }
    public void setPasswordActual(String passwordActual) { 
        this.passwordActual = passwordActual; 
    }
    public String getPasswordNueva() { 
        return passwordNueva; 
    }
    public void setPasswordNueva(String passwordNueva) {
         this.passwordNueva = passwordNueva; 
        }
}
