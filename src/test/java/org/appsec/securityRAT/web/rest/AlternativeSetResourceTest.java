package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.AlternativeSet;
import org.appsec.securityRAT.repository.AlternativeSetRepository;
import org.appsec.securityRAT.repository.search.AlternativeSetSearchRepository;

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
 * Test class for the AlternativeSetResource REST controller.
 *
 * @see AlternativeSetResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class AlternativeSetResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private AlternativeSetRepository alternativeSetRepository;

    @Inject
    private AlternativeSetSearchRepository alternativeSetSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restAlternativeSetMockMvc;

    private AlternativeSet alternativeSet;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        AlternativeSetResource alternativeSetResource = new AlternativeSetResource();
        ReflectionTestUtils.setField(alternativeSetResource, "alternativeSetRepository", alternativeSetRepository);
        ReflectionTestUtils.setField(alternativeSetResource, "alternativeSetSearchRepository", alternativeSetSearchRepository);
        this.restAlternativeSetMockMvc = MockMvcBuilders.standaloneSetup(alternativeSetResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        alternativeSet = new AlternativeSet();
        alternativeSet.setName(DEFAULT_NAME);
        alternativeSet.setDescription(DEFAULT_DESCRIPTION);
        alternativeSet.setShowOrder(DEFAULT_SHOW_ORDER);
        alternativeSet.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createAlternativeSet() throws Exception {
        int databaseSizeBeforeCreate = alternativeSetRepository.findAll().size();

        // Create the AlternativeSet

        restAlternativeSetMockMvc.perform(post("/api/alternativeSets")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(alternativeSet)))
                .andExpect(status().isCreated());

        // Validate the AlternativeSet in the database
        List<AlternativeSet> alternativeSets = alternativeSetRepository.findAll();
        assertThat(alternativeSets).hasSize(databaseSizeBeforeCreate + 1);
        AlternativeSet testAlternativeSet = alternativeSets.get(alternativeSets.size() - 1);
        assertThat(testAlternativeSet.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testAlternativeSet.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testAlternativeSet.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testAlternativeSet.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllAlternativeSets() throws Exception {
        // Initialize the database
        alternativeSetRepository.saveAndFlush(alternativeSet);

        // Get all the alternativeSets
        restAlternativeSetMockMvc.perform(get("/api/alternativeSets"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(alternativeSet.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getAlternativeSet() throws Exception {
        // Initialize the database
        alternativeSetRepository.saveAndFlush(alternativeSet);

        // Get the alternativeSet
        restAlternativeSetMockMvc.perform(get("/api/alternativeSets/{id}", alternativeSet.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(alternativeSet.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingAlternativeSet() throws Exception {
        // Get the alternativeSet
        restAlternativeSetMockMvc.perform(get("/api/alternativeSets/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAlternativeSet() throws Exception {
        // Initialize the database
        alternativeSetRepository.saveAndFlush(alternativeSet);

		int databaseSizeBeforeUpdate = alternativeSetRepository.findAll().size();

        // Update the alternativeSet
        alternativeSet.setName(UPDATED_NAME);
        alternativeSet.setDescription(UPDATED_DESCRIPTION);
        alternativeSet.setShowOrder(UPDATED_SHOW_ORDER);
        alternativeSet.setActive(UPDATED_ACTIVE);


        restAlternativeSetMockMvc.perform(put("/api/alternativeSets")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(alternativeSet)))
                .andExpect(status().isOk());

        // Validate the AlternativeSet in the database
        List<AlternativeSet> alternativeSets = alternativeSetRepository.findAll();
        assertThat(alternativeSets).hasSize(databaseSizeBeforeUpdate);
        AlternativeSet testAlternativeSet = alternativeSets.get(alternativeSets.size() - 1);
        assertThat(testAlternativeSet.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlternativeSet.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testAlternativeSet.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testAlternativeSet.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteAlternativeSet() throws Exception {
        // Initialize the database
        alternativeSetRepository.saveAndFlush(alternativeSet);

		int databaseSizeBeforeDelete = alternativeSetRepository.findAll().size();

        // Get the alternativeSet
        restAlternativeSetMockMvc.perform(delete("/api/alternativeSets/{id}", alternativeSet.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<AlternativeSet> alternativeSets = alternativeSetRepository.findAll();
        assertThat(alternativeSets).hasSize(databaseSizeBeforeDelete - 1);
    }
}
