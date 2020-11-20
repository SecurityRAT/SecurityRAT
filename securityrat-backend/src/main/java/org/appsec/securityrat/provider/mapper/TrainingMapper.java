package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.TrainingDto;
import org.appsec.securityrat.domain.Training;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = {
            OptColumnMapper.class,
            CollectionInstanceMapper.class,
            ProjectTypeMapper.class
        })
public interface TrainingMapper
        extends IdentifiableMapper<Long, Training, TrainingDto> {
}
