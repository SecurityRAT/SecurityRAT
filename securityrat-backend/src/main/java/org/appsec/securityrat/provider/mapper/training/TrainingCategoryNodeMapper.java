package org.appsec.securityrat.provider.mapper.training;

import org.appsec.securityrat.api.dto.training.TrainingCategoryNodeDto;
import org.appsec.securityrat.domain.TrainingCategoryNode;
import org.appsec.securityrat.provider.mapper.IdentifiableMapper;
import org.appsec.securityrat.provider.mapper.ReqCategoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = { TrainingTreeNodeMapper.class, ReqCategoryMapper.class })
public interface TrainingCategoryNodeMapper
        extends IdentifiableMapper<Long, TrainingCategoryNode, TrainingCategoryNodeDto> {
}
