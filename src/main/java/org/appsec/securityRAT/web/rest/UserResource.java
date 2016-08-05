package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Charsets;
import com.google.common.io.Files;

import org.appsec.securityRAT.domain.Authority;
import org.appsec.securityRAT.domain.User;
import org.appsec.securityRAT.repository.UserRepository;
import org.appsec.securityRAT.repository.search.UserSearchRepository;
import org.appsec.securityRAT.security.SecurityUtils;
import org.appsec.securityRAT.service.MailService;
import org.appsec.securityRAT.service.UserService;
import org.appsec.securityRAT.web.rest.dto.UserDTO;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing users.
 */
@RestController
@RequestMapping("/admin-api")
public class UserResource {

    private final Logger log = LoggerFactory.getLogger(UserResource.class);

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserSearchRepository userSearchRepository;
    
    @Inject
    private UserService userService;
    
    @Inject
    private MailService mailService;

    /**
     * GET  /users -> get all users.
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<User> getAll() {
        log.debug("REST request to get all Users");
        return userRepository.findAll();
    }
    
    /**
     * GET  /users -> get all users with their roles.
     */
    @RequestMapping(value = "/userAuthorities",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<User> getUsersWithAuthority() {
        log.debug("REST request to get all Users with their authorities");
        return userRepository.findAllRolesOfUsers();
    }
    
    /**
     * GET  /users/:login -> get the user with his roles.
     */
    @RequestMapping(value = "/userAuthorities/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    ResponseEntity<User> getUser(@PathVariable Long id) {
        log.debug("REST request to get User : {}", id);
        return userRepository.findAllRolesOfUser(id)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    /**
     * GET  /users/:login -> get the user by login.
     */
    @RequestMapping(value = "/users/{login}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    ResponseEntity<User> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        return userRepository.findOneByLogin(login)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    /**
     * POST  /users/ -> register a new user for authentication.
     * @throws URISyntaxException 
     */
    @RequestMapping(value = "/users",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    ResponseEntity<User> create(@RequestBody User userdto, HttpServletRequest request) throws URISyntaxException {
        
        if(userRepository.findOneByLogin(userdto.getLogin()).isPresent())
        	return ResponseEntity.badRequest().header("Failure", "username already use").body(null);
        if(userRepository.findOneByEmail(userdto.getEmail()).isPresent())
        	return ResponseEntity.badRequest().header("Failure", "Email address already used").body(null);
        String generatedPassword = userService.generateUserPassword();
        User user = userService.createUserInformation(userdto.getLogin(), generatedPassword, 
        		userdto.getFirstName(), userdto.getLastName(), userdto.getEmail(), userdto.getLangKey(), userdto.getAuthorities());
        if(userService.getAuthenticationType().equals("FORM")) {
	        String baseUrl = request.getScheme() + // "http"
	                "://" +                                // "://"
	                request.getServerName() +              // "myhost"
	                ":" +                                  // ":"
	                request.getServerPort();               // "80"
	        mailService.sendActivationEmail(user, baseUrl);
	        String content = "";
	        try {
				content = Files.toString(new File("src/main/resources/templates/mail_password_user.txt"),	Charsets.UTF_8);
			} catch (IOException e) {
			}
	        content = content.replaceAll("§USERNAME_LOGIN§", userdto.getLogin());
	        content = content.replaceAll("§PASSWORD§", generatedPassword.substring(0, 4));
	        mailService.sendEmail(userdto.getEmail(), "Password", content, false, false);
	        try {
				content = Files.toString(new File("src/main/resources/templates/mail_password_admin.txt"),	Charsets.UTF_8);
			} catch (IOException e) {
			}
	        content = content.replaceAll("§ADMIN_LOGIN§", SecurityUtils.getCurrentLogin());
	        content = content.replaceAll("§USERNAME_LOGIN§", userdto.getLogin());
	        content = content.replaceAll("§PASSWORD§", generatedPassword.substring(4, 8));
	        mailService.sendEmail(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get().getEmail(), "Password", content, false, false);
        }
        return ResponseEntity.created(new URI("/admin-api/userAuthorities/" + user.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("user", user.getId().toString()))
                .body(user);
    }
    
    /**
     * PUT  /users -> Updates an existing user.
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<User> update(@RequestBody User user, HttpServletRequest request) throws URISyntaxException {
    	User u = userRepository.findOneByLogin(user.getLogin()).get();
    	if(u != null) {
	    	log.debug("REST request to update User : {}", user.getId());
	    	user.setPassword(u.getPassword());
	        User result = userRepository.save(user);
	        userSearchRepository.save(user);
	        return ResponseEntity.ok()
	                .headers(HeaderUtil.createEntityUpdateAlert("user", user.getId().toString()))
	                .body(result);
    	} else {
    		return ResponseEntity.badRequest().header("Failure", "you cannot change the login").body(null);
    	}
    }
    
    /**
     * DELETE  /users/:id -> delete the "id" tagCategory.
     */
    @RequestMapping(value = "/users/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete  user: {}", id);
        userRepository.delete(id);
        userSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("user", id.toString())).build();
    }

    
    /**
     * SEARCH  /_search/users/:query -> search for the User corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/users/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<User> search(@PathVariable String query) {
        return StreamSupport
            .stream(userSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
