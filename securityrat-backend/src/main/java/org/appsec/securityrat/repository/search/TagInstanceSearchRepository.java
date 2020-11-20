package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.TagInstance;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TagInstance entity.
 */
public interface TagInstanceSearchRepository extends ElasticsearchRepository<TagInstance, Long> {
}
