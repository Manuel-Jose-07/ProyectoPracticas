package com.daw.controladores;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControladoresPartido {

	private String TraduceError(String exceptionString) {
		return "No se traducir todavía";
	}

	private String filtroContieneTexto(String texto) {
		// devuelve: "'%%" ó "'%texto%'"
		return (texto == null) ? "'%%'" : "'%" + texto.replace("'", "''") + "%'";
	}

	@GetMapping("/busquedaPartidos")
	public ResponseEntity<?> busquedaPartidos(@RequestParam(required = false) String rival,
			@RequestParam(required = false) Integer EQUIPO_id_equipo) {
		List<Partido> resultado = new ArrayList<>();
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");
			Statement stmt = conn.createStatement();
			String sentencia = "SELECT id_partido, EQUIPO_id_equipo, fecha, hora, rival, lugar, resultado, goles_a_favor, goles_en_contra, local "
					+ " FROM PARTIDO "
					+ " WHERE (" + (rival == null ? "TRUE" : "FALSE") + " OR UPPER(rival) LIKE UPPER(" + filtroContieneTexto(rival) + ")) "
					+ " AND (" + (EQUIPO_id_equipo == null ? "TRUE" : "FALSE") + " OR EQUIPO_id_equipo = " + EQUIPO_id_equipo + ") ";
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				Integer idBD = rs.getInt("id_partido");
				Integer equipoIdBD = rs.getInt("EQUIPO_id_equipo");
				LocalDate fechaBD = rs.getDate("fecha").toLocalDate();
				LocalTime horaBD = rs.getTime("hora").toLocalTime();
				String rivalBD = rs.getString("rival");
				String lugarBD = rs.getString("lugar");
				String resultadoString = rs.getString("resultado");
				enumResultado resultadoBD = enumResultado.valueOf(resultadoString);
				Integer golesAFavorBD = rs.getInt("goles_a_favor");
				Integer golesEnContraBD = rs.getInt("goles_en_contra");
				String localBD = rs.getString("local");
				resultado.add(new Partido(idBD, equipoIdBD, fechaBD, horaBD, rivalBD, lugarBD, resultadoBD, golesAFavorBD, golesEnContraBD, localBD));
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

	@GetMapping("/crearPartido")
	public ResponseEntity<?> crearPartido(Integer EQUIPO_id_equipo, LocalDate fecha, LocalTime hora,
			String rival, String lugar, enumResultado resultado, @RequestParam(required = false) Integer goles_a_favor,
			@RequestParam(required = false) Integer goles_en_contra, String local) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"INSERT INTO PARTIDO (EQUIPO_id_equipo, fecha, hora, rival, lugar, resultado, goles_a_favor, goles_en_contra, local) VALUES (?,?,?,?,?,?,?,?,?)");
			pstmt.setInt(1, EQUIPO_id_equipo);
			pstmt.setDate(2, java.sql.Date.valueOf(fecha));
			pstmt.setTime(3, java.sql.Time.valueOf(hora));
			pstmt.setString(4, rival);
			pstmt.setString(5, lugar);
			pstmt.setString(6, resultado.toString());
			pstmt.setObject(7, goles_a_favor);
			pstmt.setObject(8, goles_en_contra);
			pstmt.setString(9, local);
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

	@GetMapping("/modificarPartido")
	public ResponseEntity<?> modificarPartido(Integer id_partido, Integer EQUIPO_id_equipo, LocalDate fecha, LocalTime hora,
			String rival, String lugar, enumResultado resultado, @RequestParam(required = false) Integer goles_a_favor,
			@RequestParam(required = false) Integer goles_en_contra, String local) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"UPDATE PARTIDO SET EQUIPO_id_EQUIPO=?, fecha=?, hora=?, rival=?, lugar=?, resultado=?, goles_a_favor=?, goles_en_contra=?, local=? WHERE id_partido=?");
			pstmt.setInt(1, EQUIPO_id_equipo);
			pstmt.setDate(2, java.sql.Date.valueOf(fecha));
			pstmt.setTime(3, java.sql.Time.valueOf(hora));
			pstmt.setString(4, rival);
			pstmt.setString(5, lugar);
			pstmt.setString(6, resultado.toString());
			pstmt.setObject(7, goles_a_favor);
			pstmt.setObject(8, goles_en_contra);
			pstmt.setString(9, local);
			pstmt.setInt(10, id_partido);
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

	@GetMapping("/eliminarPartido")
	public ResponseEntity<?> eliminarPartido(Integer id_partido) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt1 = conn.prepareStatement("DELETE FROM JUGADOR_PARTIDO WHERE PARTIDO_id_partido=?");
			pstmt1.setInt(1, id_partido);
			pstmt1.executeUpdate();
			pstmt1.close();
			
			PreparedStatement pstmt2 = conn.prepareStatement("DELETE FROM PARTIDO WHERE id_partido=?");
			pstmt2.setInt(1, id_partido);
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
