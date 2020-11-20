package org.appsec.securityrat.api.dto.user;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class KeyAndPasswordDto implements Dto {
    private String key;
    private String newPassword;
}
