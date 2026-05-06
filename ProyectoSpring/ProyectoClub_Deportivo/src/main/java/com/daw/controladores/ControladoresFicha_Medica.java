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
public class ControladoresFicha_Medica {

	private String TraduceError(String exceptionString) {
		return "No se traducir todavía";
	}

	private String filtroContieneTexto(String texto) {
		// devuelve: "'%%" ó "'%texto%'"
		return (texto == null) ? "'%%'" : "'%" + texto.replace("'", "''") + "%'";
	}

	@GetMapping("/busquedaFichasMedicas")
	public ResponseEntity<?> busquedaFichasMedicas(@RequestParam(required = false) String codigo,
			@RequestParam(required = false) Integer JUGADOR_id_jugador) {
		List<Ficha_Medica> resultado = new ArrayList<>();
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");
			Statement stmt = conn.createStatement();
			String sentencia = "SELECT id_ficha_medica, JUGADOR_id_jugador, codigo, descripcion, grupo_sanguineo, alergias, apto "
					+ " FROM FICHA_MEDICA "
					+ " WHERE (" + (codigo == null ? "TRUE" : "FALSE") + " OR UPPER(codigo) LIKE UPPER(" + filtroContieneTexto(codigo) + ")) "
					+ " AND (" + (JUGADOR_id_jugador == null ? "TRUE" : "FALSE") + " OR JUGADOR_id_jugador = " + JUGADOR_id_jugador + ") ";
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				Integer idBD = rs.getInt("id_ficha_medica");
				Integer jugadorIdBD = rs.getInt("JUGADOR_id_jugador");
				String codigoBD = rs.getString("codigo");
				String descripcionBD = rs.getString("descripcion");
				String grupoSanguineoBD = rs.getString("grupo_sanguineo");
				String alergiasBD = rs.getString("alergias");
				Boolean aptoBD = rs.getBoolean("apto");
				resultado.add(new Ficha_Medica(idBD, jugadorIdBD, codigoBD, descripcionBD, grupoSanguineoBD, alergiasBD, aptoBD));
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

	@GetMapping("/crearFichaMedica")
	public ResponseEntity<?> crearFichaMedica(Integer JUGADOR_id_jugador, String codigo, @RequestParam(required = false) String descripcion,
			@RequestParam(required = false) String grupo_sanguineo, @RequestParam(required = false) String alergias, Boolean apto) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"INSERT INTO FICHA_MEDICA (JUGADOR_id_jugador, codigo, descripcion, grupo_sanguineo, alergias, apto) VALUES (?,?,?,?,?,?)");
			pstmt.setInt(1, JUGADOR_id_jugador);
			pstmt.setString(2, codigo);
			pstmt.setString(3, descripcion);
			pstmt.setString(4, grupo_sanguineo);
			pstmt.setString(5, alergias);
			pstmt.setBoolean(6, apto);
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

	@GetMapping("/modificarFichaMedica")
	public ResponseEntity<?> modificarFichaMedica(Integer id_ficha_medica, @RequestParam(required = false) String descripcion,
			@RequestParam(required = false) String grupo_sanguineo, @RequestParam(required = false) String alergias, Boolean apto) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"UPDATE FICHA_MEDICA SET descripcion=?, grupo_sanguineo=?, alergias=?, apto=? WHERE id_ficha_medica=?");
			pstmt.setString(1, descripcion);
			pstmt.setString(2, grupo_sanguineo);
			pstmt.setString(3, alergias);
			pstmt.setBoolean(4, apto);
			pstmt.setInt(5, id_ficha_medica);
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

	@GetMapping("/eliminarFichaMedica")
	public ResponseEntity<?> eliminarFichaMedica(Integer id_ficha_medica) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement("DELETE FROM FICHA_MEDICA WHERE id_ficha_medica=?");
			pstmt.setInt(1, id_ficha_medica);
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
