package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;

@Data
public class OptColumnContentDto implements IdentifiableDto<Long> {
    private Long id;
    private String content;
    private OptColumnDto optColumn;
    private RequirementSkeletonDto requirementSkeleton;

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
