package com.ceibosyazaleas.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ceibosyazaleas.model.TipoDeUsuario;
import com.ceibosyazaleas.model.Usuario;
import com.ceibosyazaleas.repository.ReservaRepository;
import com.ceibosyazaleas.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service 
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, ReservaRepository reservaRepository){
        this.usuarioRepository = usuarioRepository;
        this.reservaRepository = reservaRepository;
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
            
            // poner un límite lógico de antigüedad (ej: nadie nació en 1800)
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


    public Usuario actualizarDatosUsuario(Long id, Usuario usuario){
        Usuario usuarioActualizado = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado")) ;
        
        // Actualizamos los campos recibidos del formulario. En este caso por el momento recibimos todos los datos del form. 
        // Algunos vienen por defecto y por el momento no se pueden modificar.
        usuarioActualizado.setNombre(usuario.getNombre());
        usuarioActualizado.setApellido(usuario.getApellido());
        usuarioActualizado.setEmail(usuario.getEmail());
        usuarioActualizado.setDni(usuario.getDni());
        usuarioActualizado.setTelefono(usuario.getTelefono());
        usuarioActualizado.setFechaNacimiento(usuario.getFechaNacimiento());

        //Estos datos son para el menu de adm
        usuarioActualizado.setTipoDeUsuario(usuario.getTipoDeUsuario());
        usuarioActualizado.setActivo(usuario.isActivo());

        return usuarioRepository.save(usuarioActualizado);
    }

    public Usuario actualizarContrasenia(Long id, String passwordActual, String passwordNueva){
        Usuario usuarioActualizado = usuarioRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
    
        if(passwordNueva == null || passwordNueva.isBlank()){
            throw new RuntimeException("La nueva contraseña no puede estar vacia.");
        }
    
        if(passwordNueva == usuarioActualizado.getPassword()){
            throw new RuntimeException("La nueva contraseña no puede ser igual a la contraseña actual.");
        }
        
        usuarioActualizado.setPassword(passwordNueva);
        return usuarioRepository.save(usuarioActualizado);
    }

    public Usuario modificarTipoDeUsuario(Long id, TipoDeUsuario tipo){
        Usuario usuarioMoficiado = usuarioRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("El usuario no existe."));
    
        usuarioMoficiado.setTipoDeUsuario(tipo);

        return usuarioRepository.save(usuarioMoficiado);
        
    }

    public Usuario desactivarCuenta(Long id){
        Usuario bajaUsuario = usuarioRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("El usuario no existe."));

        if(!bajaUsuario.isActivo()){
            throw new RuntimeException("El usuario ya esta dado de baja.");
        }
        bajaUsuario.setActivo(false);
        return usuarioRepository.save(bajaUsuario);
    }



    //Metodo para eliminar un usuario del sistema.
    @Transactional
    public void eliminarUsuarioYReservas(Long usuarioId) {
    // 1. Eliminamos primero las reservas pertenecientes al usuario
    reservaRepository.deleteByUsuarioId(usuarioId);

    // 2. Eliminamos al usuario
    usuarioRepository.deleteById(usuarioId);
}

}
