package org.appsec.securityRAT.web.rest.dto;

import java.util.HashSet;
import java.util.Set;

import org.appsec.securityRAT.domain.ReqCategory;
import org.appsec.securityRAT.domain.RequirementSkeleton;

public class FECategoryDTO {

	private Long id;

	private String name;

	private String description;

	private String shortcut;

	private Integer showOrder;

	private Set<FERequirementDTO> requirements;


	public FECategoryDTO(){
	}

	public FECategoryDTO(ReqCategory reqCategory) {
		this.id = reqCategory.getId();
		this.name = reqCategory.getName();
		this.shortcut = reqCategory.getShortcut();
		this.description = reqCategory.getDescription();
		this.showOrder = reqCategory.getShowOrder();

		this.requirements = new HashSet<FERequirementDTO>();
		Set<RequirementSkeleton> skeletonsForCategory = reqCategory.getRequirementSkeletons();
		for (RequirementSkeleton requirementSkeleton : skeletonsForCategory) {
			this.requirements.add(new FERequirementDTO(requirementSkeleton));
		}
	}

	public Integer getShowOrder() {
		return showOrder;
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

	public String getShortcut() {
		return shortcut;
	}

	public Set<FERequirementDTO> getRequirements() {
		return requirements;
	}


}
