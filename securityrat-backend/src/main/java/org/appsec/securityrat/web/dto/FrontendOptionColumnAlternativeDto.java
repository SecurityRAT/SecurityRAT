package org.appsec.securityrat.web.dto;

import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendOptionColumnAlternativeDto implements Dto {
    private Long id;
    private Set<FrontendAlternativeSetDto> alternativeSets;
}
