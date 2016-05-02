package org.appsec.securityRAT.web.rest.dto;

import java.util.HashSet;
import java.util.Set;

import org.appsec.securityRAT.domain.CollectionCategory;
import org.appsec.securityRAT.domain.CollectionInstance;

public class FECollectionCategoryDTO {

	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	private Set<FECollectionInstanceDTO> collectionInstances;

    public FECollectionCategoryDTO() {
    }

    public FECollectionCategoryDTO(CollectionCategory collectionCategory) {
    	this.id = collectionCategory.getId();
    	this.name = collectionCategory.getName();
    	this.description = collectionCategory.getDescription();
    	this.showOrder = collectionCategory.getShowOrder();

    	this.collectionInstances = new HashSet<FECollectionInstanceDTO>();
    	Set<CollectionInstance> collectionInstancesForCategory = collectionCategory.getCollectionInstances();
    	for (CollectionInstance collectionInstance : collectionInstancesForCategory) {
    		collectionInstances.add(new FECollectionInstanceDTO(collectionInstance));
    	}
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

	public Set<FECollectionInstanceDTO> getCollectionInstances() {
		return collectionInstances;
	}


}
