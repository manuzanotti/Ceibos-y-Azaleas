package com.ceibosyazaleas.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ceibosyazaleas.model.Cabania;
import com.ceibosyazaleas.repository.CabaniaRepository;

@Service 
public class CabaniaService {
    private CabaniaRepository cabaniaRepository;

    public CabaniaService(CabaniaRepository cabaniaRepository){
        this.cabaniaRepository = cabaniaRepository;
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

    public Cabania registrarCabania(Cabania cabania){
        return cabaniaRepository.save(cabania);
    }




}
