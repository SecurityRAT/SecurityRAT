package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.ReqCategoryDto;
import org.appsec.securityrat.domain.ReqCategory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReqCategoryMapper
        extends IdentifiableMapper<Long, ReqCategory, ReqCategoryDto> {
}
