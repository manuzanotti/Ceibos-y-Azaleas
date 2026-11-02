package com.ceibosyazaleas.controller;

import com.ceibosyazaleas.model.EstadoReserva;
import com.ceibosyazaleas.model.Resenia;
import com.ceibosyazaleas.model.Reserva;
import com.ceibosyazaleas.repository.ReseniaRepository;
import com.ceibosyazaleas.repository.ReservaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = "*") // Permite peticiones desde el frontend
public class ReseniaController {

    @Autowired
    private ReseniaRepository reseniaRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    //Endpoint para obtener todas las reseñas generales (vista general)
    @GetMapping("/publicas")
    public ResponseEntity<List<Resenia>> obtenerResenasPublicas() {
        List<Resenia> resenas = reseniaRepository.findAll();
        return ResponseEntity.ok(resenas);
    }

    //Endpoint para obtener las reseñas del cliente
    @GetMapping("/cliente")
    public ResponseEntity<List<Resenia>> obtenerResenasCliente() {
        List<Resenia> resenas = reseniaRepository.findAll(); 
        return ResponseEntity.ok(resenas);
    }

    //Endpoint para registrar una nueva reseña validando estado y duplicados
    @PostMapping
    public ResponseEntity<?> crearResena(@RequestBody Resenia nuevaResena, @RequestParam Long reservaId) {
        
        
        Reserva reserva = reservaRepository.findById(reservaId)
            .orElseThrow(() -> new RuntimeException("La reserva no existe."));

        //Validamos el estado
        if (reserva.getEstado() != EstadoReserva.CONFIRMADA && reserva.getEstado() != EstadoReserva.FINALIZADA) {
            return ResponseEntity.badRequest()
                .body("Solo se pueden reseñar reservas que se encuentren confirmadas o finalizadas.");
        }

        //Validamos si ya existe una reseña para esta reserva
        if (reseniaRepository.existsByReservaId(reservaId)) {
            return ResponseEntity.badRequest()
                .body("Esta reserva ya cuenta con una reseña registrada.");
        }

        //Asignamos el ID de la reserva a la entidad Resenia
        nuevaResena.setReservaId(reservaId);

        
        Resenia resenaGuardada = reseniaRepository.save(nuevaResena);
        return ResponseEntity.ok(resenaGuardada);
    }
}