package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.ConfigConstant;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the configConstant entity.
 */
public interface ConfigConstantSearchRepository extends ElasticsearchRepository<ConfigConstant, Long> {
}
