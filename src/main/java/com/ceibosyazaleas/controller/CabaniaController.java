package com.ceibosyazaleas.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ceibosyazaleas.service.CabaniaService;


@Controller 
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
        try {
           return ResponseEntity.ok(cabaniaService.mostrarCabaniasDisponibles());     
        } catch (NullPointerException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }









}
