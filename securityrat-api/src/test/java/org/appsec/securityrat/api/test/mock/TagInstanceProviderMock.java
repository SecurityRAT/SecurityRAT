package org.appsec.securityrat.api.test.mock;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.TagInstanceDto;
import org.appsec.securityrat.api.provider.advanced.TagInstanceProvider;
import org.springframework.stereotype.Service;

@Service
public class TagInstanceProviderMock implements TagInstanceProvider {
    @Override
    public Set<TagInstanceDto> findByCategoryId(Long tagCategoryId) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean create(TagInstanceDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean update(TagInstanceDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean delete(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public TagInstanceDto find(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<TagInstanceDto> findAll() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<TagInstanceDto> search(String query) {
        throw new UnsupportedOperationException();
    }
}
