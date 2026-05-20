package com.daw.controladores;

public class StaffEquipo {

	private Integer STAFF_id_staff;
	private Integer EQUIPO_id_equipo;

	public StaffEquipo(Integer STAFF_id_staff, Integer EQUIPO_id_equipo) {
		this.STAFF_id_staff = STAFF_id_staff;
		this.EQUIPO_id_equipo = EQUIPO_id_equipo;
	}

	public Integer getSTAFF_id_staff() {
		return STAFF_id_staff;
	}

	public void setSTAFF_id_staff(Integer sTAFF_id_staff) {
		STAFF_id_staff = sTAFF_id_staff;
	}

	public Integer getEQUIPO_id_equipo() {
		return EQUIPO_id_equipo;
	}

	public void setEQUIPO_id_equipo(Integer eQUIPO_id_equipo) {
		EQUIPO_id_equipo = eQUIPO_id_equipo;
	}

}