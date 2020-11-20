package org.appsec.securityrat.web.dto.importer;

import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendTypeDto implements Dto {
    private String identifier;
    private String displayName;
    private Set<FrontendAttributeDto> attributes;
}
