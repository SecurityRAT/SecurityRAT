package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.TrainingRequirementNode;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TrainingRequirementNode entity.
 */
public interface TrainingRequirementNodeSearchRepository extends ElasticsearchRepository<TrainingRequirementNode, Long> {
}
