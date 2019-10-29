package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.OptColumn;
import org.appsec.securityRAT.repository.OptColumnRepository;
import org.appsec.securityRAT.repository.search.OptColumnSearchRepository;

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
 * Test class for the OptColumnResource REST controller.
 *
 * @see OptColumnResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class OptColumnResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final Boolean DEFAULT_ISVISIBLEBYDEFAULT = true;
    private static final Boolean UPDATED_ISVISIBLEBYDEFAULT = false;

    @Inject
    private OptColumnRepository optColumnRepository;

    @Inject
    private OptColumnSearchRepository optColumnSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restOptColumnMockMvc;

    private OptColumn optColumn;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        OptColumnResource optColumnResource = new OptColumnResource();
        ReflectionTestUtils.setField(optColumnResource, "optColumnRepository", optColumnRepository);
        ReflectionTestUtils.setField(optColumnResource, "optColumnSearchRepository", optColumnSearchRepository);
        this.restOptColumnMockMvc = MockMvcBuilders.standaloneSetup(optColumnResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        optColumn = new OptColumn();
        optColumn.setName(DEFAULT_NAME);
        optColumn.setDescription(DEFAULT_DESCRIPTION);
        optColumn.setShowOrder(DEFAULT_SHOW_ORDER);
        optColumn.setActive(DEFAULT_ACTIVE);
        optColumn.setIsVisibleByDefault(DEFAULT_ISVISIBLEBYDEFAULT);
    }

    @Test
    @Transactional
    public void createOptColumn() throws Exception {
        int databaseSizeBeforeCreate = optColumnRepository.findAll().size();

        // Create the OptColumn

        restOptColumnMockMvc.perform(post("/api/optColumns")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(optColumn)))
                .andExpect(status().isCreated());

        // Validate the OptColumn in the database
        List<OptColumn> optColumns = optColumnRepository.findAll();
        assertThat(optColumns).hasSize(databaseSizeBeforeCreate + 1);
        OptColumn testOptColumn = optColumns.get(optColumns.size() - 1);
        assertThat(testOptColumn.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testOptColumn.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testOptColumn.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testOptColumn.getActive()).isEqualTo(DEFAULT_ACTIVE);
        assertThat(testOptColumn.getIsVisibleByDefault()).isEqualTo(DEFAULT_ISVISIBLEBYDEFAULT);
    }

    @Test
    @Transactional
    public void getAllOptColumns() throws Exception {
        // Initialize the database
        optColumnRepository.saveAndFlush(optColumn);

        // Get all the optColumns
        restOptColumnMockMvc.perform(get("/api/optColumns"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(optColumn.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())))
                .andExpect(jsonPath("$.[*].isVisibleByDefault").value(hasItem(DEFAULT_ISVISIBLEBYDEFAULT.booleanValue())));
    }

    @Test
    @Transactional
    public void getOptColumn() throws Exception {
        // Initialize the database
        optColumnRepository.saveAndFlush(optColumn);

        // Get the optColumn
        restOptColumnMockMvc.perform(get("/api/optColumns/{id}", optColumn.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(optColumn.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()))
            .andExpect(jsonPath("$.[*].isVisibleByDefault").value(DEFAULT_ISVISIBLEBYDEFAULT.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingOptColumn() throws Exception {
        // Get the optColumn
        restOptColumnMockMvc.perform(get("/api/optColumns/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateOptColumn() throws Exception {
        // Initialize the database
        optColumnRepository.saveAndFlush(optColumn);

		int databaseSizeBeforeUpdate = optColumnRepository.findAll().size();

        // Update the optColumn
        optColumn.setName(UPDATED_NAME);
        optColumn.setDescription(UPDATED_DESCRIPTION);
        optColumn.setShowOrder(UPDATED_SHOW_ORDER);
        optColumn.setActive(UPDATED_ACTIVE);
        optColumn.setIsVisibleByDefault(UPDATED_ISVISIBLEBYDEFAULT);


        restOptColumnMockMvc.perform(put("/api/optColumns")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(optColumn)))
                .andExpect(status().isOk());

        // Validate the OptColumn in the database
        List<OptColumn> optColumns = optColumnRepository.findAll();
        assertThat(optColumns).hasSize(databaseSizeBeforeUpdate);
        OptColumn testOptColumn = optColumns.get(optColumns.size() - 1);
        assertThat(testOptColumn.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testOptColumn.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testOptColumn.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testOptColumn.getActive()).isEqualTo(UPDATED_ACTIVE);
        assertThat(testOptColumn.getIsVisibleByDefault()).isEqualTo(UPDATED_ISVISIBLEBYDEFAULT);
    }

    @Test
    @Transactional
    public void deleteOptColumn() throws Exception {
        // Initialize the database
        optColumnRepository.saveAndFlush(optColumn);

		int databaseSizeBeforeDelete = optColumnRepository.findAll().size();

        // Get the optColumn
        restOptColumnMockMvc.perform(delete("/api/optColumns/{id}", optColumn.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<OptColumn> optColumns = optColumnRepository.findAll();
        assertThat(optColumns).hasSize(databaseSizeBeforeDelete - 1);
    }
}
