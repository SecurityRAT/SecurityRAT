package org.appsec.securityrat.repository;

import java.time.Instant;
import org.appsec.securityrat.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    String USERS_BY_LOGIN_CACHE = "usersByLogin";
    String USERS_BY_EMAIL_CACHE = "usersByEmail";

    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(Instant dateTime);

    Optional<User> findOneByResetKey(String resetKey);

    Optional<User> findOneByEmail(String email);

    Optional<User> findOneByLogin(String login);
    
    Optional<User> findOneById(Long id);
    
    @Query("select distinct user from User user left join fetch user.authorities")
    List<User> findAllRolesOfUsers();
    
    @Query("select distinct user from User user left join fetch user.authorities where user.id = :id ")
    Optional<User> findAllRolesOfUser(@Param("id") Long id);

    @Override
    void delete(User t);

}
