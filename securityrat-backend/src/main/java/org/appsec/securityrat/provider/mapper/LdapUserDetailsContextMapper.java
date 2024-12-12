package org.appsec.securityrat.provider.mapper;

import java.util.ArrayList;
import java.util.Collection;

import javax.inject.Inject;

import org.apache.logging.log4j.util.Strings;
import org.appsec.securityrat.config.ApplicationProperties;
import org.appsec.securityrat.security.AuthoritiesConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.LdapAuthority;
import org.springframework.security.ldap.userdetails.LdapUserDetailsImpl;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;
import org.springframework.security.ldap.userdetails.LdapUserDetailsImpl.Essence;
import org.springframework.stereotype.Component;

@Component
public class LdapUserDetailsContextMapper implements UserDetailsContextMapper {
	private final Logger log = LoggerFactory.getLogger(LdapUserDetailsContextMapper.class);

	@Inject
    private ApplicationProperties appConfig;

	@Override
	public UserDetails mapUserFromContext(DirContextOperations context, String username,
			Collection<? extends GrantedAuthority> grantedAuthorities) {
    	String dn = context.getDn().toString();
    	Collection<LdapAuthority> ldapAuthorities = new ArrayList<>();
    	ldapAuthorities.add(new LdapAuthority(AuthoritiesConstants.FRONTEND_USER, dn)); // Default role that every user has

    	if(Strings.isBlank(this.appConfig.getLdap().getGroupOfAdmins())
    			|| grantedAuthorities.stream().anyMatch(authority -> authority.getAuthority()
    					.equals(this.appConfig.getLdap().getGroupOfAdmins().toUpperCase()))) {
    		ldapAuthorities.add(new LdapAuthority(AuthoritiesConstants.ADMIN, dn));
    	}

    	if(Strings.isBlank(this.appConfig.getLdap().getGroupOfTrainers())
    			|| grantedAuthorities.stream().anyMatch(authority -> authority.getAuthority()
    					.equals(this.appConfig.getLdap().getGroupOfTrainers().toUpperCase()))) {
    		ldapAuthorities.add(new LdapAuthority(AuthoritiesConstants.TRAINER, dn));
    	}

    	if(Strings.isBlank(this.appConfig.getLdap().getGroupOfUsers())
    			|| grantedAuthorities.stream().anyMatch(authority -> authority.getAuthority()
    					.equals(this.appConfig.getLdap().getGroupOfUsers().toUpperCase()))) {
    		ldapAuthorities.add(new LdapAuthority(AuthoritiesConstants.USER, dn));
    	}

    	log.debug("LDAP granted Authorities = {}", ldapAuthorities.toString());

    	Essence ldapUserDetailsEssence = new LdapUserDetailsImpl.Essence(context);
    	ldapUserDetailsEssence.setUsername(username);
    	ldapUserDetailsEssence.setAuthorities(ldapAuthorities);
        return ldapUserDetailsEssence.createUserDetails();
	}

	@Override
	public void mapUserToContext(UserDetails user, DirContextAdapter ctx) {
	}
}
