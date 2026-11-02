package com.ceibosyazaleas.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "resenas")
public class Resenia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación directa con la reserva para evitar duplicados y validar el botón
    @Column(name = "reserva_id", unique = true, nullable = false)
    private Long reservaId;

    @Column(name = "cabania_nombre", nullable = false)
    private String cabaniaNombre;

    @Column(name = "huesped_nombre", nullable = false)
    private String huespedNombre;

    @Column(name = "fechas_estadia", nullable = false)
    private String fechasEstadia;

    @Column(nullable = false)
    private Integer puntuacion; // Valor de 1 a 5 estrellas

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comentario;

    @Column(name = "fecha_creacion")
    private LocalDate fechaCreacion;

    // Constructores
    public Resenia() {
    }

    public Resenia(Long reservaId, String cabaniaNombre, String huespedNombre, String fechasEstadia, Integer puntuacion, String comentario) {
        this.reservaId = reservaId;
        this.cabaniaNombre = cabaniaNombre;
        this.huespedNombre = huespedNombre;
        this.fechasEstadia = fechasEstadia;
        this.puntuacion = puntuacion;
        this.comentario = comentario;
        this.fechaCreacion = LocalDate.now();
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReservaId() {
        return reservaId;
    }

    public void setReservaId(Long reservaId) {
        this.reservaId = reservaId;
    }

    public String getCabaniaNombre() {
        return cabaniaNombre;
    }

    public void setCabaniaNombre(String cabaniaNombre) {
        this.cabaniaNombre = cabaniaNombre;
    }

    public String getHuespedNombre() {
        return huespedNombre;
    }

    public void setHuespedNombre(String huespedNombre) {
        this.huespedNombre = huespedNombre;
    }

    public String getFechasEstadia() {
        return fechasEstadia;
    }

    public void setFechasEstadia(String fechasEstadia) {
        this.fechasEstadia = fechasEstadia;
    }

    public Integer getPuntuacion() {
        return puntuacion;
    }

    public void setPuntuacion(Integer puntuacion) {
        this.puntuacion = puntuacion;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDate getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDate fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}