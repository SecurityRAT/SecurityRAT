package org.appsec.securityRAT.web.rest.dto;

import org.appsec.securityRAT.domain.AlternativeSet;

public class FEAlternativeSetDTO {

	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	public FEAlternativeSetDTO() {
	}

	public FEAlternativeSetDTO(AlternativeSet alternativeSet) {
		this.id = alternativeSet.getId();
		this.name = alternativeSet.getName();
		this.description = alternativeSet.getDescription();
		this.showOrder = alternativeSet.getShowOrder();
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
