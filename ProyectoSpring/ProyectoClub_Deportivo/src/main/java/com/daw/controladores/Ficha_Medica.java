package com.daw.controladores;

public class Ficha_Medica {

	private Integer id_ficha;
	private Integer JUGADOR_id_jugador;
	private String codigo;
	private String descripcion;
	private String grupo_sanguineo;
	private String alergias;
	private Boolean apto;

	public Ficha_Medica(Integer id_ficha, Integer JUGADOR_id_jugador, String codigo, String descripcion, String grupo_sanguineo, String alergias,
			Boolean apto) {
		this.id_ficha = id_ficha;
		this.codigo = codigo;
		this.descripcion = descripcion;
		this.grupo_sanguineo = grupo_sanguineo;
		this.alergias = alergias;
		this.apto = apto;
		this.JUGADOR_id_jugador = JUGADOR_id_jugador;
	}

	public Integer getId_ficha() {
		return id_ficha;
	}

	public void setId_ficha(Integer id_ficha) {
		this.id_ficha = id_ficha;
	}
	public Integer getJUGADOR_id_jugador() {
		return JUGADOR_id_jugador;
	}

	public void setJUGADOR_id_jugador(Integer JUGADOR_id_jugador) {
		this.JUGADOR_id_jugador = JUGADOR_id_jugador;
	}
	public String getCodigo() {
		return codigo;
	}

	public void setCodigo(String codigo) {
		this.codigo = codigo;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public String getGrupo_sanguineo() {
		return grupo_sanguineo;
	}

	public void setGrupo_sanguineo(String grupo_sanguineo) {
		this.grupo_sanguineo = grupo_sanguineo;
	}

	public String getAlergias() {
		return alergias;
	}

	public void setAlergias(String alergias) {
		this.alergias = alergias;
	}

	public Boolean getApto() {
		return apto;
	}

	public void setApto(Boolean apto) {
		this.apto = apto;
	}

	

}
