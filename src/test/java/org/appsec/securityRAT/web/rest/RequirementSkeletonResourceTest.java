package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.RequirementSkeleton;
import org.appsec.securityRAT.repository.RequirementSkeletonRepository;
import org.appsec.securityRAT.repository.search.RequirementSkeletonSearchRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.hamcrest.Matchers.hasItem;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


/**
 * Test class for the RequirementSkeletonResource REST controller.
 *
 * @see RequirementSkeletonResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class RequirementSkeletonResourceTest {

    private static final String DEFAULT_UNIVERSAL_ID = "SAMPLE_TEXT";
    private static final String UPDATED_UNIVERSAL_ID = "UPDATED_TEXT";
    private static final String DEFAULT_SHORT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_SHORT_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private RequirementSkeletonRepository requirementSkeletonRepository;

    @Inject
    private RequirementSkeletonSearchRepository requirementSkeletonSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restRequirementSkeletonMockMvc;

    private RequirementSkeleton requirementSkeleton;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        RequirementSkeletonResource requirementSkeletonResource = new RequirementSkeletonResource();
        ReflectionTestUtils.setField(requirementSkeletonResource, "requirementSkeletonRepository", requirementSkeletonRepository);
        ReflectionTestUtils.setField(requirementSkeletonResource, "requirementSkeletonSearchRepository", requirementSkeletonSearchRepository);
        this.restRequirementSkeletonMockMvc = MockMvcBuilders.standaloneSetup(requirementSkeletonResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        requirementSkeleton = new RequirementSkeleton();
        requirementSkeleton.setUniversalId(DEFAULT_UNIVERSAL_ID);
        requirementSkeleton.setShortName(DEFAULT_SHORT_NAME);
        requirementSkeleton.setDescription(DEFAULT_DESCRIPTION);
        requirementSkeleton.setShowOrder(DEFAULT_SHOW_ORDER);
        requirementSkeleton.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createRequirementSkeleton() throws Exception {
        int databaseSizeBeforeCreate = requirementSkeletonRepository.findAll().size();

        // Create the RequirementSkeleton

        restRequirementSkeletonMockMvc.perform(post("/api/requirementSkeletons")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(requirementSkeleton)))
                .andExpect(status().isCreated());

        // Validate the RequirementSkeleton in the database
        List<RequirementSkeleton> requirementSkeletons = requirementSkeletonRepository.findAll();
        assertThat(requirementSkeletons).hasSize(databaseSizeBeforeCreate + 1);
        RequirementSkeleton testRequirementSkeleton = requirementSkeletons.get(requirementSkeletons.size() - 1);
        assertThat(testRequirementSkeleton.getUniversalId()).isEqualTo(DEFAULT_UNIVERSAL_ID);
        assertThat(testRequirementSkeleton.getShortName()).isEqualTo(DEFAULT_SHORT_NAME);
        assertThat(testRequirementSkeleton.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testRequirementSkeleton.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testRequirementSkeleton.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllRequirementSkeletons() throws Exception {
        // Initialize the database
        requirementSkeletonRepository.saveAndFlush(requirementSkeleton);

        // Get all the requirementSkeletons
        restRequirementSkeletonMockMvc.perform(get("/api/requirementSkeletons"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(requirementSkeleton.getId().intValue())))
                .andExpect(jsonPath("$.[*].universalId").value(hasItem(DEFAULT_UNIVERSAL_ID.toString())))
                .andExpect(jsonPath("$.[*].shortName").value(hasItem(DEFAULT_SHORT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getRequirementSkeleton() throws Exception {
        // Initialize the database
        requirementSkeletonRepository.saveAndFlush(requirementSkeleton);

        // Get the requirementSkeleton
        restRequirementSkeletonMockMvc.perform(get("/api/requirementSkeletons/{id}", requirementSkeleton.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(requirementSkeleton.getId().intValue()))
            .andExpect(jsonPath("$.universalId").value(DEFAULT_UNIVERSAL_ID.toString()))
            .andExpect(jsonPath("$.shortName").value(DEFAULT_SHORT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingRequirementSkeleton() throws Exception {
        // Get the requirementSkeleton
        restRequirementSkeletonMockMvc.perform(get("/api/requirementSkeletons/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateRequirementSkeleton() throws Exception {
        // Initialize the database
        requirementSkeletonRepository.saveAndFlush(requirementSkeleton);

		int databaseSizeBeforeUpdate = requirementSkeletonRepository.findAll().size();

        // Update the requirementSkeleton
        requirementSkeleton.setUniversalId(UPDATED_UNIVERSAL_ID);
        requirementSkeleton.setShortName(UPDATED_SHORT_NAME);
        requirementSkeleton.setDescription(UPDATED_DESCRIPTION);
        requirementSkeleton.setShowOrder(UPDATED_SHOW_ORDER);
        requirementSkeleton.setActive(UPDATED_ACTIVE);


        restRequirementSkeletonMockMvc.perform(put("/api/requirementSkeletons")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(requirementSkeleton)))
                .andExpect(status().isOk());

        // Validate the RequirementSkeleton in the database
        List<RequirementSkeleton> requirementSkeletons = requirementSkeletonRepository.findAll();
        assertThat(requirementSkeletons).hasSize(databaseSizeBeforeUpdate);
        RequirementSkeleton testRequirementSkeleton = requirementSkeletons.get(requirementSkeletons.size() - 1);
        assertThat(testRequirementSkeleton.getUniversalId()).isEqualTo(UPDATED_UNIVERSAL_ID);
        assertThat(testRequirementSkeleton.getShortName()).isEqualTo(UPDATED_SHORT_NAME);
        assertThat(testRequirementSkeleton.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testRequirementSkeleton.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testRequirementSkeleton.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteRequirementSkeleton() throws Exception {
        // Initialize the database
        requirementSkeletonRepository.saveAndFlush(requirementSkeleton);

		int databaseSizeBeforeDelete = requirementSkeletonRepository.findAll().size();

        // Get the requirementSkeleton
        restRequirementSkeletonMockMvc.perform(delete("/api/requirementSkeletons/{id}", requirementSkeleton.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<RequirementSkeleton> requirementSkeletons = requirementSkeletonRepository.findAll();
        assertThat(requirementSkeletons).hasSize(databaseSizeBeforeDelete - 1);
    }
}
