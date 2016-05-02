package org.appsec.securityRAT.web.rest.dto;

import java.util.HashSet;
import java.util.Set;

import org.appsec.securityRAT.domain.OptColumnContent;
import org.appsec.securityRAT.domain.RequirementSkeleton;
import org.appsec.securityRAT.domain.TagInstance;

public class FERequirementDTO {

	private Long id;

	private String shortName;

	private String universalId;

	private String description;

	private Integer showOrder;

	private Set<FEOptionColumnContentDTO> optionColumnContents;

	private Set<Long> tagInstanceIds;

	public FERequirementDTO(){
	}

	public FERequirementDTO(RequirementSkeleton skeleton) {
		this.id = skeleton.getId();
		this.shortName = skeleton.getShortName();
		this.universalId = skeleton.getUniversalId();
		this.description = skeleton.getDescription();
		this.showOrder = skeleton.getShowOrder();

		this.optionColumnContents = new HashSet<FEOptionColumnContentDTO>();
		Set<OptColumnContent> optColumnContentsForSkeleton = skeleton.getOptColumnContents();
		for (OptColumnContent optColumnContent : optColumnContentsForSkeleton) {
			this.optionColumnContents.add(new FEOptionColumnContentDTO(optColumnContent));
		}

		this.tagInstanceIds = new HashSet<Long>();
		Set<TagInstance> tagInstances = skeleton.getTagInstances();
		for (TagInstance tagInstance : tagInstances) {
			this.tagInstanceIds.add(tagInstance.getId());
		}
	}

	public Long getId() {
		return id;
	}

	public String getShortName() {
		return shortName;
	}

	public String getUniversalId() {
		return universalId;
	}

	public String getDescription() {
		return description;
	}

	public Integer getShowOrder() {
		return showOrder;
	}

	public Set<FEOptionColumnContentDTO> getOptionColumnContents() {
		return optionColumnContents;
	}

	public Set<Long> getTagInstanceIds() {
		return tagInstanceIds;
	}

}
