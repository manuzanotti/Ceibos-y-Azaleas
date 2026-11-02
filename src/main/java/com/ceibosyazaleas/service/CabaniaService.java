package com.ceibosyazaleas.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ceibosyazaleas.dto.ActualizarCabaniaDto;
import com.ceibosyazaleas.dto.CabaniaRegistroDto;
import com.ceibosyazaleas.model.Cabania;
import com.ceibosyazaleas.model.Reserva;
import com.ceibosyazaleas.repository.CabaniaRepository;
import com.ceibosyazaleas.repository.ReservaRepository;

import jakarta.transaction.Transactional;

@Service 
public class CabaniaService {
    private CabaniaRepository cabaniaRepository;
    private ReservaRepository   reservaRepository;

    public CabaniaService(CabaniaRepository cabaniaRepository, ReservaRepository reservaRepository){
        this.cabaniaRepository = cabaniaRepository;
        this.reservaRepository = reservaRepository;
    }

    public List<Cabania> mostrarCabanias(){
        return cabaniaRepository.findAll();
    }

    public List<Cabania> mostrarCabaniasDisponibles(){
        return cabaniaRepository.findAllByActivaTrue();
    }

    public Optional <Cabania> obtenerCabaniaPorId(Long id){
        return cabaniaRepository.findById(id);
    }

    public Cabania registrarCabania(CabaniaRegistroDto  dto){
       Cabania nuevaCabania = new Cabania(
        dto.getNombre(), 
        dto.getDescripcion(), 
        dto.getCapacidad(), 
        dto.getComodidades(), 
        dto.getPrecioPorNoche());

        return cabaniaRepository.save(nuevaCabania);
    }

    @Transactional
    public Cabania modificarCabania(Long id, ActualizarCabaniaDto dto) {
        Cabania cabaniaExistente = cabaniaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la cabaña con ID: " + id));

        cabaniaExistente.setNombre(dto.getNombre());
        cabaniaExistente.setCapacidad(dto.getCapacidad());
        cabaniaExistente.setPrecioPorNoche(dto.getPrecioPorNoche());
        cabaniaExistente.setActiva(dto.getActiva());
        cabaniaExistente.setComodidades(dto.getComodidades());
        cabaniaExistente.setDescripcion(dto.getDescripcion());

        return cabaniaRepository.save(cabaniaExistente);
    }

    @Transactional // ¡Fundamental para que todo ocurra en la misma transacción segura!
    public boolean eliminarCabania(Long id) {
        if (cabaniaRepository.existsById(id)) {
            
            // 1. Buscamos y borramos primero todas las reservas asociadas a esta cabaña
            List<Reserva> reservasAsociadas = reservaRepository.findByCabaniaId(id);
            if (reservasAsociadas != null && !reservasAsociadas.isEmpty()) {
                reservaRepository.deleteAll(reservasAsociadas);
            }
            
            // 2. Una vez libres las dependencias, borramos la cabaña sin que explote la FK
            cabaniaRepository.deleteById(id);
            return true;
        }
        return false;
    }


}
