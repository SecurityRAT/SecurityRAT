package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.TrainingCustomSlideNode;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TrainingCustomSlideNode entity.
 */
public interface TrainingCustomSlideNodeSearchRepository extends ElasticsearchRepository<TrainingCustomSlideNode, Long> {
}
