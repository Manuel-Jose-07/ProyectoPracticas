package com.daw.controladores;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControladoresJugador_Partido {

	private String TraduceError(String exceptionString) {
		return "No se traducir todavía";
	}

	@GetMapping("/crearJugadorPartido")
	public ResponseEntity<?> crearJugadorPartido(Integer JUGADOR_id_jugador, Integer PARTIDO_id_partido) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"INSERT INTO JUGADOR_PARTIDO (JUGADOR_id_jugador, PARTIDO_id_partido) VALUES (?,?)");
			pstmt.setInt(1, JUGADOR_id_jugador);
			pstmt.setInt(2, PARTIDO_id_partido);
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

	@GetMapping("/eliminarJugadorPartido")
	public ResponseEntity<?> eliminarJugadorPartido(Integer JUGADOR_id_jugador, Integer PARTIDO_id_partido) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"DELETE FROM JUGADOR_PARTIDO WHERE JUGADOR_id_jugador=? AND PARTIDO_id_partido=?");
			pstmt.setInt(1, JUGADOR_id_jugador);
			pstmt.setInt(2, PARTIDO_id_partido);
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

}
