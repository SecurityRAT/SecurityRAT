package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.OptColumnType;
import org.appsec.securityRAT.repository.OptColumnTypeRepository;
import org.appsec.securityRAT.repository.search.OptColumnTypeSearchRepository;

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
 * Test class for the OptColumnTypeResource REST controller.
 *
 * @see OptColumnTypeResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class OptColumnTypeResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    @Inject
    private OptColumnTypeRepository optColumnTypeRepository;

    @Inject
    private OptColumnTypeSearchRepository optColumnTypeSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restOptColumnTypeMockMvc;

    private OptColumnType optColumnType;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        OptColumnTypeResource optColumnTypeResource = new OptColumnTypeResource();
        ReflectionTestUtils.setField(optColumnTypeResource, "optColumnTypeRepository", optColumnTypeRepository);
        ReflectionTestUtils.setField(optColumnTypeResource, "optColumnTypeSearchRepository", optColumnTypeSearchRepository);
        this.restOptColumnTypeMockMvc = MockMvcBuilders.standaloneSetup(optColumnTypeResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        optColumnType = new OptColumnType();
        optColumnType.setName(DEFAULT_NAME);
        optColumnType.setDescription(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void createOptColumnType() throws Exception {
        int databaseSizeBeforeCreate = optColumnTypeRepository.findAll().size();

        // Create the OptColumnType

        restOptColumnTypeMockMvc.perform(post("/api/optColumnTypes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(optColumnType)))
                .andExpect(status().isCreated());

        // Validate the OptColumnType in the database
        List<OptColumnType> optColumnTypes = optColumnTypeRepository.findAll();
        assertThat(optColumnTypes).hasSize(databaseSizeBeforeCreate + 1);
        OptColumnType testOptColumnType = optColumnTypes.get(optColumnTypes.size() - 1);
        assertThat(testOptColumnType.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testOptColumnType.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void getAllOptColumnTypes() throws Exception {
        // Initialize the database
        optColumnTypeRepository.saveAndFlush(optColumnType);

        // Get all the optColumnTypes
        restOptColumnTypeMockMvc.perform(get("/api/optColumnTypes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(optColumnType.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }

    @Test
    @Transactional
    public void getOptColumnType() throws Exception {
        // Initialize the database
        optColumnTypeRepository.saveAndFlush(optColumnType);

        // Get the optColumnType
        restOptColumnTypeMockMvc.perform(get("/api/optColumnTypes/{id}", optColumnType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(optColumnType.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingOptColumnType() throws Exception {
        // Get the optColumnType
        restOptColumnTypeMockMvc.perform(get("/api/optColumnTypes/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateOptColumnType() throws Exception {
        // Initialize the database
        optColumnTypeRepository.saveAndFlush(optColumnType);

		int databaseSizeBeforeUpdate = optColumnTypeRepository.findAll().size();

        // Update the optColumnType
        optColumnType.setName(UPDATED_NAME);
        optColumnType.setDescription(UPDATED_DESCRIPTION);


        restOptColumnTypeMockMvc.perform(put("/api/optColumnTypes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(optColumnType)))
                .andExpect(status().isOk());

        // Validate the OptColumnType in the database
        List<OptColumnType> optColumnTypes = optColumnTypeRepository.findAll();
        assertThat(optColumnTypes).hasSize(databaseSizeBeforeUpdate);
        OptColumnType testOptColumnType = optColumnTypes.get(optColumnTypes.size() - 1);
        assertThat(testOptColumnType.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testOptColumnType.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    public void deleteOptColumnType() throws Exception {
        // Initialize the database
        optColumnTypeRepository.saveAndFlush(optColumnType);

		int databaseSizeBeforeDelete = optColumnTypeRepository.findAll().size();

        // Get the optColumnType
        restOptColumnTypeMockMvc.perform(delete("/api/optColumnTypes/{id}", optColumnType.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<OptColumnType> optColumnTypes = optColumnTypeRepository.findAll();
        assertThat(optColumnTypes).hasSize(databaseSizeBeforeDelete - 1);
    }
}
