package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.TagCategory;
import org.appsec.securityRAT.repository.TagCategoryRepository;
import org.appsec.securityRAT.repository.search.TagCategorySearchRepository;

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
 * Test class for the TagCategoryResource REST controller.
 *
 * @see TagCategoryResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TagCategoryResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private TagCategoryRepository tagCategoryRepository;

    @Inject
    private TagCategorySearchRepository tagCategorySearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTagCategoryMockMvc;

    private TagCategory tagCategory;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TagCategoryResource tagCategoryResource = new TagCategoryResource();
        ReflectionTestUtils.setField(tagCategoryResource, "tagCategoryRepository", tagCategoryRepository);
        ReflectionTestUtils.setField(tagCategoryResource, "tagCategorySearchRepository", tagCategorySearchRepository);
        this.restTagCategoryMockMvc = MockMvcBuilders.standaloneSetup(tagCategoryResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        tagCategory = new TagCategory();
        tagCategory.setName(DEFAULT_NAME);
        tagCategory.setDescription(DEFAULT_DESCRIPTION);
        tagCategory.setShowOrder(DEFAULT_SHOW_ORDER);
        tagCategory.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createTagCategory() throws Exception {
        int databaseSizeBeforeCreate = tagCategoryRepository.findAll().size();

        // Create the TagCategory

        restTagCategoryMockMvc.perform(post("/api/tagCategorys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(tagCategory)))
                .andExpect(status().isCreated());

        // Validate the TagCategory in the database
        List<TagCategory> tagCategorys = tagCategoryRepository.findAll();
        assertThat(tagCategorys).hasSize(databaseSizeBeforeCreate + 1);
        TagCategory testTagCategory = tagCategorys.get(tagCategorys.size() - 1);
        assertThat(testTagCategory.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testTagCategory.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testTagCategory.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testTagCategory.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllTagCategorys() throws Exception {
        // Initialize the database
        tagCategoryRepository.saveAndFlush(tagCategory);

        // Get all the tagCategorys
        restTagCategoryMockMvc.perform(get("/api/tagCategorys"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(tagCategory.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getTagCategory() throws Exception {
        // Initialize the database
        tagCategoryRepository.saveAndFlush(tagCategory);

        // Get the tagCategory
        restTagCategoryMockMvc.perform(get("/api/tagCategorys/{id}", tagCategory.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(tagCategory.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingTagCategory() throws Exception {
        // Get the tagCategory
        restTagCategoryMockMvc.perform(get("/api/tagCategorys/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTagCategory() throws Exception {
        // Initialize the database
        tagCategoryRepository.saveAndFlush(tagCategory);

		int databaseSizeBeforeUpdate = tagCategoryRepository.findAll().size();

        // Update the tagCategory
        tagCategory.setName(UPDATED_NAME);
        tagCategory.setDescription(UPDATED_DESCRIPTION);
        tagCategory.setShowOrder(UPDATED_SHOW_ORDER);
        tagCategory.setActive(UPDATED_ACTIVE);


        restTagCategoryMockMvc.perform(put("/api/tagCategorys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(tagCategory)))
                .andExpect(status().isOk());

        // Validate the TagCategory in the database
        List<TagCategory> tagCategorys = tagCategoryRepository.findAll();
        assertThat(tagCategorys).hasSize(databaseSizeBeforeUpdate);
        TagCategory testTagCategory = tagCategorys.get(tagCategorys.size() - 1);
        assertThat(testTagCategory.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTagCategory.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testTagCategory.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testTagCategory.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteTagCategory() throws Exception {
        // Initialize the database
        tagCategoryRepository.saveAndFlush(tagCategory);

		int databaseSizeBeforeDelete = tagCategoryRepository.findAll().size();

        // Get the tagCategory
        restTagCategoryMockMvc.perform(delete("/api/tagCategorys/{id}", tagCategory.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<TagCategory> tagCategorys = tagCategoryRepository.findAll();
        assertThat(tagCategorys).hasSize(databaseSizeBeforeDelete - 1);
    }
}
