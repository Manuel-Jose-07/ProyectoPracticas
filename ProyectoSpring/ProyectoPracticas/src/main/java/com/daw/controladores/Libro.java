package com.daw.controladores;

public class Libro {

	private Integer id;
	private String titulo;
	private Float precio;
	private String autor;
	
	public Libro(Integer id, String titulo, Float precio, String autor) {
		this.id = id;
		this.titulo = titulo;
		this.precio = precio;
		this.autor = autor;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public Float getPrecio() {
		return precio;
	}

	public void setPrecio(Float precio) {
		this.precio = precio;
	}

	public String getAutor() {
		return autor;
	}

	public void setAutor(String autor) {
		this.autor = autor;
	}
	
}
