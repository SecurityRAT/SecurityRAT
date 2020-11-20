package org.appsec.securityrat.api.endpoint;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import javax.inject.Inject;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;
import org.appsec.securityrat.api.dto.AuthenticationConfigDto;
import org.appsec.securityrat.api.dto.user.AccountDto;
import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.api.dto.user.KeyAndPasswordDto;
import org.appsec.securityrat.api.dto.user.PersistentTokenDto;
import org.appsec.securityrat.api.provider.SecurityContext;
import org.appsec.securityrat.api.provider.SystemInfo;
import org.appsec.securityrat.api.provider.advanced.UserManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AccountResource {
    @Inject
    private SystemInfo systemInfo;
    
    @Inject
    private UserManager userManager;
    
    @Inject
    private SecurityContext securityContext;
    
    @GetMapping("/authentication_config")
    public ResponseEntity<AuthenticationConfigDto> getAuthenticationConfig() {
        return ResponseEntity.ok(this.systemInfo.getAuthenticationConfig());
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerAccount(@RequestBody AccountDto dto) {
        if (!this.userManager.create(
                AccountDto.toInternal(dto),
                dto.getPassword())) {
            // TODO [luis.felger@bosch.com]: Fix "login already in use" and
            //                               "e-mail address already in use"
            //                               errors
            
            return ResponseEntity.badRequest()
                    .body("Registration failed!");
        }
        
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
    
    @GetMapping("/activate")
    public ResponseEntity<Void> activateAccount(
            @RequestParam("key") String key) {
        
        if (this.userManager.activate(key)) {
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    @GetMapping("/authenticate")
    public ResponseEntity<String> isAuthenticated() {
        InternalUserDto currentUser = this.securityContext.getCurrentUser();
        
        if (currentUser == null) {
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return ResponseEntity.ok(currentUser.getLogin());
    }
    
    @GetMapping("/account")
    public ResponseEntity<?> getAccount() {
        InternalUserDto currentUser = this.securityContext.getCurrentUser();
        
        if (currentUser == null) {
            // This branch should never be reached because Spring denies the
            // access for unauthenticated users.
            
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(AccountDto.fromInternal(currentUser));
    }
    
    @PostMapping("/account")
    public ResponseEntity<?> saveAccount(@RequestBody AccountDto dto) {
        InternalUserDto currentUser = this.securityContext.getCurrentUser();
        
        if (currentUser == null) {
            // This branch should never be reached because Spring denies the
            // access for unauthenticated users.
            
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        InternalUserDto updatedUser = AccountDto.toInternal(dto);
        
        if (!Objects.equals(currentUser.getLogin(), updatedUser.getLogin())) {
            // Attempt to modify the informations of another user.
            
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        // Synchronizing the possibly modificated data.
        //
        // NOTE: We cannot update the storage with the updatedUser object via
        //       the UserManager directly as the object lacks the unique
        //       identifier.
        
        currentUser.setFirstName(updatedUser.getFirstName());
        currentUser.setLastName(updatedUser.getLastName());
        currentUser.setEmail(updatedUser.getEmail());
        currentUser.setLangKey(updatedUser.getLangKey());
        
        if (!this.userManager.update(currentUser)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    @PostMapping("/account/change_password")
    public ResponseEntity<?> changePassword(@RequestBody String password) {
        InternalUserDto currentUser = this.securityContext.getCurrentUser();
        
        if (currentUser == null) {
            // This branch should never be reached because Spring denies the
            // access for unauthenticated users.
            
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        if (!this.userManager.setPassword(currentUser.getId(), password)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    @PostMapping("/account/confirm_password")
    public ResponseEntity<?> confirmPassword(@RequestBody String password) {
        // FIXME: https://github.com/0x33C0/SecurityRAT/issues/1
        
        InternalUserDto currentUser = this.securityContext.getCurrentUser();
        
        if (currentUser == null) {
            // This branch should never be reached because Spring denies the
            // access for unauthenticated users.
            
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        if (!this.userManager.validatePassword(currentUser.getId(), password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Password did not match");
        }
        
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    @GetMapping("/account/sessions")
    public ResponseEntity<Set<PersistentTokenDto>> getCurrentSessions() {
        InternalUserDto currentUser = this.securityContext.getCurrentUser();
        
        if (currentUser == null) {
            // This branch should never be reached because Spring denies the
            // access for unauthenticated users.
            
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(currentUser.getPersistentTokens());
    }
    
    @DeleteMapping("/account/sessions/{series}")
    public ResponseEntity<?> invalidateSession(@PathVariable String series) {
        InternalUserDto currentUser = this.securityContext.getCurrentUser();
        
        if (currentUser == null) {
            // This branch should never be reached because Spring denies the
            // access for unauthenticated users.
            
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        // NOTE: Since the original value of "series" is a Base64-encoded
        //       string and the Spring firewall blocks URL-escaped characters
        //       (like '%2F') by default, we need to circumvent this by using
        //       another encoding that can pass the firewall.
        //       The current approach uses the hexadecimal representation of the
        //       UTF-8 encoded text.
        
        final String decodedSeries;
        
        try {
            decodedSeries = new String(
                    Hex.decodeHex(series),
                    StandardCharsets.UTF_8);
        } catch (DecoderException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid encoding");
        }
        
        // Resolving and removing the PersistentTokenDto instance
        
        Optional<PersistentTokenDto> token = currentUser.getPersistentTokens()
                .stream()
                .filter(t -> Objects.equals(t.getSeries(), decodedSeries))
                .findFirst();
        
        if (token.isEmpty()) {
            // The specified token does not exist (at least for this user).
            
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        currentUser.getPersistentTokens().remove(token.get());
        
        // Triggering the write back
        
        if (!this.userManager.update(currentUser)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return new ResponseEntity(HttpStatus.OK);
    }
    
    @PostMapping("/account/reset_password/init")
    public ResponseEntity<String> requestPasswordReset(
            @RequestBody String mail) {
        if (!this.userManager.requestPasswordReset(mail)) {
            // NOTE: The cause of the negative return state is not necessarily a
            //       missing email address.
            
            return ResponseEntity.badRequest()
                    .body("e-mail address not registered");
        }
        
        return ResponseEntity.ok("e-mail was sent");
    }
    
    @PostMapping("/account/reset_password/finish")
    public ResponseEntity<?> finishPasswordReset(
            @RequestBody KeyAndPasswordDto dto) {
        if (!this.userManager.resetPassword(
                dto.getKey(),
                dto.getNewPassword())) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
