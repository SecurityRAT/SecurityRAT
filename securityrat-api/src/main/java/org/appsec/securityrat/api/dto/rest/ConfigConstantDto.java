package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class ConfigConstantDto extends SimpleDto<Long> {
    private String name;
    private String value;
    private String description;
    
    public ConfigConstantDto() {
        super(Long.class);
    }
}
