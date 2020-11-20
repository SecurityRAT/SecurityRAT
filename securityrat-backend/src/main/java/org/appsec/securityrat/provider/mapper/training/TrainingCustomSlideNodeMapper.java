package org.appsec.securityrat.provider.mapper.training;

import org.appsec.securityrat.api.dto.training.TrainingCustomSlideNodeDto;
import org.appsec.securityrat.domain.TrainingCustomSlideNode;
import org.appsec.securityrat.provider.mapper.IdentifiableMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { TrainingTreeNodeMapper.class })
public interface TrainingCustomSlideNodeMapper
        extends IdentifiableMapper<Long, TrainingCustomSlideNode, TrainingCustomSlideNodeDto> {
}
