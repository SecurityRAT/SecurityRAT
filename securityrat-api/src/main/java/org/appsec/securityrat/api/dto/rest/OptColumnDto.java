package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class OptColumnDto extends SimpleDto<Long> {
    private String name;
    private String description;
    private Integer showOrder;
    private Boolean active;
    private Boolean isVisibleByDefault;
    private OptColumnTypeDto optColumnType;
    
    public OptColumnDto() {
        super(Long.class);
    }
}
