package org.appsec.securityRAT.web.rest.dto;

import java.util.HashSet;
import java.util.Set;

import org.appsec.securityRAT.domain.TagCategory;
import org.appsec.securityRAT.domain.TagInstance;

public class FETagCategoryDTO {
	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	private Set<FETagInstanceDTO> tagInstances;

    public FETagCategoryDTO() {
    }

    public FETagCategoryDTO(TagCategory tagCategory) {
    	this.id = tagCategory.getId();
    	this.name = tagCategory.getName();
    	this.description = tagCategory.getDescription();
    	this.showOrder = tagCategory.getShowOrder();

    	this.tagInstances = new HashSet<FETagInstanceDTO>();
    	Set<TagInstance> tagInstancesForCategory = tagCategory.getTagInstances();
    	for (TagInstance tagInstance : tagInstancesForCategory) {
    		tagInstances.add(new FETagInstanceDTO(tagInstance));
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

	public Set<FETagInstanceDTO> getTagInstances() {
		return tagInstances;
	}


}

