package org.appsec.securityrat.api.dto;

import lombok.Data;

@Data
public class AuthenticationConfigDto implements Dto {
    public enum Type {
        FORM,
        CAS
    }
    
    private Type type;
    private Boolean registration;
    private String casLogout;
}
