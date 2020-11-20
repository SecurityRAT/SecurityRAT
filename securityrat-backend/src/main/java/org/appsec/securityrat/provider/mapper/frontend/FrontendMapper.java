package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.api.dto.Dto;

public interface FrontendMapper<TEntity, TDto extends Dto> {
    TDto toDto(TEntity entity);
}
