package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class OptColumnTypeDto extends SimpleDto<Long> {
    private String name;
    private String description;
    
    public OptColumnTypeDto() {
        super(Long.class);
    }
}
