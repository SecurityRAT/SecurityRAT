package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.RequirementSkeleton;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the RequirementSkeleton entity.
 */
public interface RequirementSkeletonSearchRepository extends ElasticsearchRepository<RequirementSkeleton, Long> {
}
