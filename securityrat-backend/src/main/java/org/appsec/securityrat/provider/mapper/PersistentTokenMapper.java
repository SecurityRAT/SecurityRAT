package org.appsec.securityrat.provider.mapper;

import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.appsec.securityrat.api.dto.user.PersistentTokenDto;
import org.appsec.securityrat.domain.PersistentToken;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PersistentTokenMapper
        extends IdentifiableMapper<String, PersistentToken, PersistentTokenDto> {
    DateTimeFormatter FORMAT =
            DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH);
    
    @Override
    default PersistentTokenDto toDto(PersistentToken entity) {
        PersistentTokenDto dto = new PersistentTokenDto();
        
        dto.setSeries(entity.getSeries());
        dto.setIpAddress(entity.getIpAddress());
        dto.setUserAgent(entity.getUserAgent());
        dto.setFormattedTokenDate(entity.getTokenDate().format(
                PersistentTokenMapper.FORMAT));
        
        return dto;
    }
    
    @Override
    default PersistentToken toEntity(PersistentTokenDto dto) {
        // The direction dto -> entity should never be required as this would
        // mean that users could create new persistent tokens on client side.
        
        throw new UnsupportedOperationException();
    }
}
