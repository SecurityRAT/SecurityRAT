package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class AlternativeInstanceDto extends SimpleDto<Long> {
    private String content;
    private AlternativeSetDto alternativeSet;
    private RequirementSkeletonDto requirementSkeleton;
    
    public AlternativeInstanceDto() {
        super(Long.class);
    }
}
