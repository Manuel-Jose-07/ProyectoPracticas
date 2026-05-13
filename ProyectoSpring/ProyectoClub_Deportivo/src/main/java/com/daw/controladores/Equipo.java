package com.daw.controladores;

public class Equipo {

	private Integer id_equipo;
	private String codigo;
	private String descripcion;
	private String categoria;
	private String grupo;

	public Equipo(Integer id_equipo, String codigo, String descripcion, String categoria, String grupo) {
		this.id_equipo = id_equipo;
		this.codigo = codigo;
		this.descripcion = descripcion;
		this.categoria = categoria;
		this.grupo = grupo;
	}

	public Integer getId_equipo() {
		return id_equipo;
	}

	public void setId_equipo(Integer id_equipo) {
		this.id_equipo = id_equipo;
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

	public String getCategoria() {
		return categoria;
	}

	public void setCategoria(String categoria) {
		this.categoria = categoria;
	}

	public String getGrupo() {
		return grupo;
	}

	public void setGrupo(String grupo) {
		this.grupo = grupo;
	}

}
