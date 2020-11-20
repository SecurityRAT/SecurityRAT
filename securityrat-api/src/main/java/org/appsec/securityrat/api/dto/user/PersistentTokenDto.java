package org.appsec.securityrat.api.dto.user;

import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;

@Data
public class PersistentTokenDto implements IdentifiableDto<String> {
    private String series;
    private String ipAddress;
    private String userAgent;
    private String formattedTokenDate;

    @Override
    public String getId() {
        return this.series;
    }

    @Override
    public void setId(String identifier) {
        this.series = identifier;
    }

    @Override
    public Class<String> getIdentifierClass() {
        return String.class;
    }
}
