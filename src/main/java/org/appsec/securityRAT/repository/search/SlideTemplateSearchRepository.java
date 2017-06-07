package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.SlideTemplate;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the SlideTemplate entity.
 */
public interface SlideTemplateSearchRepository extends ElasticsearchRepository<SlideTemplate, Long> {
}
