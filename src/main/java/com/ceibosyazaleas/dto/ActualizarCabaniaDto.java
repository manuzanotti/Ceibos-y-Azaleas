package com.ceibosyazaleas.dto;

public class ActualizarCabaniaDto {
    
private String nombre;
    private Integer capacidad;
    private Float precioPorNoche;
    private Boolean activa; // Representa la disponibilidad (true/false)
    private String comodidades;
    private String descripcion;

    // Constructores por defecto y con parámetros
    public ActualizarCabaniaDto() {}

    public ActualizarCabaniaDto(String nombre, Integer capacidad, Float precioPorNoche, Boolean activa, String comodidades, String descripcion) {
        this.nombre = nombre;
        this.capacidad = capacidad;
        this.precioPorNoche = precioPorNoche;
        this.activa = activa;
        this.comodidades = comodidades;
        this.descripcion = descripcion;
    }

    // Getters y Setters
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public Float getPrecioPorNoche() {
        return precioPorNoche;
    }

    public void setPrecioPorNoche(Float precioPorNoche) {
        this.precioPorNoche = precioPorNoche;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public String getComodidades() {
        return comodidades;
    }

    public void setComodidades(String comodidades) {
        this.comodidades = comodidades;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
