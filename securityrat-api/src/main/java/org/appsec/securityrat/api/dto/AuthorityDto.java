package org.appsec.securityrat.api.dto;

import lombok.Data;

@Data
public class AuthorityDto implements IdentifiableDto<String> {
    private String name;

    @Override
    public String getId() {
        return this.name;
    }

    @Override
    public void setId(String identifier) {
        this.name = identifier;
    }

    @Override
    public Class<String> getIdentifierClass() {
        return String.class;
    }
}
