package com.ceibosyazaleas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ceibosyazaleas.dto.ReservaDto;
import com.ceibosyazaleas.model.EstadoReserva;
import com.ceibosyazaleas.model.Reserva;
import com.ceibosyazaleas.service.ReservaService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping ("/api/reservas")
@CrossOrigin(origins = "*") // Permite la comunicación entre el front-end y el back-end en desarrollo local
public class ReservaController {
    
    private ReservaService reservaService;


    public ReservaController(ReservaService reservaService){
        this.reservaService = reservaService;
    }

    //Crear la reserva
    @PostMapping
    public ResponseEntity<?> crearReserva(@Valid @RequestBody ReservaDto reserva){
        try {
            Reserva nuevaReserva = reservaService.crearReserva(reserva);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaReserva);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    //Obtener las reservas de un usuario por su Id
    @GetMapping("usuario/{usuarioId}") 
    public ResponseEntity<List<Reserva>> obtenerReservasPorUsuario(@PathVariable Long usuarioId ){
        
           List<Reserva> reservas = reservaService.obtenerReservasPorUsuario(usuarioId);
            return ResponseEntity.status(HttpStatus.OK).body(reservas);
    }
    //Listar todas las reservas
    @GetMapping 
    public ResponseEntity<List<Reserva>> listarReservas(){
           List <Reserva> lista = reservaService.listarReservas();
            return ResponseEntity.status(HttpStatus.OK).body(lista);
    }


    //Cancela las reservas
    @PatchMapping("{id}/estado")
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id, EstadoReserva estado){
        try {
            reservaService.cancelarReserva(id, estado);
           return ResponseEntity.status(HttpStatus.OK).body("Reserva cancelada.");
        } catch (Exception e) {
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
      
    }


}
