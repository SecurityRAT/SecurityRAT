package org.appsec.securityRAT.web.rest.dto;

import org.appsec.securityRAT.domain.CollectionInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FECollectionInstanceDTO {

	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	private final Logger log = LoggerFactory.getLogger(FECollectionInstanceDTO.class);

	public FECollectionInstanceDTO() {

	}

	public FECollectionInstanceDTO(CollectionInstance collectionInstance) {
		this.id = collectionInstance.getId();
		this.name = collectionInstance.getName();
		this.description = collectionInstance.getDescription();
		this.showOrder = collectionInstance.getShowOrder();
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
