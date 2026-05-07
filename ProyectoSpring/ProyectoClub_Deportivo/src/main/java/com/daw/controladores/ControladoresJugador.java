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
			String sentencia = "SELECT id_jugador, EQUIPO_id_equipo, nombre, fecha_nacimiento, posicion, activo, dorsal, score "
					+ " FROM JUGADOR "
					+ " WHERE (" + (nombre == null ? "TRUE" : "FALSE") + " OR UPPER(nombre) LIKE UPPER(" + filtroContieneTexto(nombre) + ")) "
					+ "   AND (" + (EQUIPO_id_equipo == null ? "TRUE" : "FALSE") + " OR EQUIPO_id_equipo = " + EQUIPO_id_equipo + ") ";
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				Integer idBD = rs.getInt("id_jugador");
				String nombreBD = rs.getString("nombre");
				Integer equipoIdBD = rs.getInt("EQUIPO_id_equipo");
				LocalDate fechaNacimientoBD = rs.getDate("fecha_nacimiento").toLocalDate();
				String posicionBD = rs.getString("posicion");
				Boolean activoBD = rs.getBoolean("activo");
				Integer dorsalBD = rs.getInt("dorsal");
				Float scoreBD = rs.getFloat("score");
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
	public ResponseEntity<?> crearJugador(Integer EQUIPO_id_equipo, String nombre, LocalDate fecha_nacimiento, @RequestParam(required = false) String posicion,
			Boolean activo, @RequestParam(required = false) Integer dorsal, @RequestParam(required = false) Float score) {
		
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
			pstmt.setObject(6, dorsal); 
			pstmt.setObject(7, score);
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
			@RequestParam(required = false) String posicion, Boolean activo, @RequestParam(required = false) Integer dorsal, @RequestParam(required = false) Float score) {
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
			pstmt.setObject(6, dorsal);
			pstmt.setObject(7, score);
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

			PreparedStatement pstmt1 = conn.prepareStatement("DELETE FROM JUGADOR_PARTIDO WHERE JUGADOR_id_jugador=?");
			pstmt1.setInt(1, id_jugador);
			pstmt1.executeUpdate();
			pstmt1.close();
			
			PreparedStatement pstmt2 = conn.prepareStatement("DELETE FROM FICHA_MEDICA WHERE JUGADOR_id_jugador=?");
			pstmt2.setInt(1, id_jugador);
			pstmt2.executeUpdate();
			pstmt2.close();
			
			PreparedStatement pstmt3 = conn.prepareStatement("DELETE FROM JUGADOR WHERE id_jugador=?");
			pstmt3.setInt(1, id_jugador);
			pstmt3.executeUpdate();
			pstmt3.close();
			
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
