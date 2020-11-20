package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.AlternativeInstance;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the AlternativeInstance entity.
 */
public interface AlternativeInstanceSearchRepository extends ElasticsearchRepository<AlternativeInstance, Long> {
}
