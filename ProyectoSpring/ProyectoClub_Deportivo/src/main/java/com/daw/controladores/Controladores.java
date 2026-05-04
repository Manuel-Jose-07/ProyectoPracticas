package com.daw.controladores;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controladores {

	@GetMapping("/crearUsuario")
	public ResponseEntity<?> crearUsuario(String nombre, String password, Boolean esAdmin) {

		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn
					.prepareStatement("INSERT INTO usuarios (nombre, password, esAdmin) VALUES (?,?,?)");
			pstmt.setString(1, nombre);
			pstmt.setString(2, password);
			pstmt.setBoolean(3, esAdmin);
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

		return ResponseEntity.ok().body("La creación se ha ejecutado con éxito");
	}

	@GetMapping("/eliminarUsuario")
	public ResponseEntity<?> eliminarUsuario(String nombre, String password) {
		try {

			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement("DELETE FROM usuarios WHERE nombre=? AND password=?");
			pstmt.setString(1, nombre);
			pstmt.setString(2, password);
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

	@GetMapping("/modificarUsuario")
	public ResponseEntity<?> modificarUsuario(String nombre, String password) {
		try {

			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement("UPDATE usuarios SET password=? WHERE nombre=?");
			pstmt.setString(1, password);
			pstmt.setString(2, nombre);
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

}
