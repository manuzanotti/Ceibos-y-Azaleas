package com.ceibosyazaleas.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ceibosyazaleas.dto.LoginDto;
import com.ceibosyazaleas.model.Usuario;
import com.ceibosyazaleas.service.UsuarioService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping("/api/auth")
public class LoginDtoController {
    private UsuarioService usuarioService;


    public LoginDtoController(UsuarioService usuarioSerice){
        this.usuarioService = usuarioSerice;
    }



    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto){
        ResponseEntity<?> responseEntity = null;
        try {
            Usuario usuario = usuarioService.validarUsuario(loginDto.getEmail(), loginDto.getPassword());
            responseEntity = ResponseEntity.status(HttpStatus.OK).body(usuario);
        } catch (Exception e) {
            responseEntity = ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } 

        return responseEntity;
    }



}
