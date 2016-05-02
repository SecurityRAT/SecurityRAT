package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.CollectionCategory;
import org.appsec.securityRAT.repository.CollectionCategoryRepository;
import org.appsec.securityRAT.repository.search.CollectionCategorySearchRepository;

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
 * Test class for the CollectionCategoryResource REST controller.
 *
 * @see CollectionCategoryResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class CollectionCategoryResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private CollectionCategoryRepository collectionCategoryRepository;

    @Inject
    private CollectionCategorySearchRepository collectionCategorySearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restCollectionCategoryMockMvc;

    private CollectionCategory collectionCategory;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        CollectionCategoryResource collectionCategoryResource = new CollectionCategoryResource();
        ReflectionTestUtils.setField(collectionCategoryResource, "collectionCategoryRepository", collectionCategoryRepository);
        ReflectionTestUtils.setField(collectionCategoryResource, "collectionCategorySearchRepository", collectionCategorySearchRepository);
        this.restCollectionCategoryMockMvc = MockMvcBuilders.standaloneSetup(collectionCategoryResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        collectionCategory = new CollectionCategory();
        collectionCategory.setName(DEFAULT_NAME);
        collectionCategory.setDescription(DEFAULT_DESCRIPTION);
        collectionCategory.setShowOrder(DEFAULT_SHOW_ORDER);
        collectionCategory.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createCollectionCategory() throws Exception {
        int databaseSizeBeforeCreate = collectionCategoryRepository.findAll().size();

        // Create the CollectionCategory

        restCollectionCategoryMockMvc.perform(post("/api/collectionCategorys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(collectionCategory)))
                .andExpect(status().isCreated());

        // Validate the CollectionCategory in the database
        List<CollectionCategory> collectionCategorys = collectionCategoryRepository.findAll();
        assertThat(collectionCategorys).hasSize(databaseSizeBeforeCreate + 1);
        CollectionCategory testCollectionCategory = collectionCategorys.get(collectionCategorys.size() - 1);
        assertThat(testCollectionCategory.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testCollectionCategory.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testCollectionCategory.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testCollectionCategory.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllCollectionCategorys() throws Exception {
        // Initialize the database
        collectionCategoryRepository.saveAndFlush(collectionCategory);

        // Get all the collectionCategorys
        restCollectionCategoryMockMvc.perform(get("/api/collectionCategorys"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(collectionCategory.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getCollectionCategory() throws Exception {
        // Initialize the database
        collectionCategoryRepository.saveAndFlush(collectionCategory);

        // Get the collectionCategory
        restCollectionCategoryMockMvc.perform(get("/api/collectionCategorys/{id}", collectionCategory.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(collectionCategory.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingCollectionCategory() throws Exception {
        // Get the collectionCategory
        restCollectionCategoryMockMvc.perform(get("/api/collectionCategorys/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateCollectionCategory() throws Exception {
        // Initialize the database
        collectionCategoryRepository.saveAndFlush(collectionCategory);

		int databaseSizeBeforeUpdate = collectionCategoryRepository.findAll().size();

        // Update the collectionCategory
        collectionCategory.setName(UPDATED_NAME);
        collectionCategory.setDescription(UPDATED_DESCRIPTION);
        collectionCategory.setShowOrder(UPDATED_SHOW_ORDER);
        collectionCategory.setActive(UPDATED_ACTIVE);


        restCollectionCategoryMockMvc.perform(put("/api/collectionCategorys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(collectionCategory)))
                .andExpect(status().isOk());

        // Validate the CollectionCategory in the database
        List<CollectionCategory> collectionCategorys = collectionCategoryRepository.findAll();
        assertThat(collectionCategorys).hasSize(databaseSizeBeforeUpdate);
        CollectionCategory testCollectionCategory = collectionCategorys.get(collectionCategorys.size() - 1);
        assertThat(testCollectionCategory.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testCollectionCategory.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testCollectionCategory.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testCollectionCategory.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteCollectionCategory() throws Exception {
        // Initialize the database
        collectionCategoryRepository.saveAndFlush(collectionCategory);

		int databaseSizeBeforeDelete = collectionCategoryRepository.findAll().size();

        // Get the collectionCategory
        restCollectionCategoryMockMvc.perform(delete("/api/collectionCategorys/{id}", collectionCategory.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<CollectionCategory> collectionCategorys = collectionCategoryRepository.findAll();
        assertThat(collectionCategorys).hasSize(databaseSizeBeforeDelete - 1);
    }
}
