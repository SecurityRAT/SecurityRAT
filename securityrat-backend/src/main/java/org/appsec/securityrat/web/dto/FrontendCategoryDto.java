package org.appsec.securityrat.web.dto;

import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendCategoryDto implements Dto {
    private Long id;
    private String name;
    private String description;
    private String shortcut;
    private Integer showOrder;
    private Set<FrontendRequirementDto> requirements;
}
