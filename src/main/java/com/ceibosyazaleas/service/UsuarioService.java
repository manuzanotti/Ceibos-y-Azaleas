package com.ceibosyazaleas.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ceibosyazaleas.model.Usuario;
import com.ceibosyazaleas.repository.UsuarioRepository;

@Service 
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository){
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario validarUsuario(String email, String password){
        Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(()-> new RuntimeException ("Credenciales Incorrectas")) ;

        if(!usuario.getPassword().equalsIgnoreCase(password)){
            throw new RuntimeException("Credenciales incorrectas");
        }

        return usuario;

    }

    public Usuario registrarUsuario(Usuario usuario){
        if(usuarioRepository.findByEmail(usuario.getEmail()).isPresent()){
            throw new RuntimeException("Ya existe una cuenta vinculada a ese email.");
        }

        if(usuarioRepository.findByDni(usuario.getDni()).isPresent()){
            throw new RuntimeException("Ya existe una cuenta vinculada con ese numero de documento");
        }

        if(usuario.getFechaNacimiento() == null){
            throw new RuntimeException("La fecha de nacimiento es obligatoria.");
        }
            LocalDate hoy = LocalDate.now();
            
        // Validar que no sea una fecha en el futuro (¡o el año 222222!)
        if (usuario.getFechaNacimiento().isAfter(hoy)) {
            throw new RuntimeException("La fecha de nacimiento no puede ser en el futuro.");
        }
            
        // Validar que sea mayor de 18 años
        int edad = Period.between(usuario.getFechaNacimiento(), hoy).getYears();
        if (edad < 18) {
            throw new RuntimeException("Debes ser mayor de 18 años para registrarte.");
        }
            
            // Opcional: poner un límite lógico de antigüedad (ej: nadie nació en 1800)
        if (edad > 120) {
            throw new RuntimeException("Por favor, ingresa una fecha de nacimiento válida.");
        }
        

        return usuarioRepository.save(usuario);
    }

    public List<Usuario> mostrarUsuarios(){
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerUsuarioPorId(Long id){
        
        return usuarioRepository.findById(id);
    }

}
