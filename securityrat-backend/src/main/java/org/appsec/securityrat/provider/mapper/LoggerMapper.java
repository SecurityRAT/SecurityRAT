package org.appsec.securityrat.provider.mapper;

import ch.qos.logback.classic.Logger;
import org.appsec.securityrat.api.dto.LoggerDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LoggerMapper {
    default LoggerDto toDto(Logger logger) {
        LoggerDto dto = new LoggerDto();
        
        dto.setName(logger.getName());
        dto.setLevel(logger.getEffectiveLevel().toString());
        
        return dto;
    }
}
