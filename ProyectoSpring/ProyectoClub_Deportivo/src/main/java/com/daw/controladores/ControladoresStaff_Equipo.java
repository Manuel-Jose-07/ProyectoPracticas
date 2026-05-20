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
public class ControladoresStaff_Equipo {

	private String TraduceError(String exceptionString) {
		return "No se traducir todavía";
	}


	@GetMapping("/crearStaffEquipo")
	public ResponseEntity<?> crearStaffEquipo(Integer STAFF_id_staff, Integer EQUIPO_id_equipo) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"INSERT INTO STAFF_EQUIPO (STAFF_id_staff, EQUIPO_id_equipo) VALUES (?,?)");
			pstmt.setInt(1, STAFF_id_staff);
			pstmt.setInt(2, EQUIPO_id_equipo);
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

	@GetMapping("/eliminarStaffEquipo")
	public ResponseEntity<?> eliminarStaffEquipo(Integer STAFF_id_staff, Integer EQUIPO_id_equipo) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"DELETE FROM STAFF_EQUIPO WHERE STAFF_id_staff=? AND EQUIPO_id_equipo=?");
			pstmt.setInt(1, STAFF_id_staff);
			pstmt.setInt(2, EQUIPO_id_equipo);
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

	@GetMapping("/busquedaStaffEquipo")
	public ResponseEntity<?> busquedaStaffEquipo(@RequestParam(required = false) Integer STAFF_id_staff,
			@RequestParam(required = false) Integer EQUIPO_id_equipo) {
		
		List<StaffEquipo> resultado = new ArrayList<>();
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario", "usuario");
			Statement stmt = conn.createStatement();
			
			String sentencia = "SELECT STAFF_id_staff, EQUIPO_id_equipo FROM STAFF_EQUIPO "
					+ " WHERE (" + (STAFF_id_staff == null ? "TRUE" : "FALSE") + " OR STAFF_id_staff = " + STAFF_id_staff + ") "
					+ "   AND (" + (EQUIPO_id_equipo == null ? "TRUE" : "FALSE") + " OR EQUIPO_id_equipo = " + EQUIPO_id_equipo + ") ";
			
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				resultado.add(new StaffEquipo(rs.getInt("STAFF_id_staff"), rs.getInt("EQUIPO_id_equipo")));
			}
			rs.close(); stmt.close(); conn.close();
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("Error general");
		}
		return ResponseEntity.ok().body(resultado);
	}
}
