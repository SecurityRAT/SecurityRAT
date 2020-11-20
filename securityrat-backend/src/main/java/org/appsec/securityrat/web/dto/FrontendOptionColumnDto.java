package org.appsec.securityrat.web.dto;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendOptionColumnDto implements Dto {
    private Long id;
    private String name;
    private String description;
    private Integer showOrder;
    private String type;
    private boolean isVisibleByDefault;
}
