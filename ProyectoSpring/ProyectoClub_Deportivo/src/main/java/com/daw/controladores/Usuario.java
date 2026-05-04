package com.daw.controladores;

public class Usuario {

	private Integer id_usuario;
	private String nombre;
	private String password;
	private Boolean esAdmin;

	public Usuario(Integer id_usuario, String nombre, String password, Boolean esAdmin) {
		this.id_usuario = id_usuario;
		this.nombre = nombre;
		this.password = password;
		this.esAdmin = esAdmin;
	}

	public Integer getId_usuario() {
		return id_usuario;
	}

	public void setId_usuario(Integer id_usuario) {
		this.id_usuario = id_usuario;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Boolean getEsAdmin() {
		return esAdmin;
	}

	public void setEsAdmin(Boolean esAdmin) {
		this.esAdmin = esAdmin;
	}

}
