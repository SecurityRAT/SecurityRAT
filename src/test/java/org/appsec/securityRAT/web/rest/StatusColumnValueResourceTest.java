package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.StatusColumnValue;
import org.appsec.securityRAT.repository.StatusColumnValueRepository;
import org.appsec.securityRAT.repository.search.StatusColumnValueSearchRepository;

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
 * Test class for the StatusColumnValueResource REST controller.
 *
 * @see StatusColumnValueResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class StatusColumnValueResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private StatusColumnValueRepository statusColumnValueRepository;

    @Inject
    private StatusColumnValueSearchRepository statusColumnValueSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restStatusColumnValueMockMvc;

    private StatusColumnValue statusColumnValue;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        StatusColumnValueResource statusColumnValueResource = new StatusColumnValueResource();
        ReflectionTestUtils.setField(statusColumnValueResource, "statusColumnValueRepository", statusColumnValueRepository);
        ReflectionTestUtils.setField(statusColumnValueResource, "statusColumnValueSearchRepository", statusColumnValueSearchRepository);
        this.restStatusColumnValueMockMvc = MockMvcBuilders.standaloneSetup(statusColumnValueResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        statusColumnValue = new StatusColumnValue();
        statusColumnValue.setName(DEFAULT_NAME);
        statusColumnValue.setDescription(DEFAULT_DESCRIPTION);
        statusColumnValue.setShowOrder(DEFAULT_SHOW_ORDER);
        statusColumnValue.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createStatusColumnValue() throws Exception {
        int databaseSizeBeforeCreate = statusColumnValueRepository.findAll().size();

        // Create the StatusColumnValue

        restStatusColumnValueMockMvc.perform(post("/api/statusColumnValues")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(statusColumnValue)))
                .andExpect(status().isCreated());

        // Validate the StatusColumnValue in the database
        List<StatusColumnValue> statusColumnValues = statusColumnValueRepository.findAll();
        assertThat(statusColumnValues).hasSize(databaseSizeBeforeCreate + 1);
        StatusColumnValue testStatusColumnValue = statusColumnValues.get(statusColumnValues.size() - 1);
        assertThat(testStatusColumnValue.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testStatusColumnValue.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testStatusColumnValue.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testStatusColumnValue.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllStatusColumnValues() throws Exception {
        // Initialize the database
        statusColumnValueRepository.saveAndFlush(statusColumnValue);

        // Get all the statusColumnValues
        restStatusColumnValueMockMvc.perform(get("/api/statusColumnValues"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(statusColumnValue.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getStatusColumnValue() throws Exception {
        // Initialize the database
        statusColumnValueRepository.saveAndFlush(statusColumnValue);

        // Get the statusColumnValue
        restStatusColumnValueMockMvc.perform(get("/api/statusColumnValues/{id}", statusColumnValue.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(statusColumnValue.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingStatusColumnValue() throws Exception {
        // Get the statusColumnValue
        restStatusColumnValueMockMvc.perform(get("/api/statusColumnValues/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateStatusColumnValue() throws Exception {
        // Initialize the database
        statusColumnValueRepository.saveAndFlush(statusColumnValue);

		int databaseSizeBeforeUpdate = statusColumnValueRepository.findAll().size();

        // Update the statusColumnValue
        statusColumnValue.setName(UPDATED_NAME);
        statusColumnValue.setDescription(UPDATED_DESCRIPTION);
        statusColumnValue.setShowOrder(UPDATED_SHOW_ORDER);
        statusColumnValue.setActive(UPDATED_ACTIVE);


        restStatusColumnValueMockMvc.perform(put("/api/statusColumnValues")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(statusColumnValue)))
                .andExpect(status().isOk());

        // Validate the StatusColumnValue in the database
        List<StatusColumnValue> statusColumnValues = statusColumnValueRepository.findAll();
        assertThat(statusColumnValues).hasSize(databaseSizeBeforeUpdate);
        StatusColumnValue testStatusColumnValue = statusColumnValues.get(statusColumnValues.size() - 1);
        assertThat(testStatusColumnValue.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testStatusColumnValue.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testStatusColumnValue.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testStatusColumnValue.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteStatusColumnValue() throws Exception {
        // Initialize the database
        statusColumnValueRepository.saveAndFlush(statusColumnValue);

		int databaseSizeBeforeDelete = statusColumnValueRepository.findAll().size();

        // Get the statusColumnValue
        restStatusColumnValueMockMvc.perform(delete("/api/statusColumnValues/{id}", statusColumnValue.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<StatusColumnValue> statusColumnValues = statusColumnValueRepository.findAll();
        assertThat(statusColumnValues).hasSize(databaseSizeBeforeDelete - 1);
    }
}
