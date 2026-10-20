package com.ceibosyazaleas.repository;


import com.ceibosyazaleas.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Buscar todas las reservas de un usuario específico (para "Mis Reservas")
    List<Reserva> findByUsuarioId(Long usuarioId);
}