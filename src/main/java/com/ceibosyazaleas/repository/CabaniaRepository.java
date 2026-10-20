package com.ceibosyazaleas.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ceibosyazaleas.model.Cabania;

@Repository 
public interface CabaniaRepository extends JpaRepository <Cabania, Long> {

    List<Cabania> findAllByActivaTrue();

}
