package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.ReqCategory;
import org.appsec.securityRAT.repository.ReqCategoryRepository;
import org.appsec.securityRAT.repository.search.ReqCategorySearchRepository;

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
 * Test class for the ReqCategoryResource REST controller.
 *
 * @see ReqCategoryResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class ReqCategoryResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_SHORTCUT = "SAMPLE_TEXT";
    private static final String UPDATED_SHORTCUT = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private ReqCategoryRepository reqCategoryRepository;

    @Inject
    private ReqCategorySearchRepository reqCategorySearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restReqCategoryMockMvc;

    private ReqCategory reqCategory;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ReqCategoryResource reqCategoryResource = new ReqCategoryResource();
        ReflectionTestUtils.setField(reqCategoryResource, "reqCategoryRepository", reqCategoryRepository);
        ReflectionTestUtils.setField(reqCategoryResource, "reqCategorySearchRepository", reqCategorySearchRepository);
        this.restReqCategoryMockMvc = MockMvcBuilders.standaloneSetup(reqCategoryResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        reqCategory = new ReqCategory();
        reqCategory.setName(DEFAULT_NAME);
        reqCategory.setShortcut(DEFAULT_SHORTCUT);
        reqCategory.setDescription(DEFAULT_DESCRIPTION);
        reqCategory.setShowOrder(DEFAULT_SHOW_ORDER);
        reqCategory.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createReqCategory() throws Exception {
        int databaseSizeBeforeCreate = reqCategoryRepository.findAll().size();

        // Create the ReqCategory

        restReqCategoryMockMvc.perform(post("/api/reqCategorys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(reqCategory)))
                .andExpect(status().isCreated());

        // Validate the ReqCategory in the database
        List<ReqCategory> reqCategorys = reqCategoryRepository.findAll();
        assertThat(reqCategorys).hasSize(databaseSizeBeforeCreate + 1);
        ReqCategory testReqCategory = reqCategorys.get(reqCategorys.size() - 1);
        assertThat(testReqCategory.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testReqCategory.getShortcut()).isEqualTo(DEFAULT_SHORTCUT);
        assertThat(testReqCategory.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testReqCategory.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testReqCategory.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllReqCategorys() throws Exception {
        // Initialize the database
        reqCategoryRepository.saveAndFlush(reqCategory);

        // Get all the reqCategorys
        restReqCategoryMockMvc.perform(get("/api/reqCategorys"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(reqCategory.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].shortcut").value(hasItem(DEFAULT_SHORTCUT.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getReqCategory() throws Exception {
        // Initialize the database
        reqCategoryRepository.saveAndFlush(reqCategory);

        // Get the reqCategory
        restReqCategoryMockMvc.perform(get("/api/reqCategorys/{id}", reqCategory.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(reqCategory.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.shortcut").value(DEFAULT_SHORTCUT.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingReqCategory() throws Exception {
        // Get the reqCategory
        restReqCategoryMockMvc.perform(get("/api/reqCategorys/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateReqCategory() throws Exception {
        // Initialize the database
        reqCategoryRepository.saveAndFlush(reqCategory);

		int databaseSizeBeforeUpdate = reqCategoryRepository.findAll().size();

        // Update the reqCategory
        reqCategory.setName(UPDATED_NAME);
        reqCategory.setShortcut(UPDATED_SHORTCUT);
        reqCategory.setDescription(UPDATED_DESCRIPTION);
        reqCategory.setShowOrder(UPDATED_SHOW_ORDER);
        reqCategory.setActive(UPDATED_ACTIVE);


        restReqCategoryMockMvc.perform(put("/api/reqCategorys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(reqCategory)))
                .andExpect(status().isOk());

        // Validate the ReqCategory in the database
        List<ReqCategory> reqCategorys = reqCategoryRepository.findAll();
        assertThat(reqCategorys).hasSize(databaseSizeBeforeUpdate);
        ReqCategory testReqCategory = reqCategorys.get(reqCategorys.size() - 1);
        assertThat(testReqCategory.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testReqCategory.getShortcut()).isEqualTo(UPDATED_SHORTCUT);
        assertThat(testReqCategory.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testReqCategory.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testReqCategory.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteReqCategory() throws Exception {
        // Initialize the database
        reqCategoryRepository.saveAndFlush(reqCategory);

		int databaseSizeBeforeDelete = reqCategoryRepository.findAll().size();

        // Get the reqCategory
        restReqCategoryMockMvc.perform(delete("/api/reqCategorys/{id}", reqCategory.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<ReqCategory> reqCategorys = reqCategoryRepository.findAll();
        assertThat(reqCategorys).hasSize(databaseSizeBeforeDelete - 1);
    }
}
