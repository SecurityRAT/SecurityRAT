package org.appsec.securityrat.security;

import org.appsec.securityrat.domain.User;
import org.appsec.securityrat.repository.UserRepository;
import org.hibernate.validator.internal.constraintvalidators.hv.EmailValidator;
import org.pac4j.core.profile.UserProfile;
import org.pac4j.springframework.security.authentication.Pac4jAuthenticationToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
public class DomainUserDetailsService implements UserDetailsService, AuthenticationUserDetailsService<Pac4jAuthenticationToken> {

    private final Logger log = LoggerFactory.getLogger(DomainUserDetailsService.class);
    private static final String userNotFoundError = "User with email %s was not found in the database";

    private final UserRepository userRepository;

    public DomainUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(final String login) {
        log.debug("Authenticating {}", login);

        if (new EmailValidator().isValid(login, null)) {
            return userRepository.findOneByEmail(login)
                .map(user -> createSpringSecurityUser(login, user))
                .orElseThrow(() -> new UsernameNotFoundException(String.format(userNotFoundError, login)));
        }

        String lowercaseLogin = login.toLowerCase(Locale.ENGLISH);
        return userRepository.findOneByLogin(lowercaseLogin)
            .map(user -> createSpringSecurityUser(lowercaseLogin, user))
            .orElseThrow(() -> new UsernameNotFoundException(String.format(userNotFoundError, lowercaseLogin)));
    }

    private org.springframework.security.core.userdetails.User createSpringSecurityUser(String lowercaseLogin, User user) {
        if (!user.getActivated()) {
            throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
        }
        List<GrantedAuthority> grantedAuthorities = user.getAuthorities().stream()
            .map(authority -> new SimpleGrantedAuthority(authority.getName()))
            .collect(Collectors.toList());
        if (grantedAuthorities.isEmpty()) {
            grantedAuthorities.add(new SimpleGrantedAuthority(AuthoritiesConstants.FRONTEND_USER));
        }

        return new org.springframework.security.core.userdetails.User(user.getLogin(),
            user.getPassword(),
            grantedAuthorities);
    }

    @Override
    public UserDetails loadUserDetails(Pac4jAuthenticationToken token) {
        log.debug("xxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        UserProfile userProfile = token.getProfile();
        String lowercaseLogin = userProfile.getId().toLowerCase(Locale.ENGLISH);
        return userRepository.findOneByLogin(lowercaseLogin)
            .map(user -> createSpringSecurityUser(lowercaseLogin, user))
            .orElseThrow(() -> new UsernameNotFoundException(String.format(userNotFoundError, lowercaseLogin)));
    }
}
