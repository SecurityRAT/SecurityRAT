package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.TagCategory;
import org.appsec.securityrat.web.dto.FrontendTagCategoryDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { FrontendTagInstanceMapper.class })
public interface FrontendTagCategoryMapper
        extends FrontendMapper<TagCategory, FrontendTagCategoryDto> {
}
