package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.OptColumnType;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the OptColumnType entity.
 */
public interface OptColumnTypeSearchRepository extends ElasticsearchRepository<OptColumnType, Long> {
}
