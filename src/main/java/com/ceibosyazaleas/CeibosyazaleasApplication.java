package com.ceibosyazaleas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; 

@SpringBootApplication
@EnableScheduling // <--- Activa el motor de tareas en segundo plano
public class CeibosyazaleasApplication {

	public static void main(String[] args) {
		SpringApplication.run(CeibosyazaleasApplication.class, args);
	}

}
