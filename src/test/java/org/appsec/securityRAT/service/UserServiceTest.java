package org.appsec.securityRAT.service;

import java.util.List;
import java.util.Optional;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.PersistentToken;
import org.appsec.securityRAT.domain.User;
import org.appsec.securityRAT.repository.PersistentTokenRepository;
import org.appsec.securityRAT.repository.UserRepository;
import org.appsec.securityRAT.service.util.RandomUtil;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import javax.inject.Inject;
import static org.junit.Assert.*;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserService
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
@Transactional
public class UserServiceTest {

    @Inject
    private PersistentTokenRepository persistentTokenRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserService userService;

    @Test
    public void testRemoveOldPersistentTokens() {
        User admin = userRepository.findOneByLogin("admin").get();
        int existingCount = persistentTokenRepository.findByUser(admin).size();
        generateUserToken(admin, "1111-1111", new LocalDate());
        LocalDate now = new LocalDate();
        generateUserToken(admin, "2222-2222", now.minusDays(32));
        assertEquals(persistentTokenRepository.findByUser(admin).size(), existingCount + 2);
        userService.removeOldPersistentTokens();
        assertEquals(persistentTokenRepository.findByUser(admin).size(), existingCount + 1);
    }

    @Test
    public void assertThatUserMustExistToResetPassword() {

        Optional<User> maybeUser = userService.requestPasswordReset("john.doe@localhost");
        assertFalse(maybeUser.isPresent());

        maybeUser = userService.requestPasswordReset("admin@localhost");
        assertTrue(maybeUser.isPresent());

        assertEquals(maybeUser.get().getEmail(), "admin@localhost");
        assertNotNull(maybeUser.get().getResetDate());
        assertNotNull(maybeUser.get().getResetKey());

    }

    @Test
    public void assertThatOnlyActivatedUserCanRequestPasswordReset() {
        User user = userService.createUserInformation("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "en-US", null);
        Optional<User> maybeUser = userService.requestPasswordReset("john.doe@localhost");
        assertFalse(maybeUser.isPresent());
        userRepository.delete(user);
    }

    @Test
    public void assertThatResetKeyMustNotBeOlderThan24Hours() {

        User user = userService.createUserInformation("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "en-US", null);

        DateTime daysAgo = DateTime.now().minusHours(25);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);

        userRepository.save(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());

        assertFalse(maybeUser.isPresent());

        userRepository.delete(user);

    }

    @Test
    public void assertThatResetKeyMustBeValid() {

        User user = userService.createUserInformation("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "en-US", null);

        DateTime daysAgo = DateTime.now().minusHours(25);
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey("1234");

        userRepository.save(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());

        assertFalse(maybeUser.isPresent());

        userRepository.delete(user);

    }

    @Test
    public void assertThatUserCanResetPassword() {

        User user = userService.createUserInformation("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "en-US", null);

        String oldPassword = user.getPassword();

        DateTime daysAgo = DateTime.now().minusHours(2);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);

        userRepository.save(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());

        assertTrue(maybeUser.isPresent());
        assertNull(maybeUser.get().getResetDate());
        assertNull(maybeUser.get().getResetKey());
        assertNotEquals(maybeUser.get().getPassword(), oldPassword);

        userRepository.delete(user);

    }

    @Test
    public void testFindNotActivatedUsersByCreationDateBefore() {
        userService.removeNotActivatedUsers();
        DateTime now = new DateTime();
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
        assertEquals(users.size(), 0);
    }

    private void generateUserToken(User user, String tokenSeries, LocalDate localDate) {
        PersistentToken token = new PersistentToken();
        token.setSeries(tokenSeries);
        token.setUser(user);
        token.setTokenValue(tokenSeries + "-data");
        token.setTokenDate(localDate);
        token.setIpAddress("127.0.0.1");
        token.setUserAgent("Test agent");
        persistentTokenRepository.saveAndFlush(token);
    }
}
