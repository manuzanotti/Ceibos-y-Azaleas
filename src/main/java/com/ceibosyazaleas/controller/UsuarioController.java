package com.ceibosyazaleas.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ceibosyazaleas.model.Usuario;
import com.ceibosyazaleas.service.UsuarioService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping("/api/usuarios") 
public class UsuarioController {
    private UsuarioService usuarioService;
    
    public UsuarioController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }    

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody Usuario usuario){
        ResponseEntity<?> r = null;
        try {
           Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
           r = ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
        } catch (Exception e) {
           r = ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }

        return r;
    } 



}
