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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControladoresUsuario {

	private String TraduceError(String exceptionString) {

		return "No se traducir todavía";

	}

	private String filtroContieneTexto(String texto) {
		// devuelve: "'%%" ó "'%texto%'" 
		return (texto == null) 
				? "'%%'" 
				: "'%" + texto.replace("'", "''") + "%'";
	}

	@GetMapping("/busquedaUsuarios")
	public ResponseEntity<?> buscarUsuarios(@RequestParam(required = false) String nombre,
			@RequestParam(required = false) Boolean esAdmin) {
		
		// Comproboar si es un usuario que ha pasado por login (AUTENTICAR)
		// Comprobar si ese usuario tiene permiso para busquedaUsuarios (AUTORIZAR)
		
		List<Usuario> resultado = new ArrayList<>();
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");
			Statement stmt = conn.createStatement();
			String sentencia = "SELECT id_usuario, nombre, password, esAdmin " 
					+ " FROM usuario" 
					+ " WHERE (" + (nombre == null ? "TRUE" : "FALSE") + " OR UPPER(nombre) LIKE UPPER(" + filtroContieneTexto(nombre) + ")) " 
					+ " AND (" + (esAdmin == null ? "TRUE" : "FALSE") + " OR esAdmin = " + esAdmin + ") ";
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				Integer idBD = rs.getInt("id_usuario");
				String nombreBD = rs.getString("nombre");
				String passwordBD = rs.getString("password");
				Boolean esAdminBD = rs.getBoolean("esAdmin");
				resultado.add(new Usuario(idBD, nombreBD, passwordBD, esAdminBD));
			}

			rs.close();
			stmt.close();
			conn.close();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("ClassNotFoundException");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body(TraduceError(e.toString()));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("general Exception");

		}
		return ResponseEntity.ok().body(resultado);
	}

	@GetMapping("/crearUsuario")
	public ResponseEntity<?> crearUsuario(String nombre, String password, Boolean esAdmin) {

		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn
					.prepareStatement("INSERT INTO usuario (nombre, password, esAdmin) VALUES (?,?,?)");
			pstmt.setString(1, nombre);
			pstmt.setString(2, password);
			pstmt.setBoolean(3, esAdmin);
			pstmt.executeUpdate();

			pstmt.close();
			conn.close();

		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("ClassNotFoundException");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body(TraduceError(e.toString()));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("general Exception");

		}

		return ResponseEntity.ok().body("La creación se ha ejecutado con éxito");
	}

	@GetMapping("/eliminarUsuario")
	public ResponseEntity<?> eliminarUsuario(String nombre, String password) {
		try {

			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement("DELETE FROM usuario WHERE nombre=? AND password=?");
			pstmt.setString(1, nombre);
			pstmt.setString(2, password);
			pstmt.executeUpdate();

			pstmt.close();
			conn.close();

		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("ClassNotFoundException");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body(TraduceError(e.toString()));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("general Exception");

		}
		return ResponseEntity.ok().body("La eliminación se ha ejecutado con éxito");
	}

	@GetMapping("/modificarUsuario")
	public ResponseEntity<?> modificarUsuario(String nombre, String password) {
		try {

			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement("UPDATE usuario SET password=? WHERE nombre=?");
			pstmt.setString(1, password);
			pstmt.setString(2, nombre);
			pstmt.executeUpdate();

			pstmt.close();
			conn.close();

		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("ClassNotFoundException");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body(TraduceError(e.toString()));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("general Exception");

		}

		return ResponseEntity.ok().body("La modificación se ha ejecutado con éxito");

	}
	
	@GetMapping("/login")
	public ResponseEntity<?> loginUsuario(@RequestParam String nombre, @RequestParam String password) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario", "usuario");
			
			String sentencia = "SELECT esAdmin FROM usuario WHERE nombre = ? AND password = ?";
			PreparedStatement pstmt = conn.prepareStatement(sentencia);
			pstmt.setString(1, nombre);
			pstmt.setString(2, password);
			
			ResultSet rs = pstmt.executeQuery();
			
			if (rs.next()) {
				boolean esAdminBD = rs.getBoolean("esAdmin");
				
				rs.close();
				pstmt.close();
				conn.close();
				
				// Devolvemos texto plano puro según lo que tienes en la Base de Datos
				if (esAdminBD) {
					return ResponseEntity.ok().body("admin");
				} else {
					return ResponseEntity.ok().body("usuario");
				}
			} else {
				rs.close();
				pstmt.close();
				conn.close();
				return ResponseEntity.status(401).body("incorrecto");
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("error");
		}
	}

}
