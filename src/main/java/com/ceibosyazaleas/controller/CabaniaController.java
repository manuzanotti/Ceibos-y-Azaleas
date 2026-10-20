package com.ceibosyazaleas.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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


    @GetMapping
    public ResponseEntity<?> mostrarCabanias(){
        return ResponseEntity.ok(cabaniaService.mostrarCabanias());
    }

    @GetMapping("/activas")
    public ResponseEntity<?> mostrarCabaniasActivas(){
       
           return ResponseEntity.ok(cabaniaService.mostrarCabaniasDisponibles());     
       
    }


    @PostMapping("/registrar")
    public ResponseEntity<?> registrarCabania(@Valid @RequestBody Cabania cabania){
        try {
            Cabania nuevaCabania = cabaniaService.registrarCabania(cabania);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCabania);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }








}
