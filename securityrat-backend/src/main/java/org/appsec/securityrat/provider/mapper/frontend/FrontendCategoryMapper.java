package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.ReqCategory;
import org.appsec.securityrat.web.dto.FrontendCategoryDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { FrontendRequirementMapper.class })
public interface FrontendCategoryMapper
        extends FrontendMapper<ReqCategory, FrontendCategoryDto> {

    @Override
    @Mapping(target = "requirements", source = "requirementSkeletons")
    public FrontendCategoryDto toDto(ReqCategory entity);
}
