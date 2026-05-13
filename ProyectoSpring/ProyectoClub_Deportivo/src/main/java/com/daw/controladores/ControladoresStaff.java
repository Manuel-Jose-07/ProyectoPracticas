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
public class ControladoresStaff {

	private String TraduceError(String exceptionString) {
		return "No se traducir todavía";
	}

	private String filtroContieneTexto(String texto) {
		// devuelve: "'%%" ó "'%texto%'"
		return (texto == null) ? "'%%'" : "'%" + texto.replace("'", "''") + "%'";
	}

	@GetMapping("/busquedaStaff")
	public ResponseEntity<?> busquedaStaff(@RequestParam(required = false) String nombre,
			@RequestParam(required = false) String cargo) {
		
		// Comproboar si es un usuario que ha pasado por login (AUTENTICAR)
		// Comprobar si ese usuario tiene permiso para busquedaStaff (AUTORIZAR)
		
		List<Staff> resultado = new ArrayList<>();
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");
			Statement stmt = conn.createStatement();
			String sentencia = "SELECT id_staff, nombre, cargo, activo "
					+ " FROM STAFF "
					+ " WHERE (" + (nombre == null ? "TRUE" : "FALSE") + " OR UPPER(nombre) LIKE UPPER(" + filtroContieneTexto(nombre) + ")) "
					+ " AND (" + (cargo == null ? "TRUE" : "FALSE") + " OR UPPER(cargo) LIKE UPPER(" + filtroContieneTexto(cargo) + ")) ";
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				Integer idBD = rs.getInt("id_staff");
				String nombreBD = rs.getString("nombre");
				String cargoBD = rs.getString("cargo");
				Boolean activoBD = rs.getBoolean("activo");
				resultado.add(new Staff(idBD, nombreBD, cargoBD, activoBD));
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

	@GetMapping("/crearStaff")
	public ResponseEntity<?> crearStaff(String nombre, String cargo, Boolean activo) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"INSERT INTO STAFF (nombre, cargo, activo) VALUES (?,?,?)");
			pstmt.setString(1, nombre);
			pstmt.setString(2, cargo);
			pstmt.setBoolean(3, activo);
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

	@GetMapping("/modificarStaff")
	public ResponseEntity<?> modificarStaff(Integer id_staff, String nombre, String cargo, Boolean activo) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"UPDATE STAFF SET nombre=?, cargo=?, activo=? WHERE id_staff=?");
			pstmt.setString(1, nombre);
			pstmt.setString(2, cargo);
			pstmt.setBoolean(3, activo);
			pstmt.setInt(4, id_staff);
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

	@GetMapping("/eliminarStaff")
	public ResponseEntity<?> eliminarStaff(Integer id_staff) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt1 = conn.prepareStatement("DELETE FROM STAFF_EQUIPO WHERE STAFF_id_staff=?");
			pstmt1.setInt(1, id_staff);
			pstmt1.executeUpdate();
			pstmt1.close();
			
			PreparedStatement pstmt2 = conn.prepareStatement("DELETE FROM STAFF WHERE id_staff=?");
			pstmt2.setInt(1, id_staff);
			pstmt2.executeUpdate();
			pstmt2.close();
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

}
