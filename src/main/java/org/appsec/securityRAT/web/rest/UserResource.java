package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.appsec.securityRAT.domain.TagCategory;
import org.appsec.securityRAT.domain.TagInstance;
import org.appsec.securityRAT.domain.User;
import org.appsec.securityRAT.repository.UserRepository;
import org.appsec.securityRAT.repository.search.UserSearchRepository;
import org.appsec.securityRAT.security.AuthoritiesConstants;
import org.appsec.securityRAT.service.UserService;
import org.appsec.securityRAT.web.rest.dto.UserDTO;
import org.appsec.securityRAT.web.rest.errors.ErrorDTO;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.inject.Inject;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
     * GET  /users -> get all users.
     */
    @RequestMapping(value = "/userAuthorities",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<User> getUsersWithAuthority() {
        log.debug("REST request to get all Users with their authorities");
        return Optional.ofNullable(userService.getUserFromCASToken())
        		.map(user -> {
        			return userRepository.findAllRolesOfUsers(user.getLogin());
        		}).get();
    }
    
    /**
     * GET  /users/:login -> get the "login" user.
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
     * GET  /users/:login -> get the "login" user.
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
     * POST  /users/:login -> get the "login" user.
     * @throws URISyntaxException 
     */
    @RequestMapping(value = "/users",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    ResponseEntity<User> create(@RequestBody User user) throws URISyntaxException {
        log.debug("REST request to add User");
        if (user.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new user cannot already have an ID").body(null);
        } 
        if(userRepository.findOneByLogin(user.getLogin()).isPresent())
        	return ResponseEntity.badRequest().header("Failure", "duplicate username").body(null);
        if(userRepository.findOneByEmail(user.getEmail()).isPresent())
        	return ResponseEntity.badRequest().header("Failure", "duplicate email addresses").body(null);
        user.setActivated(true);
        User result = userRepository.save(user);
        userSearchRepository.save(result);
        return ResponseEntity.created(new URI("/admin-api/userAuthorities/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("user", result.getId().toString()))
                .body(result);
    }
    
    /**
     * PUT  /users -> Updates an existing user.
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<User> update(@RequestBody User user) throws URISyntaxException {
    	log.debug("REST request to update User : {}", user.getId());
        if (user.getId() == null) {
            return create(user);
        }
        User result = userRepository.save(user);
        userSearchRepository.save(user);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("user", user.getId().toString()))
                .body(result);
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
