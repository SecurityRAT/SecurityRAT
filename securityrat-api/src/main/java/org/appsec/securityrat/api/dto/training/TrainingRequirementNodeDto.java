package org.appsec.securityrat.api.dto.training;

import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;
import org.appsec.securityrat.api.dto.rest.RequirementSkeletonDto;

@Data
public class TrainingRequirementNodeDto implements IdentifiableDto<Long> {
    private Long id;
    private TrainingTreeNodeDto node;
    private RequirementSkeletonDto requirementSkeleton;

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
