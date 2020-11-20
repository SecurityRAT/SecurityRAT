package org.appsec.securityrat.api.dto.user;

import java.util.Set;
import java.util.stream.Collectors;
import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class AccountDto implements Dto {
    public static AccountDto fromInternal(InternalUserDto user) {
        AccountDto dto = new AccountDto();
        
        dto.setLogin(user.getLogin());
        dto.setPassword(null);
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setLangKey(user.getLangKey());
        dto.setRoles(user.getAuthorities()
                .stream()
                .map(e -> e.getName())
                .collect(Collectors.toSet()));
        
        return dto;
    }
    
    public static InternalUserDto toInternal(AccountDto acc) {
        InternalUserDto dto = new InternalUserDto();
        
        dto.setLogin(acc.getLogin());
        dto.setFirstName(acc.getFirstName());
        dto.setLastName(acc.getLastName());
        dto.setEmail(acc.getEmail());
        dto.setLangKey(acc.getLangKey());
        
        // Please note that the AccountDto interfaces cannot be used for
        // modifications of a user's roles.
        
        return dto;
    }
    
    private String login;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private String langKey;
    private Set<String> roles;
}
