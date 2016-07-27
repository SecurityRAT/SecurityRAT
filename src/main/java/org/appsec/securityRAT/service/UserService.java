package org.appsec.securityRAT.service;

import org.appsec.securityRAT.domain.Authority;
import org.appsec.securityRAT.domain.User;
import org.appsec.securityRAT.repository.AuthorityRepository;
import org.appsec.securityRAT.repository.PersistentTokenRepository;
import org.appsec.securityRAT.repository.UserRepository;
import org.appsec.securityRAT.repository.search.UserSearchRepository;
import org.appsec.securityRAT.security.SecurityUtils;
import org.appsec.securityRAT.service.util.RandomUtil;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.pac4j.cas.profile.CasProfile;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.profile.UserProfile;
import org.pac4j.springframework.security.authentication.ClientAuthenticationToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    @Inject
    private PasswordEncoder passwordEncoder;

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserSearchRepository userSearchRepository;

    @Inject
    private PersistentTokenRepository persistentTokenRepository;

    @Inject
    private AuthorityRepository authorityRepository;

    public Optional<User> activateRegistration(String key) {
        log.debug("Activating user for activation key {}", key);
        userRepository.findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                userRepository.save(user);
                userSearchRepository.save(user);
                log.debug("Activated user: {}", user);
                return user;
            });
        return Optional.empty();
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
       log.debug("Reset user password for reset key {}", key);

       return userRepository.findOneByResetKey(key)
           .filter(user -> {
               DateTime oneDayAgo = DateTime.now().minusHours(24);
               return user.getResetDate().isAfter(oneDayAgo.toInstant().getMillis());
           })
           .map(user -> {
               user.setPassword(passwordEncoder.encode(newPassword));
               user.setResetKey(null);
               user.setResetDate(null);
               userRepository.save(user);
               return user;
           });
    }

    public Optional<User> requestPasswordReset(String mail) {
       return userRepository.findOneByEmail(mail)
           .filter(user -> user.getActivated() == true)
           .map(user -> {
               user.setResetKey(RandomUtil.generateResetKey());
               user.setResetDate(DateTime.now());
               userRepository.save(user);
               return user;
           });
    }

    public User createUserInformation(String login, String password, String firstName, String lastName, String email,
                                      String langKey) {

        User newUser = new User();
        Authority authority = authorityRepository.findOne("ROLE_USER");
        Set<Authority> authorities = new HashSet<>();
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setLogin(login);
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setEmail(email);
        newUser.setLangKey(langKey);
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        authorities.add(authority);
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);
        userSearchRepository.save(newUser);
        log.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    public void updateUserInformation(String firstName, String lastName, String email, String langKey) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).ifPresent(u -> {
            u.setFirstName(firstName);
            u.setLastName(lastName);
            u.setEmail(email);
            u.setLangKey(langKey);
            userRepository.save(u);
            userSearchRepository.save(u);
            log.debug("Changed Information for User: {}", u);
        });
    }

    public void changePassword(String password) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).ifPresent(u-> {
            String encryptedPassword = passwordEncoder.encode(password);
            u.setPassword(encryptedPassword);
            userRepository.save(u);
            log.debug("Changed password for User: {}", u);
        });
    }

    @Transactional(readOnly = true)
    public User getUserWithAuthorities() {
        User currentUser = new User();
    	try {
        	currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get();
        	currentUser.getAuthorities().size(); // eagerly load the association
        } catch (Exception e) {
        	currentUser = getUserFromCASToken();
        }
        return currentUser;
    }
    
    public User getUserFromCASToken() {
    	ClientAuthenticationToken token = (ClientAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
    	UserProfile userProfile = token.getUserProfile();
    	CommonProfile commonProfile = (CommonProfile) userProfile;
    	CasProfile casProfile = (CasProfile) commonProfile;
    	User currentUser = new User();
    	String username = "";
    	if(casProfile.getUsername() != null && !casProfile.getUsername().isEmpty())
    		username = casProfile.getUsername();
    	else if(casProfile.getId() != null && !casProfile.getId().isEmpty())
    		username = casProfile.getId();
    	currentUser.setLogin(username);
    	currentUser.setEmail(casProfile.getAttribute("email") != null ? casProfile.getAttribute("email").toString() : "");
    	currentUser.setFirstName(casProfile.getAttribute("firstName") !=  null ? casProfile.getAttribute("firstName").toString() : "");
    	currentUser.setLastName(casProfile.getAttribute("lastName") !=  null ? casProfile.getAttribute("lastName").toString() : "");
    	currentUser.setActivated(true);
    	// id automatically generated.
    	//currentUser.setId(Long.parseLong(casProfile.getAttribute("personId").toString())); 
    	currentUser.setAuthorities(getAllAuthoritiesForUser(currentUser.getLogin()));
    	return currentUser;
    }

    public Set<Authority> getAllAuthoritiesForUser(String username) {
    	Set<Authority> authorities = getAuthoritiesForUserFromDB(username);
    	authorities.addAll(getGeneralAuthorities());
    	return authorities;
    }

    public Set<Authority> getAuthoritiesForUserFromDB(String username) {
    	Set<Authority> authorities = new HashSet<Authority>();
    	Optional<User> optUser = userRepository.findOneByLogin(username);
    	try {
    	//if (optUser.get().getClass()==User.class && optUser.get() != null) {
    		authorities = optUser.get().getAuthorities();
    	} catch (Exception e) {
    		log.debug("User {} not found in db", username);
    	}
    	return authorities;
    }

    public Set<Authority> getGeneralAuthorities() {
    	Set<Authority> authorities = new HashSet<Authority>();
    			Collections.<Authority>emptySet();
    	Authority authority = authorityRepository.findOne("ROLE_FRONTEND_USER");
    	log.debug("Authority found: {}", authority.toString());
    	authorities.add(authority);
    	return authorities;
    }

    /**
     * Persistent Token are used for providing automatic authentication, they should be automatically deleted after
     * 30 days.
     * <p/>
     * <p>
     * This is scheduled to get fired everyday, at midnight.
     * </p>
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void removeOldPersistentTokens() {
        LocalDate now = new LocalDate();
        persistentTokenRepository.findByTokenDateBefore(now.minusMonths(1)).stream().forEach(token ->{
            log.debug("Deleting token {}", token.getSeries());
            User user = token.getUser();
            user.getPersistentTokens().remove(token);
            persistentTokenRepository.delete(token);
        });
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p/>
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     * </p>
     */
//    @Scheduled(cron = "0 0 1 * * ?")
//    public void removeNotActivatedUsers() {
//        DateTime now = new DateTime();
//        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
//        for (User user : users) {
//            log.debug("Deleting not activated user {}", user.getLogin());
//            userRepository.delete(user);
//            userSearchRepository.delete(user);
//        }
//    }
}
