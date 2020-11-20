package org.appsec.securityrat.web.dto;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendAlternativeInstanceDto implements Dto {
    private Long id;
    private Long requirementId;
    private String content;
}
