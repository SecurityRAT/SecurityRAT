package org.appsec.securityRAT.web.rest.dto;

import org.appsec.securityRAT.domain.StatusColumnValue;

public class FEStatusColumnValueDTO {

	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	public FEStatusColumnValueDTO() {
	}

	public FEStatusColumnValueDTO(StatusColumnValue statusColumnValue) {
		this.id = statusColumnValue.getId();
		this.name = statusColumnValue.getName();
		this.description = statusColumnValue.getDescription();
		this.showOrder = statusColumnValue.getShowOrder();
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getDescription() {
		return description;
	}

	public Integer getShowOrder() {
		return showOrder;
	}
}
