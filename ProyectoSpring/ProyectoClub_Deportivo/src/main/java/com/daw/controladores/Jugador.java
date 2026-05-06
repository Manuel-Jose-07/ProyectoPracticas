package com.daw.controladores;

import java.time.LocalDate;

public class Jugador {

	private Integer id_jugador;
	private Integer EQUIPO_id_equipo;
	private String nombre;
	private LocalDate fecha_nacimiento;
	private String posicion;
	private Boolean activo;
	private Integer dorsal;
	private Float score;

	public Jugador(Integer id_jugador, Integer EQUIPO_id_equipo, String nombre, LocalDate fecha_nacimiento,
			String posicion, Boolean activo, Integer dorsal, Float score) {
		this.id_jugador = id_jugador;
		this.EQUIPO_id_equipo = EQUIPO_id_equipo;
		this.nombre = nombre;
		this.fecha_nacimiento = fecha_nacimiento;
		this.posicion = posicion;
		this.activo = activo;
		this.dorsal = dorsal;
		this.score = score;
	}

	public Integer getId_jugador() {
		return id_jugador;
	}

	public void setId_jugador(Integer id_jugador) {
		this.id_jugador = id_jugador;
	}

	public Integer getEQUIPO_id_equipo() {
		return EQUIPO_id_equipo;
	}

	public void setEQUIPO_id_equipo(Integer EQUIPO_id_equipo) {
		this.EQUIPO_id_equipo = EQUIPO_id_equipo;
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

	public String getPosicion() {
		return posicion;
	}

	public void setPosicion(String posicion) {
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

}