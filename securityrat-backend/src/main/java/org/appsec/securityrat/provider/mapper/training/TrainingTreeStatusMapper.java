package org.appsec.securityrat.provider.mapper.training;

import org.appsec.securityrat.api.dto.training.TrainingTreeStatusDto;
import org.appsec.securityrat.domain.TrainingTreeStatus;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TrainingTreeStatusMapper {
    TrainingTreeStatusDto toDto(TrainingTreeStatus entity);
    
    TrainingTreeStatus toEntity(TrainingTreeStatusDto dto);
}
