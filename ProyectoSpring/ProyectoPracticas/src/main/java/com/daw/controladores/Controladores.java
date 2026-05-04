package com.daw.controladores;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controladores {

	@GetMapping("/busquedaLibros")
	public ResponseEntity<?> buscarLibros(String titulo, String autor) {
		List<Libro> resultado = new ArrayList<>();
		try {

			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/ejemplo-jdbc", "usuario",
					"usuario");
			Statement stmt = conn.createStatement();
			ResultSet rs = stmt.executeQuery(
					"SELECT l.id, l.titulo, l.precio, a.nombre FROM libro l JOIN autor a ON l.autor = a.id "
							+ " WHERE (" + (titulo==null? "TRUE":"FALSE") + " OR UPPER(l.titulo) LIKE UPPER('%" + titulo + "%')) "
							+ " AND (" + (autor==null? "TRUE":"FALSE") + " OR UPPER(a.nombre) LIKE UPPER('%" + autor + "%')) ");

			while (rs.next()) {
				Integer id = rs.getInt("l.id");
				String name = rs.getString("l.titulo");
				float price = rs.getFloat("l.precio");
				String nombreAutor = rs.getString("a.nombre");
				resultado.add(new Libro(id, name, price, nombreAutor));
			}

			rs.close();
			stmt.close();
			conn.close();

		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}

		return ResponseEntity.ok().body(resultado);
	}

	@GetMapping("/insertarLibro")
	public ResponseEntity<?> insertarLibro(String titulo, Float precio, String autor) {

		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/ejemplo-jdbc", "usuario",
					"usuario");
			Statement stmt = conn.createStatement();
			ResultSet rs = stmt.executeQuery("SELECT a.id FROM autor a WHERE a.nombre = '" + autor + "'");
			Integer idAutor = null;
			while (rs.next()) {
				idAutor = rs.getInt("a.id");
			}

			if (idAutor == null) {
				PreparedStatement pstmt = conn.prepareStatement("INSERT INTO autor (nombre) VALUES (?)");
				pstmt.setString(1, autor);
				pstmt.executeUpdate();
				rs = stmt.executeQuery("SELECT a.id FROM autor a WHERE a.nombre = '" + autor + "'");
				while (rs.next()) {
					idAutor = rs.getInt("a.id");
				}
				pstmt.close();
			}

			PreparedStatement pstmt = conn.prepareStatement("INSERT INTO libro (titulo, precio, autor) VALUES (?,?,?)");
			pstmt.setString(1, titulo);
			pstmt.setFloat(2, precio);
			pstmt.setInt(3, idAutor);
			pstmt.executeUpdate();

			rs.close();
			pstmt.close();
			stmt.close();
			conn.close();

		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return ResponseEntity.ok().body("La creación se ha ejecutado con éxito");
	}

	@GetMapping("/modificarLibro")
	public ResponseEntity<?> modificarLibro(Integer id, String titulo) {
		try {

			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/ejemplo-jdbc", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement("UPDATE libro SET titulo=? WHERE id=?");
			pstmt.setString(1, titulo);
			pstmt.setInt(2, id);
			pstmt.executeUpdate();

			pstmt.close();
			conn.close();

		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return ResponseEntity.ok().body("La modificación se ha ejecutado con éxito");

	}

	@GetMapping("/eliminarLibro")
	public ResponseEntity<?> eliminarLibro(Integer id) {
		try {

			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/ejemplo-jdbc", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement("DELETE FROM libro WHERE id=?");
			pstmt.setInt(1, id);
			pstmt.executeUpdate();

			pstmt.close();
			conn.close();

		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return ResponseEntity.ok().body("La eliminación se ha ejecutado con éxito");
	}

}
