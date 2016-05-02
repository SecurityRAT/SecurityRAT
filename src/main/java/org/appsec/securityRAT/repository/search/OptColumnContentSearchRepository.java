package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.OptColumnContent;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the OptColumnContent entity.
 */
public interface OptColumnContentSearchRepository extends ElasticsearchRepository<OptColumnContent, Long> {
}
