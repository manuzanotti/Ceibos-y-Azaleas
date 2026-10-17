package com.ceibosyazaleas.service;

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


        return usuarioRepository.save(usuario);
    }

    public List<Usuario> mostrarUsuarios(){
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerUsuarioPorId(Long id){
        
        return usuarioRepository.findById(id);
    }

}
