package org.appsec.securityRAT.web.rest.dto;

public class ExtraInfoDTO {
	
	private String type;
	
	private Boolean registration;
	
	private String casLogout;
	
	public ExtraInfoDTO () {
	}
	
	
	public ExtraInfoDTO(String type, Boolean registration, String casLogout) {
		this.type = type;
		this.registration = registration;
		this.casLogout = casLogout;
	}


	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Boolean getRegistration() {
		return registration;
	}

	public void setRegistration(Boolean registration) {
		this.registration = registration;
	}

	public String getCasLogout() {
		return casLogout;
	}

	public void setCasLogout(String casLogout) {
		this.casLogout = casLogout;
	}
	
	
	
	
	
}
