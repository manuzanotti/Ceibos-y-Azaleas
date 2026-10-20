package com.ceibosyazaleas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity 
@Table (name = "cabanias")
public class Cabania {
    
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

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
    private Double precioPorNoche;

    @Column (nullable = false)
    private String comodidades;


    @Column (nullable = false)
    private boolean activa;


    public Cabania(){
        this.activa = true;
    }


    public Cabania(String nombre, String descripcion, int capacidad, String comodidades, double precioPorNoche) {
        this();
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.capacidad = capacidad;
        this.comodidades = comodidades;
        this.precioPorNoche = precioPorNoche;
        
    }


    public Long getId() {
        return id;
    }


    public String getNombre() {
        return nombre;
    }


    public String getDescripcion() {
        return descripcion;
    }


    public int getCapacidad() {
        return capacidad;
    }


    public String getComodidades() {
        return comodidades;
    }


    public Double getPrecioPorNoche() {
        return precioPorNoche;
    }


    public boolean isActiva() {
        return activa;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public void setNombre(String nombre) {
        this.nombre = nombre;
    }


    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }


    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }


    public void setComodidades(String comodidades) {
        this.comodidades = comodidades;
    }


    public void setPrecioPorNoche(Double precioPorNoche) {
        this.precioPorNoche = precioPorNoche;
    }


    public void setActiva(boolean activa) {
        this.activa = activa;
    }


    







}
