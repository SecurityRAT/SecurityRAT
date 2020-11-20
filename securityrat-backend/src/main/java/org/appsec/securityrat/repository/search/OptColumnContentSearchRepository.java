package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.OptColumnContent;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the OptColumnContent entity.
 */
public interface OptColumnContentSearchRepository extends ElasticsearchRepository<OptColumnContent, Long> {
}
