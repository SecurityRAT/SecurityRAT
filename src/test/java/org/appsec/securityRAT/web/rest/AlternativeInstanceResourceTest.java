package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.AlternativeInstance;
import org.appsec.securityRAT.repository.AlternativeInstanceRepository;
import org.appsec.securityRAT.repository.search.AlternativeInstanceSearchRepository;

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
 * Test class for the AlternativeInstanceResource REST controller.
 *
 * @see AlternativeInstanceResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class AlternativeInstanceResourceTest {

    private static final String DEFAULT_CONTENT = "SAMPLE_TEXT";
    private static final String UPDATED_CONTENT = "UPDATED_TEXT";

    @Inject
    private AlternativeInstanceRepository alternativeInstanceRepository;

    @Inject
    private AlternativeInstanceSearchRepository alternativeInstanceSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restAlternativeInstanceMockMvc;

    private AlternativeInstance alternativeInstance;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        AlternativeInstanceResource alternativeInstanceResource = new AlternativeInstanceResource();
        ReflectionTestUtils.setField(alternativeInstanceResource, "alternativeInstanceRepository", alternativeInstanceRepository);
        ReflectionTestUtils.setField(alternativeInstanceResource, "alternativeInstanceSearchRepository", alternativeInstanceSearchRepository);
        this.restAlternativeInstanceMockMvc = MockMvcBuilders.standaloneSetup(alternativeInstanceResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        alternativeInstance = new AlternativeInstance();
        alternativeInstance.setContent(DEFAULT_CONTENT);
    }

    @Test
    @Transactional
    public void createAlternativeInstance() throws Exception {
        int databaseSizeBeforeCreate = alternativeInstanceRepository.findAll().size();

        // Create the AlternativeInstance

        restAlternativeInstanceMockMvc.perform(post("/api/alternativeInstances")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(alternativeInstance)))
                .andExpect(status().isCreated());

        // Validate the AlternativeInstance in the database
        List<AlternativeInstance> alternativeInstances = alternativeInstanceRepository.findAll();
        assertThat(alternativeInstances).hasSize(databaseSizeBeforeCreate + 1);
        AlternativeInstance testAlternativeInstance = alternativeInstances.get(alternativeInstances.size() - 1);
        assertThat(testAlternativeInstance.getContent()).isEqualTo(DEFAULT_CONTENT);
    }

    @Test
    @Transactional
    public void getAllAlternativeInstances() throws Exception {
        // Initialize the database
        alternativeInstanceRepository.saveAndFlush(alternativeInstance);

        // Get all the alternativeInstances
        restAlternativeInstanceMockMvc.perform(get("/api/alternativeInstances"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(alternativeInstance.getId().intValue())))
                .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT.toString())));
    }

    @Test
    @Transactional
    public void getAlternativeInstance() throws Exception {
        // Initialize the database
        alternativeInstanceRepository.saveAndFlush(alternativeInstance);

        // Get the alternativeInstance
        restAlternativeInstanceMockMvc.perform(get("/api/alternativeInstances/{id}", alternativeInstance.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(alternativeInstance.getId().intValue()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingAlternativeInstance() throws Exception {
        // Get the alternativeInstance
        restAlternativeInstanceMockMvc.perform(get("/api/alternativeInstances/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAlternativeInstance() throws Exception {
        // Initialize the database
        alternativeInstanceRepository.saveAndFlush(alternativeInstance);

		int databaseSizeBeforeUpdate = alternativeInstanceRepository.findAll().size();

        // Update the alternativeInstance
        alternativeInstance.setContent(UPDATED_CONTENT);


        restAlternativeInstanceMockMvc.perform(put("/api/alternativeInstances")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(alternativeInstance)))
                .andExpect(status().isOk());

        // Validate the AlternativeInstance in the database
        List<AlternativeInstance> alternativeInstances = alternativeInstanceRepository.findAll();
        assertThat(alternativeInstances).hasSize(databaseSizeBeforeUpdate);
        AlternativeInstance testAlternativeInstance = alternativeInstances.get(alternativeInstances.size() - 1);
        assertThat(testAlternativeInstance.getContent()).isEqualTo(UPDATED_CONTENT);
    }

    @Test
    @Transactional
    public void deleteAlternativeInstance() throws Exception {
        // Initialize the database
        alternativeInstanceRepository.saveAndFlush(alternativeInstance);

		int databaseSizeBeforeDelete = alternativeInstanceRepository.findAll().size();

        // Get the alternativeInstance
        restAlternativeInstanceMockMvc.perform(delete("/api/alternativeInstances/{id}", alternativeInstance.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<AlternativeInstance> alternativeInstances = alternativeInstanceRepository.findAll();
        assertThat(alternativeInstances).hasSize(databaseSizeBeforeDelete - 1);
    }
}
