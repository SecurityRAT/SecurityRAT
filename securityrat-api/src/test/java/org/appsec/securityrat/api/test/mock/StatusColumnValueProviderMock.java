package org.appsec.securityrat.api.test.mock;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.StatusColumnValueDto;
import org.appsec.securityrat.api.provider.advanced.StatusColumnValueProvider;
import org.springframework.stereotype.Service;

@Service
public class StatusColumnValueProviderMock
        implements StatusColumnValueProvider {

    @Override
    public Set<StatusColumnValueDto> findByStatusColumn(Long statusColumnId) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean create(StatusColumnValueDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean update(StatusColumnValueDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean delete(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public StatusColumnValueDto find(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<StatusColumnValueDto> findAll() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<StatusColumnValueDto> search(String query) {
        throw new UnsupportedOperationException();
    }
}
