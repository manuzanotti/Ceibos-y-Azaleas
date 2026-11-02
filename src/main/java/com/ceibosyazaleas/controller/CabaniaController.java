package com.ceibosyazaleas.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ceibosyazaleas.dto.ActualizarCabaniaDto;
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

    //Metodo que recibe la peticion para modificar una cabaña
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCabania(@PathVariable Long id, @RequestBody ActualizarCabaniaDto dto) {
        try {
            Cabania actualizada = cabaniaService.modificarCabania(id, dto);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al modificar la cabaña: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
        public ResponseEntity<String> eliminarCabania(@PathVariable Long id) {
            boolean eliminada = cabaniaService.eliminarCabania(id);
            
            if (eliminada) {
                return ResponseEntity.ok("Cabaña eliminada correctamente.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No se encontró la cabaña con ID: " + id);
            }
        }





}
