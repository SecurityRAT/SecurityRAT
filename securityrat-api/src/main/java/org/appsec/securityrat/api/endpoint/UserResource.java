package org.appsec.securityrat.api.endpoint;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.api.dto.user.UserDto;
import org.appsec.securityrat.api.endpoint.rest.SimpleResource;
import org.appsec.securityrat.api.provider.advanced.UserManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin-api")
public class UserResource {
    private static final String ENTITY_NAME = "user";
    
    @Inject
    private UserManager userManager;
    
    @GetMapping("/users")
    public ResponseEntity<Set<UserDto>> getAll() {
        return ResponseEntity.ok(this.userManager.findAll()
                .stream()
                .map(u -> UserDto.fromInternal(u, false))
                .collect(Collectors.toSet()));
    }
    
    @GetMapping("/userAuthorities")
    public ResponseEntity<Set<UserDto>> getUsersWithAuthority() {
        return ResponseEntity.ok(this.userManager.findAll()
                .stream()
                .map(u -> UserDto.fromInternal(u, true))
                .collect(Collectors.toSet()));
    }
    
    @GetMapping("/userAuthorities/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        InternalUserDto user = this.userManager.find(id);
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(UserDto.fromInternal(user, true));
    }
    
    @GetMapping("/users/{login}")
    public ResponseEntity<UserDto> getUser(@PathVariable String login) {
        InternalUserDto user = this.userManager.findByLogin(login);
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(UserDto.fromInternal(user, false));
    }
    
    @PostMapping("/users")
    public ResponseEntity<?> create(@RequestBody UserDto user)
            throws URISyntaxException {
        InternalUserDto internalUser = UserDto.toInternal(user);
        
        if (!this.userManager.create(internalUser)) {
            // TODO [luis.felger@bosch.com]: Implement different states, like
            //                               "Username already in use",
            //                               "Email address already in use",
            //                               etc.
            
            return ResponseEntity.badRequest()
                    .body("Creation failed.");
        }
        
        return ResponseEntity.created(new URI(
                "/admin-api/userAuthorities" + internalUser.getId()))
                .headers(SimpleResource.createEntityCreationAlert(
                        UserResource.ENTITY_NAME,
                        internalUser.getId()))
                .body(UserDto.fromInternal(internalUser, true));
    }
    
    @PutMapping("/users")
    public ResponseEntity<UserDto> update(@RequestBody UserDto user) {
        InternalUserDto internalUser = UserDto.toInternal(user);
        
        if (!this.userManager.update(internalUser)) {
            // TODO [luis.felger@bosch.com]: Updating may also fail if the user
            //                               did not try to change their login.
            
            return ResponseEntity.badRequest()
                    .header("Failure", "You cannot change the login")
                    .body(null);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        UserResource.ENTITY_NAME,
                        internalUser.getId()))
                .body(UserDto.fromInternal(internalUser, true));
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!this.userManager.delete(id)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        UserResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/users/{query}")
    public List<UserDto> search(@PathVariable String query) {
        return this.userManager.search(query)
                .stream()
                .map(u -> UserDto.fromInternal(u, false))
                .collect(Collectors.toList());
    }
}
