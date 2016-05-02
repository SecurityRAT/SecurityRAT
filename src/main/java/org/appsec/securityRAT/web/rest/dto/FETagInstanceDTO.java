package org.appsec.securityRAT.web.rest.dto;

import org.appsec.securityRAT.domain.TagInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FETagInstanceDTO {

	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	private final Logger log = LoggerFactory.getLogger(FETagInstanceDTO.class);

	public FETagInstanceDTO() {

	}

	public FETagInstanceDTO(TagInstance tagInstance) {
		this.id = tagInstance.getId();
		this.name = tagInstance.getName();
		this.description = tagInstance.getDescription();
		this.showOrder = tagInstance.getShowOrder();
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

