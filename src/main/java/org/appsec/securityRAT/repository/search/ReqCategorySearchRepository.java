package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.ReqCategory;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the ReqCategory entity.
 */
public interface ReqCategorySearchRepository extends ElasticsearchRepository<ReqCategory, Long> {
}
