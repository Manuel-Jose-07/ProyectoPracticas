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
public class ControladoresEquipo {

	private String TraduceError(String exceptionString) {
		return "No se traducir todavía";
	}

	private String filtroContieneTexto(String texto) {
		// devuelve: "'%%" ó "'%texto%'" 
		return (texto == null) 
				? "'%%'" 
				: "'%" + texto.replace("'", "''") + "%'";
	}
	private String entrecomilla(String texto) {
		// devuelve: NULL ó "'texto'" 
		return (texto == null) ? "NULL" : "'" + texto.replace("'", "''") + "'";
	}

	@GetMapping("/busquedaEquipos")
	public ResponseEntity<?> busquedaEquipos(@RequestParam(required = false) String categoria,
			@RequestParam(required = false) String grupo) {
		
		// Comproboar si es un usuario que ha pasado por login (AUTENTICAR)
		// Comprobar si ese usuario tiene permiso para busquedaEquipos (AUTORIZAR)
		
		List<Equipo> resultado = new ArrayList<>();
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");
			Statement stmt = conn.createStatement();
			String sentencia = "SELECT id_equipo, codigo, descripcion, categoria, grupo "
					+ " FROM EQUIPO "
					+ " WHERE (" + (categoria == null ? "TRUE" : "FALSE") + " OR UPPER(categoria) LIKE UPPER(" + filtroContieneTexto(categoria) + ")) "
					+ "   AND (" + (grupo == null ? "TRUE" : "FALSE") + " OR UPPER(grupo) LIKE UPPER(" + filtroContieneTexto(grupo) + ")) ";
			ResultSet rs = stmt.executeQuery(sentencia);
			while (rs.next()) {
				Integer idBD = rs.getInt("id_equipo");
				String codigoBD = rs.getString("codigo");
				String descripcionBD = rs.getString("descripcion");
				String categoriaBD = rs.getString("categoria");
				String grupoBD = rs.getString("grupo");
				resultado.add(new Equipo(idBD, codigoBD, descripcionBD, categoriaBD, grupoBD));
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

	@GetMapping("/crearEquipo")
	public ResponseEntity<?> crearEquipo(String codigo, @RequestParam(required = false) String descripcion, String categoria, String grupo) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"INSERT INTO EQUIPO (codigo, descripcion, categoria, grupo) VALUES (?,?,?,?)");
			pstmt.setString(1, codigo);
			pstmt.setString(2, descripcion);
			pstmt.setString(3, categoria);
			pstmt.setString(4, grupo);
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

	@GetMapping("/modificarEquipo")
	public ResponseEntity<?> modificarEquipo(Integer id_equipo, String codigo, @RequestParam(required = false) String descripcion,
			String categoria, String grupo) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt = conn.prepareStatement(
					"UPDATE EQUIPO SET codigo=?, descripcion=?, categoria=?, grupo=? WHERE id_equipo=?");
			pstmt.setString(1, codigo);
			pstmt.setString(2, descripcion);
			pstmt.setString(3, categoria);
			pstmt.setString(4, grupo);
			pstmt.setInt(5, id_equipo);
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

	@GetMapping("/eliminarEquipo")
	public ResponseEntity<?> eliminarEquipo(Integer id_equipo) {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/club_deportivo", "usuario",
					"usuario");

			PreparedStatement pstmt1 = conn.prepareStatement("DELETE FROM JUGADOR_PARTIDO WHERE PARTIDO_id_partido IN " 
														+ "(SELECT id_partido FROM PARTIDO WHERE EQUIPO_id_equipo=?)");
			pstmt1.setInt(1, id_equipo);
			pstmt1.executeUpdate();
			pstmt1.close();
			
			PreparedStatement pstmt2 = conn.prepareStatement("DELETE FROM STAFF_EQUIPO WHERE EQUIPO_id_equipo=?");
			pstmt2.setInt(1, id_equipo);
			pstmt2.executeUpdate();
			pstmt2.close();
			
			PreparedStatement pstmt3 = conn.prepareStatement("DELETE FROM PARTIDO WHERE EQUIPO_id_equipo=?");
			pstmt3.setInt(1, id_equipo);
			pstmt3.executeUpdate();
			pstmt3.close();
			
			PreparedStatement pstmt4 = conn.prepareStatement("UPDATE JUGADOR SET EQUIPO_id_equipo = NULL WHERE EQUIPO_id_equipo=?");
			pstmt4.setInt(1, id_equipo);
			pstmt4.executeUpdate();
			pstmt4.close();
			
			PreparedStatement pstmt = conn.prepareStatement("DELETE FROM EQUIPO WHERE id_equipo=?");
			pstmt.setInt(1, id_equipo);
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
