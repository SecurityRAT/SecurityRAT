package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.AlternativeSet;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the AlternativeSet entity.
 */
public interface AlternativeSetSearchRepository extends ElasticsearchRepository<AlternativeSet, Long> {
}
