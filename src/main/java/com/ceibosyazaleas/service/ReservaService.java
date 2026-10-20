package com.ceibosyazaleas.service;

import com.ceibosyazaleas.dto.ReservaDto;
import com.ceibosyazaleas.model.Cabania;
import com.ceibosyazaleas.model.Reserva;
import com.ceibosyazaleas.model.Usuario;
import com.ceibosyazaleas.repository.CabaniaRepository;
import com.ceibosyazaleas.repository.ReservaRepository;
import com.ceibosyazaleas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CabaniaRepository cabaniaRepository;

    public ReservaService(ReservaRepository reservaRepository, UsuarioRepository usuarioRepository,
         CabaniaRepository cabaniaRepository) {
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
        this.cabaniaRepository = cabaniaRepository;
    }

    public Reserva crearReserva(ReservaDto dto) {
        // Validación de fechas
        if (!dto.getFechaCheckOut().isAfter(dto.getFechaCheckIn())) {
            throw new RuntimeException("La fecha de salida debe ser posterior a la fecha de entrada.");
        }

        // Buscar al usuario que realiza la reserva
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("El usuario asociado no existe."));

        // Buscar la cabaña que se va a reservar
        Cabania cabania = cabaniaRepository.findById(dto.getCabaniaId())
                .orElseThrow(() -> new RuntimeException("La cabaña no existe."));

        // Instanciar y guardar la reserva
        Reserva reserva = new Reserva(cabania,
             usuario, 
             dto.getFechaCheckIn(),
             dto.getFechaCheckOut(),
             dto.getCantAdultos(), 
             dto.getCantMenores(), 
             dto.getTelefono(), 
             dto.getPrecioTotal());

        return reservaRepository.save(reserva);
    }

    public List<Reserva> obtenerReservasPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }
}