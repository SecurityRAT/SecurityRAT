package org.appsec.securityrat.web.dto.importer;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendAttributeDto implements Dto {
    private String identifier;
    private String displayName;
    private FrontendTypeReferenceDto type;
}
