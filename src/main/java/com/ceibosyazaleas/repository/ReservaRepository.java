package com.ceibosyazaleas.repository;


import com.ceibosyazaleas.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;


@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Buscar todas las reservas de un usuario específico (para "Mis Reservas")
    List<Reserva> findByUsuarioId(Long usuarioId);
    
// Consulta JPQL limpia que apunta directamente al ID del objeto cabania relacionado
    @Query("SELECT r FROM Reserva r WHERE r.cabania.id = :cabaniaId")
    List<Reserva> findByCabaniaId(@Param("cabaniaId") Long cabaniaId);

    
    
    // Consulta clave para validar si la cabaña ya está ocupada en el rango de fechas solicitado
    // Una cabaña se cruza si: (NuevoCheckIn < CheckOutExistente) AND (NuevoCheckOut > CheckInExistente)
    @Query("SELECT r FROM Reserva r WHERE r.cabania.id = :cabaniaId " +
           "AND r.estado != 'CANCELADA' " +
           "AND r.checkIn < :checkOut AND r.checkOut > :checkIn")
    List<Reserva> encontrarReservasSolapadas(
        @Param("cabaniaId") Long cabaniaId, 
        @Param("checkIn") LocalDate checkIn, 
        @Param("checkOut") LocalDate checkOut
    );

        // ... dentro de la interfaz ReservaRepository:
    @Query("SELECT r FROM Reserva r WHERE r.estado = 'PENDIENTE' AND r.fechaCreacion < :limite")
    List<Reserva> findPendientesExpiradas(@Param("limite") LocalDateTime limite);



    //Creamos este metodo para poder borrar los usuarios vinculados a la reserva
    void deleteByUsuarioId(Long usuarioId);



   




}