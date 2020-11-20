package org.appsec.securityrat.web.dto;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;
import org.appsec.securityrat.domain.OptColumnContent;

@Data
public class FrontendOptionColumnContentDto implements Dto {
    private Long id;
    private Long optionColumnId;
    private String content;
    private String optionColumnName;

    public FrontendOptionColumnContentDto() {
	}

	public FrontendOptionColumnContentDto(OptColumnContent optColumnContent) {
		this.id = optColumnContent.getId();
		this.optionColumnId = optColumnContent.getOptColumn().getId();
		this.content = optColumnContent.getContent();
		this.optionColumnName = optColumnContent.getOptColumn().getName();
	}
}
