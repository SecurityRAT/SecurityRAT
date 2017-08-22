package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.TrainingCustomSlideNode;
import org.appsec.securityRAT.repository.TrainingCustomSlideNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingCustomSlideNodeSearchRepository;

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
 * Test class for the TrainingCustomSlideNodeResource REST controller.
 *
 * @see TrainingCustomSlideNodeResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TrainingCustomSlideNodeResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_CONTENT = "SAMPLE_TEXT";
    private static final String UPDATED_CONTENT = "UPDATED_TEXT";

    private static final Integer DEFAULT_ANCHOR = 1;
    private static final Integer UPDATED_ANCHOR = 2;

    @Inject
    private TrainingCustomSlideNodeRepository trainingCustomSlideNodeRepository;

    @Inject
    private TrainingCustomSlideNodeSearchRepository trainingCustomSlideNodeSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTrainingCustomSlideNodeMockMvc;

    private TrainingCustomSlideNode trainingCustomSlideNode;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TrainingCustomSlideNodeResource trainingCustomSlideNodeResource = new TrainingCustomSlideNodeResource();
        ReflectionTestUtils.setField(trainingCustomSlideNodeResource, "trainingCustomSlideNodeRepository", trainingCustomSlideNodeRepository);
        ReflectionTestUtils.setField(trainingCustomSlideNodeResource, "trainingCustomSlideNodeSearchRepository", trainingCustomSlideNodeSearchRepository);
        this.restTrainingCustomSlideNodeMockMvc = MockMvcBuilders.standaloneSetup(trainingCustomSlideNodeResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        trainingCustomSlideNode = new TrainingCustomSlideNode();
        trainingCustomSlideNode.setName(DEFAULT_NAME);
        trainingCustomSlideNode.setContent(DEFAULT_CONTENT);
        trainingCustomSlideNode.setAnchor(DEFAULT_ANCHOR);
    }

    @Test
    @Transactional
    public void createTrainingCustomSlideNode() throws Exception {
        int databaseSizeBeforeCreate = trainingCustomSlideNodeRepository.findAll().size();

        // Create the TrainingCustomSlideNode

        restTrainingCustomSlideNodeMockMvc.perform(post("/api/trainingCustomSlideNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingCustomSlideNode)))
                .andExpect(status().isCreated());

        // Validate the TrainingCustomSlideNode in the database
        List<TrainingCustomSlideNode> trainingCustomSlideNodes = trainingCustomSlideNodeRepository.findAll();
        assertThat(trainingCustomSlideNodes).hasSize(databaseSizeBeforeCreate + 1);
        TrainingCustomSlideNode testTrainingCustomSlideNode = trainingCustomSlideNodes.get(trainingCustomSlideNodes.size() - 1);
        assertThat(testTrainingCustomSlideNode.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testTrainingCustomSlideNode.getContent()).isEqualTo(DEFAULT_CONTENT);
        assertThat(testTrainingCustomSlideNode.getAnchor()).isEqualTo(DEFAULT_ANCHOR);
    }

    @Test
    @Transactional
    public void getAllTrainingCustomSlideNodes() throws Exception {
        // Initialize the database
        trainingCustomSlideNodeRepository.saveAndFlush(trainingCustomSlideNode);

        // Get all the trainingCustomSlideNodes
        restTrainingCustomSlideNodeMockMvc.perform(get("/api/trainingCustomSlideNodes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(trainingCustomSlideNode.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT.toString())))
                .andExpect(jsonPath("$.[*].anchor").value(hasItem(DEFAULT_ANCHOR)));
    }

    @Test
    @Transactional
    public void getTrainingCustomSlideNode() throws Exception {
        // Initialize the database
        trainingCustomSlideNodeRepository.saveAndFlush(trainingCustomSlideNode);

        // Get the trainingCustomSlideNode
        restTrainingCustomSlideNodeMockMvc.perform(get("/api/trainingCustomSlideNodes/{id}", trainingCustomSlideNode.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(trainingCustomSlideNode.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT.toString()))
            .andExpect(jsonPath("$.anchor").value(DEFAULT_ANCHOR));
    }

    @Test
    @Transactional
    public void getNonExistingTrainingCustomSlideNode() throws Exception {
        // Get the trainingCustomSlideNode
        restTrainingCustomSlideNodeMockMvc.perform(get("/api/trainingCustomSlideNodes/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTrainingCustomSlideNode() throws Exception {
        // Initialize the database
        trainingCustomSlideNodeRepository.saveAndFlush(trainingCustomSlideNode);

		int databaseSizeBeforeUpdate = trainingCustomSlideNodeRepository.findAll().size();

        // Update the trainingCustomSlideNode
        trainingCustomSlideNode.setName(UPDATED_NAME);
        trainingCustomSlideNode.setContent(UPDATED_CONTENT);
        trainingCustomSlideNode.setAnchor(UPDATED_ANCHOR);
        

        restTrainingCustomSlideNodeMockMvc.perform(put("/api/trainingCustomSlideNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingCustomSlideNode)))
                .andExpect(status().isOk());

        // Validate the TrainingCustomSlideNode in the database
        List<TrainingCustomSlideNode> trainingCustomSlideNodes = trainingCustomSlideNodeRepository.findAll();
        assertThat(trainingCustomSlideNodes).hasSize(databaseSizeBeforeUpdate);
        TrainingCustomSlideNode testTrainingCustomSlideNode = trainingCustomSlideNodes.get(trainingCustomSlideNodes.size() - 1);
        assertThat(testTrainingCustomSlideNode.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTrainingCustomSlideNode.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testTrainingCustomSlideNode.getAnchor()).isEqualTo(UPDATED_ANCHOR);
    }

    @Test
    @Transactional
    public void deleteTrainingCustomSlideNode() throws Exception {
        // Initialize the database
        trainingCustomSlideNodeRepository.saveAndFlush(trainingCustomSlideNode);

		int databaseSizeBeforeDelete = trainingCustomSlideNodeRepository.findAll().size();

        // Get the trainingCustomSlideNode
        restTrainingCustomSlideNodeMockMvc.perform(delete("/api/trainingCustomSlideNodes/{id}", trainingCustomSlideNode.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<TrainingCustomSlideNode> trainingCustomSlideNodes = trainingCustomSlideNodeRepository.findAll();
        assertThat(trainingCustomSlideNodes).hasSize(databaseSizeBeforeDelete - 1);
    }
}
