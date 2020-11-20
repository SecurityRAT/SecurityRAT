package org.appsec.securityrat.provider.advanced;

import com.google.common.base.Preconditions;
import io.github.jhipster.security.RandomUtil;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.api.provider.advanced.UserManager;
import org.appsec.securityrat.config.ApplicationProperties;
import org.appsec.securityrat.domain.Authority;
import org.appsec.securityrat.domain.PersistentToken;
import org.appsec.securityrat.domain.User;
import org.appsec.securityrat.provider.MailService;
import org.appsec.securityrat.provider.mapper.AuthorityMapper;
import org.appsec.securityrat.provider.mapper.InternalUserMapper;
import org.appsec.securityrat.repository.AuthorityRepository;
import org.appsec.securityrat.repository.PersistentTokenRepository;
import org.appsec.securityrat.repository.UserRepository;
import org.appsec.securityrat.repository.search.UserSearchRepository;
import org.appsec.securityrat.security.AuthoritiesConstants;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class UserManagerImpl implements UserManager {
    @Inject
    private UserRepository repo;
    
    @Inject
    private UserSearchRepository searchRepo;
    
    @Inject
    private PersistentTokenRepository tokenRepo;
    
    @Inject
    private AuthorityRepository authorityRepo;
    
    @Inject
    private InternalUserMapper mapper;
    
    @Inject
    private AuthorityMapper authorityMapper;
    
    @Inject
    private PasswordEncoder passwordEncoder;
    
    @Inject
    private MailService mailService;
    
    @Inject
    private ApplicationProperties appSettings;
    
    @Override
    @Transactional
    public Set<InternalUserDto> findAll() {
        return this.repo.findAll()
                .stream()
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public InternalUserDto find(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.repo.findOneById(id)
                .map(this.mapper::toDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public InternalUserDto findByLogin(String login) {
        Preconditions.checkNotNull(login);
        
        return this.repo.findOneByLogin(login)
                .map(this.mapper::toDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public InternalUserDto findByEmail(String email) {
        Preconditions.checkNotNull(email);
        
        return this.repo.findOneByEmail(email)
                .map(this.mapper::toDto)
                .orElse(null);
    }

    @Override
    public boolean create(InternalUserDto user) {
        Preconditions.checkNotNull(user);
        this.create(user, RandomUtil.generatePassword(), true);
        return true;
    }

    @Override
    @Transactional
    public boolean create(InternalUserDto user, String password) {
        Preconditions.checkNotNull(user);
        Preconditions.checkNotNull(password);
        
        this.create(user, password, false);

        return true;
    }

    @Override
    @Transactional
    public boolean update(InternalUserDto user) {
        Preconditions.checkNotNull(user);
        
        if (user.getLogin() == null) {
            return false;
        }
        
        // We cannot assume that the InternalUserDto's id is correctly set as,
        // for example, AccountDtos do not provide this information.
        //
        // Thus, we need to resolve the user by its login and copy the possibly
        // updated information.
        
        User entity = this.repo.findOneByLogin(user.getLogin()).orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        entity.setFirstName(user.getFirstName());
        entity.setLastName(user.getLastName());
        entity.setEmail(user.getEmail());
        entity.setLangKey(user.getLangKey());
        entity.setActivated(user.isActivated());
        
        if (user.getAuthorities() != null) {
            entity.setAuthorities(user.getAuthorities()
                    .stream()
                    .map(this.authorityMapper::toEntity)
                    .collect(Collectors.toSet()));
        }
        
        if (user.getPersistentTokens() != null) {
            // Removing all tokens from the User instance that are not present
            // in the DTO
            
            entity.getPersistentTokens()
                    .removeIf(t -> !user.getPersistentTokens()
                            .stream()
                            .anyMatch(u -> Objects.equals(
                                    u.getSeries(),
                                    t.getSeries())));
        }
        
        this.repo.save(entity);
        this.searchRepo.save(entity);
        
        return true;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        Preconditions.checkNotNull(id);
        
        log.debug("Deleting user with id: {}", id);
        
        User user = this.repo.findOneById(id).orElse(null);
        
        if (user == null) {
            log.warn("Attempted to delete user with unknown id: {}", id);
            return false;
        }
        
        this.repo.delete(user);
        this.searchRepo.delete(user);
        
        return true;
    }

    @Override
    @Transactional
    public List<InternalUserDto> search(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(
                this.searchRepo.search(QueryBuilders.queryStringQuery(query))
                        .spliterator(),
                false)
                .map(this.mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean activate(String key) {
        Preconditions.checkNotNull(key);
        
        log.debug("Activating user with activation key: {}", key);
        
        User user = this.repo.findOneByActivationKey(key)
                .orElse(null);
        
        if (user == null) {
            log.warn("Attempted to activate user with unknown key: {}", key);
            return false;
        }
        
        user.setActivated(true);
        user.setActivationKey(null);
        
        this.repo.save(user);
        this.searchRepo.save(user);
        
        return true;
    }

    @Override
    @Transactional
    public boolean setPassword(Long id, String password) {
        Preconditions.checkNotNull(id);
        Preconditions.checkNotNull(password);
        
        log.debug("Updating password of user with id: {}", id);
        
        User user = this.repo.findOneById(id)
                .orElse(null);
        
        if (user == null) {
            log.warn("Attempted to update the password of a user with an "
                    + "unknown id: {}", id);
            
            return false;
        }
        
        user.setPassword(this.passwordEncoder.encode(password));
        
        this.repo.save(user);
        this.searchRepo.save(user);
        
        return true;
    }

    @Override
    @Transactional
    public boolean validatePassword(Long id, String password) {
        Preconditions.checkNotNull(id);
        Preconditions.checkNotNull(password);
        
        User user = this.repo.findOneById(id).orElse(null);
        
        if (user == null) {
            return false;
        }
        
        return this.passwordEncoder.matches(password, user.getPassword());
    }

    @Override
    @Transactional
    public boolean requestPasswordReset(String email) {
        Preconditions.checkNotNull(email);
        
        User user = this.repo.findOneByEmail(email)
                .orElse(null);
        
        if (user == null || !user.getActivated()) {
            return false;
        }
        
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now());
        
        this.repo.save(user);
        this.searchRepo.save(user);
        
        this.mailService.sendPasswordResetMail(user);
        
        return true;
    }

    @Override
    @Transactional
    public boolean resetPassword(String resetKey, String password) {
        Preconditions.checkNotNull(resetKey);
        Preconditions.checkNotNull(password);
        
        User user = this.repo.findOneByResetKey(resetKey)
                .orElse(null);
        
        if (user == null || user.getResetDate().isBefore(
                Instant.now().minus(1, ChronoUnit.DAYS))) {
            return false;
        }
        
        user.setPassword(this.passwordEncoder.encode(password));
        user.setResetKey(null);
        user.setResetDate(null);
        
        this.repo.save(user);
        this.searchRepo.save(user);
        
        return true;
    }
    
    @Transactional
    private boolean create(
            InternalUserDto dto,
            String password,
            boolean sendPasswordEmail) {
        User user = this.mapper.toEntity(dto);
        
        if (user.getId() != null) {
            return false;
        }
        
        user.setPassword(this.passwordEncoder.encode(password));
        
        boolean emailActivation = false;
        
        switch (this.appSettings.getAuthentication().getType()) {
            case CAS:
                user.setActivated(true);
                user.setActivationKey(null);
                break;
                
            case FORM:
                user.setActivated(false);
                user.setActivationKey(
                        RandomUtil.generateActivationKey());
                
                emailActivation = true;
                break;
                
            default:
                throw new UnsupportedOperationException(
                        "Unknown authentication type!");
        }
        
        if (user.getAuthorities() == null || user.getAuthorities().isEmpty()) {
            // Resolving the frontend authority that will be assigned to the
            // user by default.
            
            Authority authority = this.authorityRepo.findById(
                    AuthoritiesConstants.FRONTEND_USER).orElseThrow();
            
            user.setAuthorities(Collections.singleton(authority));
        }
        
        this.repo.save(user);
        this.searchRepo.save(user);
        
        dto.setId(user.getId());
        
        if (emailActivation) {
            this.mailService.sendActivationEmail(user);
        }
        
        if (sendPasswordEmail) {
            this.mailService.sendActivationPassword(user, password);
        }
        
        return true;
    }
    
    //
    // Cronjobs
    //
    
    @Scheduled(cron = "0 0 0 * * ?")
    public void removeOldPersistentTokens() {
        // Removing all persistent tokens a month after their creation.
        
        List<PersistentToken> tokens = this.tokenRepo.findByTokenDateBefore(
                LocalDate.now().minusMonths(1));
        
        for (PersistentToken token : tokens) {
            log.debug("Deleting token {}", token.getSeries());
            
            User user = token.getUser();
            user.getPersistentTokens().remove(token);
            this.tokenRepo.delete(token);
        }
    }
    
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        // Removing all users that have not been activated within three days.
        
        List<User> users =
                this.repo.findAllByActivatedIsFalseAndCreatedDateBefore(
                        Instant.now().minus(3, ChronoUnit.DAYS));
        
        for (User user : users) {
            log.debug("Deleting not activated user {}", user.getLogin());
            
            this.repo.delete(user);
            this.searchRepo.delete(user);
        }
    }
}
