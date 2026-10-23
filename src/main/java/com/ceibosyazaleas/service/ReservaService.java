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
        // 1. Validación de fechas lógicas
        if (!dto.getFechaCheckOut().isAfter(dto.getFechaCheckIn())) {
            throw new RuntimeException("La fecha de salida debe ser posterior a la fecha de entrada.");
        }

        // 2. Buscar al usuario que realiza la reserva
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("El usuario asociado no existe."));

        // 3. Buscar la cabaña que se va a reservar
        Cabania cabania = cabaniaRepository.findById(dto.getCabaniaId())
                .orElseThrow(() -> new RuntimeException("La cabaña no existe."));

        // 4. NUEVA VALIDACIÓN: Capacidad máxima (Adultos + Menores)
        int totalPersonas = dto.getCantidadAdultos() + dto.getCantidadMenores();
        if (totalPersonas > cabania.getCapacidad()) {
            throw new RuntimeException("La cantidad total de huéspedes (" + totalPersonas + 
                ") supera la capacidad máxima de la cabaña (" + cabania.getCapacidad() + ").");
        }

        // 5. NUEVA VALIDACIÓN: Disponibilidad de fechas (Evitar solapamientos)
        List<Reserva> solapadas = reservaRepository.encontrarReservasSolapadas(
            dto.getCabaniaId(), dto.getFechaCheckIn(), dto.getFechaCheckOut()
        );

        if (!solapadas.isEmpty()) {
            throw new RuntimeException("Lo sentimos, la cabaña ya se encuentra reservada o no está disponible en las fechas seleccionadas.");
        }

        // 6. Instanciar y guardar la reserva (el constructor por defecto ya le asigna EstadoReserva.PENDIENTE)
        Reserva reserva = new Reserva(
            cabania,
            usuario, 
            dto.getFechaCheckIn(),
            dto.getFechaCheckOut(),
            dto.getCantidadAdultos(), 
            dto.getCantidadMenores(), 
            dto.getTelefono(), 
            dto.getPrecioTotal()
        );

        return reservaRepository.save(reserva);
    }

    public List<Reserva> obtenerReservasPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }
}