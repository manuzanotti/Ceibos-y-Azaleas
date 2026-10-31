package com.ceibosyazaleas.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ceibosyazaleas.dto.ActualizarContraseniaDto;
import com.ceibosyazaleas.dto.ActualizarTipoDeUsuarioDto;
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

    //Obtiene la solicitud para listar todos los usuarios.
    @GetMapping
    public ResponseEntity<?> listarUsuarios(){
        try {
            List <Usuario> usuarios = usuarioService.mostrarUsuarios();
            return ResponseEntity.status(HttpStatus.OK).body(usuarios);
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
       
    }
    //Obtiene un usuario por su id
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(usuario);
    }

    //Obtiene la solicitud de registro del usuario
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

    //Obtiene la solicitud para actualizar los datos de la cuenta. Este metodo es para el usuario Cliente.
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarDatosUsuario(@PathVariable Long id , @RequestBody Usuario usuario){
        try {
            Usuario usuarioActualizado = usuarioService.actualizarDatosUsuario(id, usuario);
            return ResponseEntity.status(HttpStatus.OK).body(usuarioActualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    //obtiene la solicitud para hacer el cambio de contraseña
    @PatchMapping("/{id}/password")
    public ResponseEntity<?> actualizarContrasenia(@PathVariable Long id, @RequestBody  ActualizarContraseniaDto dto){
        try {
            usuarioService.actualizarContrasenia(id ,dto.getPasswordActual(), dto.getPasswordNueva());
            return ResponseEntity.ok("contraseña actualizada!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    //Este metodo nos sirve para poder definir que tipo de usuario es la cuenta.
    @PatchMapping("/{id}/tipoDeUsuario")
    public ResponseEntity<?> modificarTipoDeUsuario(@PathVariable Long id , @RequestBody ActualizarTipoDeUsuarioDto dto){
        try {
            usuarioService.modificarTipoDeUsuario(id, dto.getTipoDeUsuario());
            return ResponseEntity.ok("Usuario modificado con exito!");
        } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    //Este metodo deshabilita una cuenta.
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> desactivarCuenta(@PathVariable Long id){
        try {
            usuarioService.desactivarCuenta(id);
            return ResponseEntity.ok("La cuenta ha sido desactivada.");
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    //Elimina un usuario de la aplicacion, no es recomendable por las relaciones que tiene entre las entidades.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> elimiarUsuarioPorId(@PathVariable Long id){
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.status(HttpStatus.OK).body("Usuario eliminado con éxito!");    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); 
        }
    }



    

}
