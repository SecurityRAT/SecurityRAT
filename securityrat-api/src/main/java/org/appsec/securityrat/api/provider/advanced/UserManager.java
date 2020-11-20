package org.appsec.securityrat.api.provider.advanced;

import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.api.provider.IdentifiableProvider;

/**
 * General management of the users.
 */
public interface UserManager
        extends IdentifiableProvider<Long, InternalUserDto> {
    
    /**
     * Find a user by its login/username.
     * 
     * @param login The username of the user.
     * 
     * @return Either the instance of the corresponding user or
     *         <code>null</code>, if there is no such user.
     */
    InternalUserDto findByLogin(String login);
    
    /**
     * Find a user by its email address.
     * 
     * @param email The email address of the user.
     * 
     * @return Either the instance of the corresponding user or
     *         <code>null</code>, if there is no such user.
     */
    InternalUserDto findByEmail(String email);
    
    /**
     * Creates the user.
     * 
     * An initial password will be generated and assigned dynamically and sent
     * to the user, if required.
     * 
     * @param user The user that will be created.
     * 
     * @return Either <code>true</code>, if the operation succeeded, otherwise
     *         <code>false</code>.
     */
    @Override
    boolean create(InternalUserDto user);
    
    /**
     * Creates the user.
     * 
     * @param user The user that will be created.
     * @param password The password for the user.
     * 
     * @return Either <code>true</code>, if the operation succeeded, otherwise
     *         <code>false</code>.
     */
    boolean create(InternalUserDto user, String password);
    
    /**
     * Activates the associated user account.
     * 
     * @param key The activation key.
     * 
     * @return Either <code>true</code>, if the specified <code>key</code> was
     *         associated with a not activated user account.
     */
    boolean activate(String key);
    
    /**
     * Sets a new password for the user that is associated with the specified
     * unique <code>id</code>.
     * 
     * @param id The unique identifier of the user.
     * @param password The new password as plain text.
     * 
     * @return Either <code>true</code>, if setting a new password succeeded,
     *         otherwise <code>false</code>.
     */
    boolean setPassword(Long id, String password);
    
    /**
     * Validates whether the specified <code>password</code> matches the one of
     * the user associated with specified unique <code>id</code>.
     * 
     * @param id The unique identifier of the user.
     * @param password The plain text password that is validated.
     * 
     * @return Either <code>true</code>, if the passwords match, otherwise
     *         <code>false</code>.
     */
    boolean validatePassword(Long id, String password);
    
    /**
     * Requests resetting the password for the user that is associated with the
     * specified <code>email</code>.
     * 
     * @param email The associated email.
     * 
     * @return Either <code>true</code>, if requesting the password succeeded,
     *         otherwise <code>false</code>.
     */
    boolean requestPasswordReset(String email);
    
    /**
     * Resets the password of a user by using a reset key.
     * 
     * @param resetKey The reset key that is associated to a user.
     * @param password The new password as plain text.
     * 
     * @return Either <code>true</code>, if the password has been updated,
     *         otherwise <code>false</code>.
     */
    boolean resetPassword(String resetKey, String password);
}
