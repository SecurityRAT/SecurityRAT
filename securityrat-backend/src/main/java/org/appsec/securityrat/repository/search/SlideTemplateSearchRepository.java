package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.SlideTemplate;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the SlideTemplate entity.
 */
public interface SlideTemplateSearchRepository extends ElasticsearchRepository<SlideTemplate, Long> {
}
