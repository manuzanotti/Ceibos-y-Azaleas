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

    public Optional <Cabania> mostrarCabaniaPorNombre(String nombre){
        return cabaniaRepository.findByName(nombre);
    }

    public Optional <Cabania> mostrarCabaniaPorCapacidad(int capacidad){
        return cabaniaRepository.findByCap(capacidad);
    }







}
