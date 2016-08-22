package org.appsec.securityRAT.security;

import org.appsec.securityRAT.domain.Authority;
import org.appsec.securityRAT.domain.User;
import org.appsec.securityRAT.repository.AuthorityRepository;
import org.appsec.securityRAT.repository.UserRepository;
import org.appsec.securityRAT.service.UserService;
import org.pac4j.cas.profile.CasProfile;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.profile.UserProfile;
import org.pac4j.springframework.security.authentication.ClientAuthenticationToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;

import java.util.ArrayList;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.List;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService, org.springframework.security.core.userdetails.AuthenticationUserDetailsService<ClientAuthenticationToken> {

    private final Logger log = LoggerFactory.getLogger(UserDetailsService.class);

    @Inject
    private UserRepository userRepository;
    
    @Inject
    private AuthorityRepository authorityRepository;

    @Inject
    private UserService userService;


    @Override
    @Transactional
    public UserDetails loadUserByUsername(final String login) {

    	log.debug("Authenticating {}", login);
    	log.debug("==============================================================================");
    	log.debug("==============================================================================");
        String lowercaseLogin = login.toLowerCase();
        Optional<User> userFromDatabase =  userRepository.findOneByLogin(lowercaseLogin);
        return userFromDatabase.map(user -> {
            if (!user.getActivated()) {
                throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
            }
            List<GrantedAuthority> grantedAuthorities = user.getAuthorities().stream()
                    .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                    .collect(Collectors.toList());
            return new org.springframework.security.core.userdetails.User(lowercaseLogin,
                    user.getPassword(),
                    grantedAuthorities);
        }).orElseThrow(() -> new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the database"));
    }



	@Override
	public UserDetails loadUserDetails(ClientAuthenticationToken token)
			throws UsernameNotFoundException {
		log.debug("xxxxxxxxxxxxxxxxxxxxxxxxxxxx");
		log.debug(token.toString());
	  	UserProfile userProfile = token.getUserProfile();
    	CommonProfile commonProfile = (CommonProfile) userProfile;
    	CasProfile casProfile = (CasProfile) commonProfile;
//    	Set<Authority> userAuthorities = userService.getAllAuthoritiesForUser(casProfile.getUsername());
    	Set<Authority> userAuthorities = userService.getAllAuthoritiesForUser(casProfile.getId());
        List<GrantedAuthority> grantedAuthorities = new ArrayList<GrantedAuthority>();
    	for (Authority userAuthority : userAuthorities) {
    		GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(userAuthority.getName());
    		grantedAuthorities.add(grantedAuthority);
    	}
//    	return new org.springframework.security.core.userdetails.User(casProfile.getUsername(), "", grantedAuthorities);
    	return new org.springframework.security.core.userdetails.User(casProfile.getId(), "", grantedAuthorities);
	}
}
