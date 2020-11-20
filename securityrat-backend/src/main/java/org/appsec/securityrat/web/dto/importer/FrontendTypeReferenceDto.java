package org.appsec.securityrat.web.dto.importer;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendTypeReferenceDto implements Dto {
    private boolean reference;
    private String referenceIdentifier;
}
