package org.appsec.securityrat.api.test.mock;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.api.provider.advanced.UserManager;
import org.springframework.stereotype.Service;

@Service
public class UserManagerMock implements UserManager {
    @Override
    public InternalUserDto findByLogin(String login) {
        throw new UnsupportedOperationException();
    }

    @Override
    public InternalUserDto findByEmail(String email) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean create(InternalUserDto user) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean create(InternalUserDto user, String password) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean activate(String key) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean setPassword(Long id, String password) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean validatePassword(Long id, String password) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean requestPasswordReset(String email) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean resetPassword(String resetKey, String password) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean update(InternalUserDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean delete(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public InternalUserDto find(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<InternalUserDto> findAll() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<InternalUserDto> search(String query) {
        throw new UnsupportedOperationException();
    }
}
