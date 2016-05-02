package org.appsec.securityRAT.web.rest.dto;

import org.appsec.securityRAT.domain.OptColumnContent;

public class FEOptionColumnContentDTO {

	private Long id;

	private Long optionColumnId;

	private String content;

	private String optionColumnName;

	public FEOptionColumnContentDTO() {
	}

	public FEOptionColumnContentDTO(OptColumnContent optColumnContent) {
		this.id = optColumnContent.getId();
		this.optionColumnId = optColumnContent.getOptColumn().getId();
		this.content = optColumnContent.getContent();
		this.optionColumnName = optColumnContent.getOptColumn().getName();
	}

	public Long getId() {
		return id;
	}

	public Long getOptionColumnId() {
		return optionColumnId;
	}

	public String getContent() {
		return content;
	}

	public String getOptionColumnName() {
		return optionColumnName;
	}

}
