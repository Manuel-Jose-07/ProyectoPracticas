package com.daw.controladores;

public class Equipo {

	private Integer id_equipo;
	private String codigo;
	private String descripcion;
	private enumCategoria categoria;
	private String letra;

	public Equipo(Integer id_equipo, String codigo, String descripcion, enumCategoria categoria, String letra) {
		this.id_equipo = id_equipo;
		this.codigo = codigo;
		this.descripcion = descripcion;
		this.categoria = categoria;
		this.letra = letra;
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

	public enumCategoria getCategoria() {
		return categoria;
	}

	public void setCategoria(enumCategoria categoria) {
		this.categoria = categoria;
	}

	public String getLetra() {
		return letra;
	}

	public void setLetra(String letra) {
		this.letra = letra;
	}

}
