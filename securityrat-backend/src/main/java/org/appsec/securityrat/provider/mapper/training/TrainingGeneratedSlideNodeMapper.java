package org.appsec.securityrat.provider.mapper.training;

import org.appsec.securityrat.api.dto.training.TrainingGeneratedSlideNodeDto;
import org.appsec.securityrat.domain.TrainingGeneratedSlideNode;
import org.appsec.securityrat.provider.mapper.IdentifiableMapper;
import org.appsec.securityrat.provider.mapper.OptColumnMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = { TrainingTreeNodeMapper.class, OptColumnMapper.class })
public interface TrainingGeneratedSlideNodeMapper
        extends IdentifiableMapper<Long, TrainingGeneratedSlideNode, TrainingGeneratedSlideNodeDto> {
}
