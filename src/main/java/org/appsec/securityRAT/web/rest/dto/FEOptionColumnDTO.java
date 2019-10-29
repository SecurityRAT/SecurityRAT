package org.appsec.securityRAT.web.rest.dto;

import org.appsec.securityRAT.domain.OptColumn;

public class FEOptionColumnDTO {
	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	private String type;

	private boolean isVisibleByDefault;

	public FEOptionColumnDTO() {
	}

	public FEOptionColumnDTO(OptColumn optionColumn) {
		this.id = optionColumn.getId();
		this.name = optionColumn.getName();
		this.description = optionColumn.getDescription();
		this.showOrder = optionColumn.getShowOrder();
		this.type = optionColumn.getOptColumnType().getName();
		this.isVisibleByDefault = optionColumn.getIsVisibleByDefault();
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

	public String getType() {
		return type;
	}

	public boolean getIsVisibleByDefault() {
		return isVisibleByDefault;
	}


}
