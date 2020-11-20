package org.appsec.securityrat.web.dto;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendAlternativeSetDto implements Dto {
    private Long id;
    private String name;
    private String description;
    private Integer showOrder;
}
