package org.appsec.securityrat.provider.mapper.training;

import org.appsec.securityrat.api.dto.training.TrainingRequirementNodeDto;
import org.appsec.securityrat.domain.TrainingRequirementNode;
import org.appsec.securityrat.provider.mapper.IdentifiableMapper;
import org.appsec.securityrat.provider.mapper.RequirementSkeletonMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = {
            TrainingTreeNodeMapper.class,
            RequirementSkeletonMapper.class
        })
public interface TrainingRequirementNodeMapper
        extends IdentifiableMapper<Long, TrainingRequirementNode, TrainingRequirementNodeDto> {
}
