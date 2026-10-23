package com.ceibosyazaleas.service;

import com.ceibosyazaleas.model.EstadoReserva;
import com.ceibosyazaleas.model.Reserva;
import com.ceibosyazaleas.repository.ReservaRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaExpirationService {

    private final ReservaRepository reservaRepository;

    public ReservaExpirationService(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    // Se ejecuta automáticamente cada 60.000 milisegundos (1 minuto)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelarReservasExpiradas() {
        // Calcular el límite de tiempo (el momento actual menos 20 minutos)
        LocalDateTime limiteTiempo = LocalDateTime.now().minusMinutes(20);

        // Buscar reservas pendientes creadas hace más de 20 minutos
        List<Reserva> reservasExpiradas = reservaRepository.findPendientesExpiradas(limiteTiempo);

        if (!reservasExpiradas.isEmpty()) {
            for (Reserva reserva : reservasExpiradas) {
                reserva.setEstado(EstadoReserva.CANCELADA);
                reservaRepository.save(reserva);
            }
            System.out.println("Se cancelaron automáticamente " + reservasExpiradas.size() + " reserva(s) por superar el tiempo de pago de 20 minutos.");
        }
    }
}