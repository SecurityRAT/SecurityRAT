package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.TagInstance;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TagInstance entity.
 */
public interface TagInstanceSearchRepository extends ElasticsearchRepository<TagInstance, Long> {
}
