package com.ceibosyazaleas.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity 
@Table(name = "reservas")
public class Reserva {
    
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cabania_id", nullable = false)
    private Cabania cabania;
    
    // Relación ManyToOne con la entidad Usuario
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @NotNull(message = "La fecha de check-in es obligatoria")
    @FutureOrPresent(message = "La fecha de entrada no puede ser del pasado")
    @Column(nullable = false)
    private LocalDate checkIn;
    
    
    @NotNull(message = "La fecha de check-out es obligatoria")
    @Column(nullable = false)
    private LocalDate chekOut;
    
    @Min(value = 1, message = "Debe haber al menos 1 adulto")
    @Column(nullable = false)
    private int cantidadAdultos;

    
    private int cantidadMenores;
    
    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false)
    private Double precioTotal;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReserva estado;



    public Reserva (){
        this.estado = EstadoReserva.PENDIENTE;
    }


    


    public Reserva(Cabania cabania, Usuario usuario,LocalDate checkIn,LocalDate chekOut,int cantidadAdultos,
         int cantidadMenores,String telefono, Double precioTotal) {
        this();
        this.cabania = cabania;
        this.usuario = usuario;
        this.checkIn = checkIn;
        this.chekOut = chekOut;
        this.cantidadAdultos = cantidadAdultos;
        this.cantidadMenores = cantidadMenores;
        this.telefono = telefono;
        this.precioTotal = precioTotal;
    }





    public Long getId() {
        return id;
    }



    public Cabania getCabania() {
        return cabania;
    }



    public Usuario getUsuario() {
        return usuario;
    }



    public LocalDate getCheckIn() {
        return checkIn;
    }



    public LocalDate getChekOut() {
        return chekOut;
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



    public EstadoReserva getEstado() {
        return estado;
    }



    public void setId(Long id) {
        this.id = id;
    }



    public void setCabania(Cabania cabania) {
        this.cabania = cabania;
    }



    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }



    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }



    public void setChekOut(LocalDate chekOut) {
        this.chekOut = chekOut;
    }



    public void setCantidadAdultos(int cantidadAdultos) {
        this.cantidadAdultos = cantidadAdultos;
    }



    public void setCantidadMenores(int cantidadMenores) {
        this.cantidadMenores = cantidadMenores;
    }



    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }



    public void setPrecioTotal(Double precioTotal) {
        this.precioTotal = precioTotal;
    }



    public void setEstado(EstadoReserva estado) {
        this.estado = estado;
    }






}
