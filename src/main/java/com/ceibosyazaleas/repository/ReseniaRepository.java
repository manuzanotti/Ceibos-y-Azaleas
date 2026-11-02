package com.ceibosyazaleas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ceibosyazaleas.model.Resenia;


public interface ReseniaRepository extends JpaRepository<Resenia, Long> {

    // Método para verificar si ya existe una reseña asociada a una reserva específica
    boolean existsByReservaId(Long reservaId);

}