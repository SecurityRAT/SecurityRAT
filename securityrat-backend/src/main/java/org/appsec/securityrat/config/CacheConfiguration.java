package org.appsec.securityrat.config;

import java.time.Duration;

import org.ehcache.config.builders.*;
import org.ehcache.jsr107.Eh107Configuration;

import org.hibernate.cache.jcache.ConfigSettings;
import io.github.jhipster.config.JHipsterProperties;

import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.*;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache = jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(Object.class, Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofSeconds(ehcache.getTimeToLiveSeconds())))
                .build());
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cacheManager) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cacheManager);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            createCache(cm, org.appsec.securityrat.repository.UserRepository.USERS_BY_LOGIN_CACHE);
            createCache(cm, org.appsec.securityrat.repository.UserRepository.USERS_BY_EMAIL_CACHE);
            createCache(cm, org.appsec.securityrat.domain.User.class.getName());
            createCache(cm, org.appsec.securityrat.domain.Authority.class.getName());
            createCache(cm, org.appsec.securityrat.domain.User.class.getName() + ".authorities");
            createCache(cm, org.appsec.securityrat.domain.PersistentToken.class.getName());
            createCache(cm, org.appsec.securityrat.domain.User.class.getName() + ".persistentTokens");
            createCache(cm, org.appsec.securityrat.domain.AlternativeInstance.class.getName());
            createCache(cm, org.appsec.securityrat.domain.AlternativeSet.class.getName());
            createCache(cm, org.appsec.securityrat.domain.AlternativeSet.class.getName() + ".alternativeInstances");
            createCache(cm, org.appsec.securityrat.domain.CollectionCategory.class.getName());
            createCache(cm, org.appsec.securityrat.domain.CollectionCategory.class.getName() + ".collectionInstances");
            createCache(cm, org.appsec.securityrat.domain.CollectionInstance.class.getName());
            createCache(cm, org.appsec.securityrat.domain.CollectionInstance.class.getName() + ".requirementSkeletons");
            createCache(cm, org.appsec.securityrat.domain.OptColumn.class.getName());
            createCache(cm, org.appsec.securityrat.domain.OptColumn.class.getName() + ".alternativeSets");
            createCache(cm, org.appsec.securityrat.domain.OptColumn.class.getName() + ".optColumnContents");
            createCache(cm, org.appsec.securityrat.domain.OptColumn.class.getName() + ".projectTypes");
            createCache(cm, org.appsec.securityrat.domain.OptColumnContent.class.getName());
            createCache(cm, org.appsec.securityrat.domain.OptColumnType.class.getName());
            createCache(cm, org.appsec.securityrat.domain.OptColumnType.class.getName() + ".optColumns");
            createCache(cm, org.appsec.securityrat.domain.ProjectType.class.getName());
            createCache(cm, org.appsec.securityrat.domain.ProjectType.class.getName() + ".statusColumns");
            createCache(cm, org.appsec.securityrat.domain.ProjectType.class.getName() + ".optColumns");
            createCache(cm, org.appsec.securityrat.domain.ProjectType.class.getName() + ".requirementSkeletons");
            createCache(cm, org.appsec.securityrat.domain.ReqCategory.class.getName());
            createCache(cm, org.appsec.securityrat.domain.ReqCategory.class.getName() + ".requirementSkeletons");
            createCache(cm, org.appsec.securityrat.domain.RequirementSkeleton.class.getName());
            createCache(cm, org.appsec.securityrat.domain.RequirementSkeleton.class.getName() + ".optColumnContents");
            createCache(cm, org.appsec.securityrat.domain.RequirementSkeleton.class.getName() + ".alternativeInstances");
            createCache(cm, org.appsec.securityrat.domain.RequirementSkeleton.class.getName() + ".tagInstances");
            createCache(cm, org.appsec.securityrat.domain.RequirementSkeleton.class.getName() + ".collectionInstances");
            createCache(cm, org.appsec.securityrat.domain.RequirementSkeleton.class.getName() + ".projectTypes");
            createCache(cm, org.appsec.securityrat.domain.SlideTemplate.class.getName());
            createCache(cm, org.appsec.securityrat.domain.StatusColumn.class.getName());
            createCache(cm, org.appsec.securityrat.domain.StatusColumn.class.getName() + ".statusColumnValues");
            createCache(cm, org.appsec.securityrat.domain.StatusColumn.class.getName() + ".projectTypes");
            createCache(cm, org.appsec.securityrat.domain.StatusColumnValue.class.getName());
            createCache(cm, org.appsec.securityrat.domain.TagCategory.class.getName());
            createCache(cm, org.appsec.securityrat.domain.TagCategory.class.getName() + ".tagInstances");
            createCache(cm, org.appsec.securityrat.domain.TagInstance.class.getName());
            createCache(cm, org.appsec.securityrat.domain.TagInstance.class.getName() + ".requirementSkeletons");
            createCache(cm, org.appsec.securityrat.domain.Training.class.getName());
            createCache(cm, org.appsec.securityrat.domain.Training.class.getName() + ".optColumns");
            createCache(cm, org.appsec.securityrat.domain.Training.class.getName() + ".collections");
            createCache(cm, org.appsec.securityrat.domain.Training.class.getName() + ".projectTypes");
            createCache(cm, org.appsec.securityrat.domain.TrainingBranchNode.class.getName());
            createCache(cm, org.appsec.securityrat.domain.TrainingCategoryNode.class.getName());
            createCache(cm, org.appsec.securityrat.domain.TrainingCustomSlideNode.class.getName());
            createCache(cm, org.appsec.securityrat.domain.TrainingGeneratedSlideNode.class.getName());
            createCache(cm, org.appsec.securityrat.domain.TrainingRequirementNode.class.getName());
            createCache(cm, org.appsec.securityrat.domain.TrainingTreeNode.class.getName());
            createCache(cm, org.appsec.securityrat.domain.ConfigConstant.class.getName());
            // jhipster-needle-ehcache-add-entry
        };
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache == null) {
            cm.createCache(cacheName, jcacheConfiguration);
        }
    }

}
