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
			String sentencia = "SELECT p.id_partido, p.EQUIPO_id_equipo, p.fecha, p.hora, p.rival, p.lugar, p.resultado, p.goles_a_favor, p.goles_en_contra "
					+ " FROM PARTIDO p "
					+ " WHERE (" + (rival == null ? "TRUE" : "FALSE") + " OR UPPER(p.rival) LIKE UPPER(" + filtroContieneTexto(rival) + ")) "
					+ "   AND (" + (EQUIPO_id_equipo == null ? "TRUE" : "FALSE") + " OR p.EQUIPO_id_equipo = " + EQUIPO_id_equipo + ") ";
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				Integer idBD = rs.getInt("p.id_partido");
				Integer equipoIdBD = rs.getInt("p.EQUIPO_id_equipo");
				LocalDate fechaBD = rs.getDate("p.fecha").toLocalDate();
				LocalTime horaBD = rs.getTime("p.hora").toLocalTime();
				String rivalBD = rs.getString("p.rival");
				String lugarBD = rs.getString("p.lugar");
				String resultadoString = rs.getString("p.resultado");
				enumResultado resultadoBD = enumResultado.valueOf(resultadoString);
				Integer golesAFavorBD = rs.getInt("p.goles_a_favor");
				Integer golesEnContraBD = rs.getInt("p.goles_en_contra");
				resultado.add(new Partido(idBD, equipoIdBD, fechaBD, horaBD, rivalBD, lugarBD, resultadoBD, golesAFavorBD, golesEnContraBD));
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
			String rival, String lugar, enumResultado resultado) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"INSERT INTO PARTIDO (EQUIPO_id_equipo, fecha, hora, rival, lugar, resultado) VALUES (?,?,?,?,?,?)");
			pstmt.setInt(1, EQUIPO_id_equipo);
			pstmt.setDate(2, java.sql.Date.valueOf(fecha));
			pstmt.setTime(3, java.sql.Time.valueOf(hora));
			pstmt.setString(4, rival);
			pstmt.setString(5, lugar);
			pstmt.setString(6, resultado.toString());
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
	public ResponseEntity<?> modificarPartido(Integer id_partido, enumResultado resultado,
			Integer goles_a_favor, Integer goles_en_contra) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"UPDATE PARTIDO SET resultado=?, goles_a_favor=?, goles_en_contra=? WHERE id_partido=?");
			pstmt.setString(1, resultado.toString());
			pstmt.setInt(2, goles_a_favor);
			pstmt.setInt(3, goles_en_contra);
			pstmt.setInt(4, id_partido);
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

			PreparedStatement pstmt = conn.prepareStatement("DELETE FROM PARTIDO WHERE id_partido=?");
			pstmt.setInt(1, id_partido);
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
