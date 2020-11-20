package org.appsec.securityrat.provider.mapper.training;

import org.appsec.securityrat.api.dto.training.TrainingTreeNodeDto;
import org.appsec.securityrat.domain.TrainingTreeNode;
import org.appsec.securityrat.provider.mapper.IdentifiableMapper;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TrainingTreeNodeMapper
        extends IdentifiableMapper<Long, TrainingTreeNode, TrainingTreeNodeDto> {
    
    void updateDto(
            TrainingTreeNode source,
            @MappingTarget TrainingTreeNodeDto target);
}
