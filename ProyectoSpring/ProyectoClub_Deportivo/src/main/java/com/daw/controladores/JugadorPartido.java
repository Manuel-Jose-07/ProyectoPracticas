package com.daw.controladores;

public class JugadorPartido {

	private Integer JUGADOR_id_jugador;
	private Integer PARTIDO_id_partido;

	public JugadorPartido(Integer JUGADOR_id_jugador, Integer PARTIDO_id_partido) {
		this.JUGADOR_id_jugador = JUGADOR_id_jugador;
		this.PARTIDO_id_partido = PARTIDO_id_partido;
	}

	public Integer getJUGADOR_id_jugador() {
		return JUGADOR_id_jugador;
	}

	public void setJUGADOR_id_jugador(Integer jUGADOR_id_jugador) {
		JUGADOR_id_jugador = jUGADOR_id_jugador;
	}

	public Integer getPARTIDO_id_partido() {
		return PARTIDO_id_partido;
	}

	public void setPARTIDO_id_partido(Integer pARTIDO_id_partido) {
		PARTIDO_id_partido = pARTIDO_id_partido;
	}

}