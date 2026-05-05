package com.daw.controladores;

import java.time.LocalDate;

public class Jugador {

	private Integer id_jugador;
	private String nombre;
	private LocalDate fecha_nacimiento;
	private enumPosicion posicion;
	private Boolean activo;
	private Integer dorsal;
	private Float score;
	private Integer id_equipo;

	public Jugador(Integer id_jugador, String nombre, LocalDate fecha_nacimiento, enumPosicion posicion, Boolean activo,
			Integer dorsal, Float score, Integer id_equipo) {
		this.id_jugador = id_jugador;
		this.nombre = nombre;
		this.fecha_nacimiento = fecha_nacimiento;
		this.posicion = posicion;
		this.activo = activo;
		this.dorsal = dorsal;
		this.score = score;
		this.id_equipo = id_equipo;
	}

	public Integer getId_jugador() {
		return id_jugador;
	}

	public void setId_jugador(Integer id_jugador) {
		this.id_jugador = id_jugador;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public LocalDate getFecha_nacimiento() {
		return fecha_nacimiento;
	}

	public void setFecha_nacimiento(LocalDate fecha_nacimiento) {
		this.fecha_nacimiento = fecha_nacimiento;
	}

	public enumPosicion getPosicion() {
		return posicion;
	}

	public void setPosicion(enumPosicion posicion) {
		this.posicion = posicion;
	}

	public Boolean getActivo() {
		return activo;
	}

	public void setActivo(Boolean activo) {
		this.activo = activo;
	}

	public Integer getDorsal() {
		return dorsal;
	}

	public void setDorsal(Integer dorsal) {
		this.dorsal = dorsal;
	}

	public Float getScore() {
		return score;
	}

	public void setScore(Float score) {
		this.score = score;
	}

	public Integer getId_equipo() {
		return id_equipo;
	}

	public void setId_equipo(Integer id_equipo) {
		this.id_equipo = id_equipo;
	}

}