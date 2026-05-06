package com.daw.controladores;

public class Staff {

	private Integer id_cuerpo_tecnico;
	private String nombre;
	private String cargo;
	private Boolean activo;

	public Staff(Integer id_cuerpo_tecnico, String nombre, String cargo, Boolean activo) {
		this.id_cuerpo_tecnico = id_cuerpo_tecnico;
		this.nombre = nombre;
		this.cargo = cargo;
		this.activo = activo;
	}

	public Integer getId_cuerpo_tecnico() {
		return id_cuerpo_tecnico;
	}

	public void setId_cuerpo_tecnico(Integer id_cuerpo_tecnico) {
		this.id_cuerpo_tecnico = id_cuerpo_tecnico;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getCargo() {
		return cargo;
	}

	public void setCargo(String cargo) {
		this.cargo = cargo;
	}

	public Boolean getActivo() {
		return activo;
	}

	public void setActivo(Boolean activo) {
		this.activo = activo;
	}

}
