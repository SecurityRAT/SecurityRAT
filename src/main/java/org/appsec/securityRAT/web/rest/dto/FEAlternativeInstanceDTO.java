package org.appsec.securityRAT.web.rest.dto;

import org.appsec.securityRAT.domain.AlternativeInstance;

public class FEAlternativeInstanceDTO {

	private Long id;

	private Long requirementId;

	private String content;


	public FEAlternativeInstanceDTO() {
	}

	public FEAlternativeInstanceDTO(AlternativeInstance alternativeInstance) {
		this.id = alternativeInstance.getId();
		this.requirementId = alternativeInstance.getRequirementSkeleton().getId();
		this.content = alternativeInstance.getContent();
	}

	public Long getId() {
		return id;
	}

	public Long getRequirementId() {
		return requirementId;
	}

	public String getContent() {
		return content;
	}

}
