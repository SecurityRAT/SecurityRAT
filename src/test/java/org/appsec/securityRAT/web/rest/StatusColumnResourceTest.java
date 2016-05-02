package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.StatusColumn;
import org.appsec.securityRAT.repository.StatusColumnRepository;
import org.appsec.securityRAT.repository.search.StatusColumnSearchRepository;

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
 * Test class for the StatusColumnResource REST controller.
 *
 * @see StatusColumnResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class StatusColumnResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Boolean DEFAULT_IS_ENUM = false;
    private static final Boolean UPDATED_IS_ENUM = true;

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private StatusColumnRepository statusColumnRepository;

    @Inject
    private StatusColumnSearchRepository statusColumnSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restStatusColumnMockMvc;

    private StatusColumn statusColumn;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        StatusColumnResource statusColumnResource = new StatusColumnResource();
        ReflectionTestUtils.setField(statusColumnResource, "statusColumnRepository", statusColumnRepository);
        ReflectionTestUtils.setField(statusColumnResource, "statusColumnSearchRepository", statusColumnSearchRepository);
        this.restStatusColumnMockMvc = MockMvcBuilders.standaloneSetup(statusColumnResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        statusColumn = new StatusColumn();
        statusColumn.setName(DEFAULT_NAME);
        statusColumn.setDescription(DEFAULT_DESCRIPTION);
        statusColumn.setIsEnum(DEFAULT_IS_ENUM);
        statusColumn.setShowOrder(DEFAULT_SHOW_ORDER);
        statusColumn.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createStatusColumn() throws Exception {
        int databaseSizeBeforeCreate = statusColumnRepository.findAll().size();

        // Create the StatusColumn

        restStatusColumnMockMvc.perform(post("/api/statusColumns")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(statusColumn)))
                .andExpect(status().isCreated());

        // Validate the StatusColumn in the database
        List<StatusColumn> statusColumns = statusColumnRepository.findAll();
        assertThat(statusColumns).hasSize(databaseSizeBeforeCreate + 1);
        StatusColumn testStatusColumn = statusColumns.get(statusColumns.size() - 1);
        assertThat(testStatusColumn.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testStatusColumn.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testStatusColumn.getIsEnum()).isEqualTo(DEFAULT_IS_ENUM);
        assertThat(testStatusColumn.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testStatusColumn.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllStatusColumns() throws Exception {
        // Initialize the database
        statusColumnRepository.saveAndFlush(statusColumn);

        // Get all the statusColumns
        restStatusColumnMockMvc.perform(get("/api/statusColumns"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(statusColumn.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].isEnum").value(hasItem(DEFAULT_IS_ENUM.booleanValue())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getStatusColumn() throws Exception {
        // Initialize the database
        statusColumnRepository.saveAndFlush(statusColumn);

        // Get the statusColumn
        restStatusColumnMockMvc.perform(get("/api/statusColumns/{id}", statusColumn.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(statusColumn.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.isEnum").value(DEFAULT_IS_ENUM.booleanValue()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingStatusColumn() throws Exception {
        // Get the statusColumn
        restStatusColumnMockMvc.perform(get("/api/statusColumns/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateStatusColumn() throws Exception {
        // Initialize the database
        statusColumnRepository.saveAndFlush(statusColumn);

		int databaseSizeBeforeUpdate = statusColumnRepository.findAll().size();

        // Update the statusColumn
        statusColumn.setName(UPDATED_NAME);
        statusColumn.setDescription(UPDATED_DESCRIPTION);
        statusColumn.setIsEnum(UPDATED_IS_ENUM);
        statusColumn.setShowOrder(UPDATED_SHOW_ORDER);
        statusColumn.setActive(UPDATED_ACTIVE);


        restStatusColumnMockMvc.perform(put("/api/statusColumns")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(statusColumn)))
                .andExpect(status().isOk());

        // Validate the StatusColumn in the database
        List<StatusColumn> statusColumns = statusColumnRepository.findAll();
        assertThat(statusColumns).hasSize(databaseSizeBeforeUpdate);
        StatusColumn testStatusColumn = statusColumns.get(statusColumns.size() - 1);
        assertThat(testStatusColumn.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testStatusColumn.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testStatusColumn.getIsEnum()).isEqualTo(UPDATED_IS_ENUM);
        assertThat(testStatusColumn.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testStatusColumn.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteStatusColumn() throws Exception {
        // Initialize the database
        statusColumnRepository.saveAndFlush(statusColumn);

		int databaseSizeBeforeDelete = statusColumnRepository.findAll().size();

        // Get the statusColumn
        restStatusColumnMockMvc.perform(delete("/api/statusColumns/{id}", statusColumn.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<StatusColumn> statusColumns = statusColumnRepository.findAll();
        assertThat(statusColumns).hasSize(databaseSizeBeforeDelete - 1);
    }
}
