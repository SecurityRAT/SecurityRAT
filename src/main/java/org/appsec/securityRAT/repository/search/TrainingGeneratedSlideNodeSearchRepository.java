package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.TrainingGeneratedSlideNode;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TrainingGeneratedSlideNode entity.
 */
public interface TrainingGeneratedSlideNodeSearchRepository extends ElasticsearchRepository<TrainingGeneratedSlideNode, Long> {
}
