package org.appsec.securityrat.provider.mapper.training;

import org.appsec.securityrat.api.dto.training.TrainingBranchNodeDto;
import org.appsec.securityrat.domain.TrainingBranchNode;
import org.appsec.securityrat.provider.mapper.IdentifiableMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { TrainingTreeNodeMapper.class })
public interface TrainingBranchNodeMapper
        extends IdentifiableMapper<Long, TrainingBranchNode, TrainingBranchNodeDto> {
}
