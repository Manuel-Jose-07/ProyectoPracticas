package com.daw.controladores;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControladoresJugador {

	private String TraduceError(String exceptionString) {
		return "No se traducir todavía";
	}

	private String filtroContieneTexto(String texto) {
		// devuelve: "'%%" ó "'%texto%'" 
		return (texto == null) 
				? "'%%'" 
				: "'%" + texto.replace("'", "''") + "%'";
	}

	@GetMapping("/busquedaJugadores")
	public ResponseEntity<?> busquedaJugadores(@RequestParam(required = false) String nombre,
			@RequestParam(required = false) Integer EQUIPO_id_equipo) {
		List<Jugador> resultado = new ArrayList<>();
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");
			Statement stmt = conn.createStatement();
			String sentencia = "SELECT j.id_jugador, j.EQUIPO_id_equipo, j.nombre, j.fecha_nacimiento, j.posicion, j.activo, j.dorsal, j.score "
					+ " FROM JUGADOR j "
					+ " WHERE (" + (nombre == null ? "TRUE" : "FALSE") + " OR UPPER(j.nombre) LIKE UPPER(" + filtroContieneTexto(nombre) + ")) "
					+ "   AND (" + (EQUIPO_id_equipo == null ? "TRUE" : "FALSE") + " OR j.EQUIPO_id_equipo = " + EQUIPO_id_equipo + ") ";
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				Integer idBD = rs.getInt("j.id_jugador");
				String nombreBD = rs.getString("j.nombre");
				Integer equipoIdBD = rs.getInt("j.EQUIPO_id_equipo");
				LocalDate fechaNacimientoBD = rs.getDate("j.fecha_nacimiento").toLocalDate();
				String posicionBD = rs.getString("j.posicion");
				Boolean activoBD = rs.getBoolean("j.activo");
				Integer dorsalBD = rs.getInt("j.dorsal");
				Float scoreBD = rs.getFloat("j.score");
				resultado.add(new Jugador(idBD, equipoIdBD, nombreBD, fechaNacimientoBD, posicionBD, activoBD, dorsalBD, scoreBD));
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

	@GetMapping("/crearJugador")
	public ResponseEntity<?> crearJugador(Integer EQUIPO_id_equipo, String nombre, LocalDate fecha_nacimiento, String posicion,
			Boolean activo, Integer dorsal, Float score) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"INSERT INTO JUGADOR (EQUIPO_id_equipo, nombre, fecha_nacimiento, posicion, activo, dorsal, score) VALUES (?,?,?,?,?,?,?)");
			pstmt.setInt(1, EQUIPO_id_equipo);
			pstmt.setString(2, nombre);
			pstmt.setDate(3, java.sql.Date.valueOf(fecha_nacimiento));
			pstmt.setString(4, posicion);
			pstmt.setBoolean(5, activo);
			pstmt.setInt(6, dorsal);
			pstmt.setFloat(7, score);
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

	@GetMapping("/modificarJugador")
	public ResponseEntity<?> modificarJugador(Integer id_jugador, Integer EQUIPO_id_equipo, String nombre, LocalDate fecha_nacimiento,
			String posicion, Boolean activo, Integer dorsal, Float score) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"UPDATE JUGADOR SET EQUIPO_id_equipo=?, nombre=?, fecha_nacimiento=?, posicion=?, activo=?, dorsal=?, score=? WHERE id_jugador=?");
			pstmt.setInt(1, EQUIPO_id_equipo);
			pstmt.setString(2, nombre);
			pstmt.setDate(3, java.sql.Date.valueOf(fecha_nacimiento));
			pstmt.setString(4, posicion);
			pstmt.setBoolean(5, activo);
			pstmt.setInt(6, dorsal);
			pstmt.setFloat(7, score);
			pstmt.setInt(8, id_jugador);
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

	@GetMapping("/eliminarJugador")
	public ResponseEntity<?> eliminarJugador(Integer id_jugador) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement("DELETE FROM JUGADOR WHERE id_jugador=?");
			pstmt.setInt(1, id_jugador);
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
