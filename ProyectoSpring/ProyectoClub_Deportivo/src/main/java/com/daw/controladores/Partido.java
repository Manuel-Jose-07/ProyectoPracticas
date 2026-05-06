package com.daw.controladores;

import java.time.LocalDate;
import java.time.LocalTime;

public class Partido {

	private Integer id_partido;
	private Integer EQUIPO_id_equipo;
	private LocalDate fecha;
	private LocalTime hora;
	private String rival;
	private String lugar;
	private enumResultado resultado;
	private Integer goles_a_favor;
	private Integer goles_en_contra;

	public Partido(Integer id_partido, Integer eQUIPO_id_equipo, LocalDate fecha, LocalTime hora, String rival,
			String lugar, enumResultado resultado, Integer goles_a_favor, Integer goles_en_contra) {
		this.id_partido = id_partido;
		EQUIPO_id_equipo = eQUIPO_id_equipo;
		this.fecha = fecha;
		this.hora = hora;
		this.rival = rival;
		this.lugar = lugar;
		this.resultado = resultado;
		this.goles_a_favor = goles_a_favor;
		this.goles_en_contra = goles_en_contra;
	}

	public Integer getId_partido() {
		return id_partido;
	}

	public void setId_partido(Integer id_partido) {
		this.id_partido = id_partido;
	}

	public Integer getEQUIPO_id_equipo() {
		return EQUIPO_id_equipo;
	}

	public void setEQUIPO_id_equipo(Integer eQUIPO_id_equipo) {
		EQUIPO_id_equipo = eQUIPO_id_equipo;
	}

	public LocalDate getFecha() {
		return fecha;
	}

	public void setFecha(LocalDate fecha) {
		this.fecha = fecha;
	}

	public LocalTime getHora() {
		return hora;
	}

	public void setHora(LocalTime hora) {
		this.hora = hora;
	}

	public String getRival() {
		return rival;
	}

	public void setRival(String rival) {
		this.rival = rival;
	}

	public String getLugar() {
		return lugar;
	}

	public void setLugar(String lugar) {
		this.lugar = lugar;
	}

	public enumResultado getResultado() {
		return resultado;
	}

	public void setResultado(enumResultado resultado) {
		this.resultado = resultado;
	}

	public Integer getGoles_a_favor() {
		return goles_a_favor;
	}

	public void setGoles_a_favor(Integer goles_a_favor) {
		this.goles_a_favor = goles_a_favor;
	}

	public Integer getGoles_en_contra() {
		return goles_en_contra;
	}

	public void setGoles_en_contra(Integer goles_en_contra) {
		this.goles_en_contra = goles_en_contra;
	}

}