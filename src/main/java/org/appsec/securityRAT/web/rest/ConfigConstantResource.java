package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.appsec.securityRAT.domain.ConfigConstant;
import org.appsec.securityRAT.repository.ConfigConstantRepository;
import org.appsec.securityRAT.repository.search.ConfigConstantSearchRepository;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing constants.
 */
@RestController
@RequestMapping("/admin-api")
//@PreAuthorize("hasRole('" + AuthoritiesConstants.ADMIN +"')")
public class ConfigConstantResource {

    private final Logger log = LoggerFactory.getLogger(ConfigConstantResource.class);

    @Inject
    private ConfigConstantRepository configConstantRepository;

    @Inject
    private ConfigConstantSearchRepository configConstantSearchRepository;

    /**
     * POST  /configConstants -> Create a new constant.
     */
//    @RequestMapping(value = "/configConstants",
//            method = RequestMethod.POST,
//            produces = MediaType.APPLICATION_JSON_VALUE)
//    @Timed
//    public ResponseEntity<ConfigConstant> create(@RequestBody ConfigConstant configConstant) throws URISyntaxException {
//        log.debug("REST request to save configConstant : {}", configConstant);
//        if (configConstant.getId() != null) {
//            return ResponseEntity.badRequest().header("Failure", "A new constant cannot already have an ID").body(null);
//        }
//        ConfigConstant result = configConstantRepository.save(configConstant);
//        configConstantSearchRepository.save(result);
//        return ResponseEntity.created(new URI("/api/configConstants/" + result.getId()))
//                .headers(HeaderUtil.createEntityCreationAlert("configConstant", result.getId().toString()))
//                .body(result);
//    }

    /**
     * PUT  /configConstants -> Updates an existing constant.
     */
    @RequestMapping(value = "/configConstants",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ConfigConstant> update(@RequestBody ConfigConstant configConstant) throws URISyntaxException {
        log.debug("REST request to update configConstant : {}", configConstantRepository.findOne(configConstant.getId()));
//        if (configConstant.getId() == null) {
//            return create(configConstant);
//        }
        if(configConstantRepository.findOne(configConstant.getId()).getName().equals(configConstant.getName())) {
        	ConfigConstant result = configConstantRepository.save(configConstant);
            configConstantSearchRepository.save(configConstant);
            return ResponseEntity.ok()
                    .headers(HeaderUtil.createEntityUpdateAlert("configConstant", configConstant.getId().toString()))
                    .body(result);
        } else {
        	return ResponseEntity.badRequest().header("Failure", "The name of the constant cannot be changed.").body(null);
        }

    }

    /**
     * GET  /configConstants -> get all the constant.
     */
    @RequestMapping(value = "/configConstants",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<ConfigConstant> getAll() {
        log.debug("REST request to get all constant");
        return configConstantRepository.findAll();
    }

    /**
     * GET  /configConstants/:id -> get the "id" constant.
     */
    @RequestMapping(value = "/configConstants/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ConfigConstant> get(@PathVariable Long id) {
        log.debug("REST request to get constant : {}", id);
        return Optional.ofNullable(configConstantRepository.findOne(id))
            .map(constant -> new ResponseEntity<>(
            		constant,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

//    /**
//     * DELETE  /configConstants/:id -> delete the "id" constant.
//     */
//    @RequestMapping(value = "/configConstants/{id}",
//            method = RequestMethod.DELETE,
//            produces = MediaType.APPLICATION_JSON_VALUE)
//    @Timed
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        log.debug("REST request to delete constant : {}", id);
//        configConstantRepository.delete(id);
//        configConstantSearchRepository.delete(id);
//        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("configConstant", id.toString())).build();
//    }

    /**
     * SEARCH  /_search/configConstants/:query -> search for the constant corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/configConstants/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<ConfigConstant> search(@PathVariable String query) {
        return StreamSupport
            .stream(configConstantSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
