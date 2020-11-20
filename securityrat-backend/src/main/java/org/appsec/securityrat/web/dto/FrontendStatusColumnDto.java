package org.appsec.securityrat.web.dto;

import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendStatusColumnDto implements Dto {
    private Long id;
    private String name;
    private String description;
    private Integer showOrder;
    private Boolean isEnum;
    private Set<FrontendStatusColumnValueDto> values;
}
