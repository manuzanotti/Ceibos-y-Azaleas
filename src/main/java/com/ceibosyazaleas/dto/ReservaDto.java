package com.ceibosyazaleas.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReservaDto {
    @NotNull(message = "El ID del usuario es obligatorio")
    private Long usuarioId;
    
    @NotNull(message = "El ID de la cabaña es obligatorio")
    private Long cabaniaId;
    
    @NotNull(message = "La fecha de check-in es obligatoria")
    @FutureOrPresent(message = "La fecha debe ser presente o futura")
    private LocalDate fechaCheckIn;
    
    @NotNull(message = "La fecha de check-out es obligatoria")
    private LocalDate fechaCheckOut;

    @Min(value = 1, message = "Al menos 1 adulto es requerido")
    private int cantidadAdultos;

    private int cantidadMenores;

    @NotBlank(message = "El teléfono de contacto es obligatorio")
    private String telefono;

    @NotNull(message = "El precio total es obligatorio")
    private Double precioTotal;



   



    public Long getUsuarioId() {
        return usuarioId;
    }

    public Long getCabaniaId() {
        return cabaniaId;
    }

    public LocalDate getFechaCheckIn() {
        return fechaCheckIn;
    }

    public LocalDate getFechaCheckOut() {
        return fechaCheckOut;
    }

    public int getCantidadAdultos() {
        return cantidadAdultos;
    }

    public int getCantidadMenores() {
        return cantidadMenores;
    }

    public String getTelefono() {
        return telefono;
    }

    public Double getPrecioTotal() {
        return precioTotal;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public void setCabaniaId(Long cabaniaId) {
        this.cabaniaId = cabaniaId;
    }

    public void setFechaCheckIn(LocalDate fechaCheckIn) {
        this.fechaCheckIn = fechaCheckIn;
    }

    public void setFechaCheckOut(LocalDate fechaCheckOut) {
        this.fechaCheckOut = fechaCheckOut;
    }

    public void setCantidadAdultos(int cantidadAdultos) {
        this.cantidadAdultos = cantidadAdultos;
    }

    public void setCantidadMenores(int cantMenores) {
        this.cantidadMenores = cantMenores;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void setPrecioTotal(Double precioTotal) {
        this.precioTotal = precioTotal;
    }










    
}
