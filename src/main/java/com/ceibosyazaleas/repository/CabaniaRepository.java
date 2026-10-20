package com.ceibosyazaleas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ceibosyazaleas.model.Cabania;

@Repository 
public interface CabaniaRepository extends JpaRepository <Cabania, Long> {

    List<Cabania> findAllByActivaTrue();

    Optional<Cabania> findByName(String nombre);
    
    Optional<Cabania> findByCap(int capacidad);
   
   
}
