package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.StatusColumnValue;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the StatusColumnValue entity.
 */
public interface StatusColumnValueSearchRepository extends ElasticsearchRepository<StatusColumnValue, Long> {
}
