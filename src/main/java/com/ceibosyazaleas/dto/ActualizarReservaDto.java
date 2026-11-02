package com.ceibosyazaleas.dto;


import java.time.LocalDate;

public class ActualizarReservaDto {
    private Long cabaniaId;
    private String estado;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer cantidadAdultos;
    private Integer cantidadMenores;
    private String telefono;
    private Double precioTotal;

    // Getters y Setters
    public Long getCabaniaId() { return cabaniaId; }
    public void setCabaniaId(Long cabaniaId) { this.cabaniaId = cabaniaId; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    
    public Integer getCantidadAdultos() { return cantidadAdultos; }
    public void setCantidadAdultos(Integer cantidadAdultos) { this.cantidadAdultos = cantidadAdultos; }
    
    public Integer getCantidadMenores() { return cantidadMenores; }
    public void setCantidadMenores(Integer cantidadMenores) { this.cantidadMenores = cantidadMenores; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public Double getPrecioTotal() { return precioTotal; }
    public void setPrecioTotal(Double precioTotal) { this.precioTotal = precioTotal; }
}