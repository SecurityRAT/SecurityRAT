package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class SlideTemplateDto extends SimpleDto<Long> {
    private String name;
    private String description;
    private String content;
    
    public SlideTemplateDto() {
        super(Long.class);
    }
}
