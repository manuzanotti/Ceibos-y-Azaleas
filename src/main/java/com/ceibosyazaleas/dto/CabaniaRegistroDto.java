package com.ceibosyazaleas.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CabaniaRegistroDto {
    @NotBlank (message = "El nombre de la cabaña es obligatorio.")
    @Column (nullable = false)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Min (value = 1, message = "La capacidad mínima es de 1 persona.")
    @Column (nullable = false)
    private int capacidad;

    @NotNull (message = "El precio por noche es obligatorio")
    @Column (nullable = false)
    private float precioPorNoche;

    @Column (nullable = false)
    private String comodidades;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public int getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }

    public float getPrecioPorNoche() {
        return precioPorNoche;
    }

    public void setPrecioPorNoche(float precioPorNoche) {
        this.precioPorNoche = precioPorNoche;
    }

    public String getComodidades() {
        return comodidades;
    }

    public void setComodidades(String comodidades) {
        this.comodidades = comodidades;
    }











}
