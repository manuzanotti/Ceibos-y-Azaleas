package com.ceibosyazaleas.model;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity 
@Table(name="usuarios")
public class Usuario {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank (message = "El Nombre no puede estar vacio.")
    @Column (nullable = false)
    private String nombre;
    
    @NotBlank (message = "El Apellido no puede estar vacio.")
    @Column (nullable = false)
    private String apellido;
    
    @NotBlank (message = "El DNI no puede estar vacio.")
    @Column (unique = true,  nullable = false)
    private String dni;
    
    @NotBlank (message = "El Email no puede estar vacio.")
    @Column (unique = true, nullable = false)
    @Email (message = "Debe ingresar un email valido.")
    private String email;
    
    @NotBlank (message = "Debe ingresar una contraseña.")
    @Column (nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column (nullable = false)
    private TipoDeUsuario tipoDeUsuario;


    public Usuario(){
        this.tipoDeUsuario = TipoDeUsuario.CLIENTE;
    }


    
    public Usuario(String nombre, String apellido, String dni, String email, String password){
        this();
        
        this.setNombre(nombre);
        this.setApellido(apellido);
        this.setDni(dni);
        this.setEmail(email);
        this.setPassword(password);
      
    
    }



    public long getId() {
        return id;
    }



    public String getNombre() {
        return nombre;
    }



    public String getApellido() {
        return apellido;
    }



    public String getDni() {
        return dni;
    }



    public String getEmail() {
        return email;
    }



    public String getPassword() {
        return password;
    }



    public TipoDeUsuario getTipoDeUsuario() {
        return tipoDeUsuario;
    }



    public void setId(long id) {
        this.id = id;
    }



    public void setNombre(String nombre) {
        this.nombre = nombre;
    }



    public void setApellido(String apellido) {
        this.apellido = apellido;
    }



    public void setDni(String dni) {
        this.dni = dni;
    }



    public void setEmail(String email) {
        this.email = email;
    }



    public void setPassword(String password) {
        this.password = password;
    }



    public void setTipoDeUsuario(TipoDeUsuario tipoDeUsuario) {
        this.tipoDeUsuario = tipoDeUsuario;
    }




    
}
