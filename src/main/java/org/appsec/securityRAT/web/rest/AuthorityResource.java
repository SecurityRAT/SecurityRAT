package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.appsec.securityRAT.domain.Authority;
import org.appsec.securityRAT.repository.AuthorityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.inject.Inject;

import java.util.List;


/**
 * REST controller for managing users.
 */
@RestController
@RequestMapping("/admin-api")
public class AuthorityResource {

    private final Logger log = LoggerFactory.getLogger(AuthorityResource.class);

    @Inject
    private AuthorityRepository authorityRepository;

//    @Inject
//    private AuthoritySearchRepository AuthoritySearchRepository;

    /**
     * GET  /users -> get all users.
     */
    @RequestMapping(value = "/authorities",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<Authority> getAll() {
        log.debug("REST request to get all Authorities");
        return authorityRepository.findAll();
    }
}
