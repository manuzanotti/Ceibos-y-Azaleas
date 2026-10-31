package com.ceibosyazaleas.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ceibosyazaleas.dto.CabaniaRegistroDto;
import com.ceibosyazaleas.model.Cabania;
import com.ceibosyazaleas.service.CabaniaService;

import jakarta.validation.Valid;



@RestController 
@RequestMapping ("/api/cabanias")
public class CabaniaController {
   
    private CabaniaService cabaniaService;

    public CabaniaController(CabaniaService cabaniaService){
        this.cabaniaService = cabaniaService;

    }

    //Metodo para mostrar las cabañas
    @GetMapping
    public ResponseEntity<?> mostrarCabanias(){
        return ResponseEntity.ok(cabaniaService.mostrarCabanias());
    }

    //Metodo para mostrar las cabañas que no estan reservadas.
    @GetMapping("/activas")
    public ResponseEntity<?> mostrarCabaniasActivas(){
       
           return ResponseEntity.ok(cabaniaService.mostrarCabaniasDisponibles());     
       
    }

    //Metodo para crear/registrar una cabaña
    @PostMapping
    public ResponseEntity<?> registrarCabania(@Valid @RequestBody CabaniaRegistroDto dto){
        try {
            Cabania nuevaCabania = cabaniaService.registrarCabania(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCabania);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }








}
