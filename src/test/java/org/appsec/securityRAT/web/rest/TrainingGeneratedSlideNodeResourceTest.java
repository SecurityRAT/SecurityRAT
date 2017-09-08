package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.TrainingGeneratedSlideNode;
import org.appsec.securityRAT.repository.TrainingGeneratedSlideNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingGeneratedSlideNodeSearchRepository;

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
 * Test class for the TrainingGeneratedSlideNodeResource REST controller.
 *
 * @see TrainingGeneratedSlideNodeResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TrainingGeneratedSlideNodeResourceTest {


    @Inject
    private TrainingGeneratedSlideNodeRepository trainingGeneratedSlideNodeRepository;

    @Inject
    private TrainingGeneratedSlideNodeSearchRepository trainingGeneratedSlideNodeSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTrainingGeneratedSlideNodeMockMvc;

    private TrainingGeneratedSlideNode trainingGeneratedSlideNode;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TrainingGeneratedSlideNodeResource trainingGeneratedSlideNodeResource = new TrainingGeneratedSlideNodeResource();
        ReflectionTestUtils.setField(trainingGeneratedSlideNodeResource, "trainingGeneratedSlideNodeRepository", trainingGeneratedSlideNodeRepository);
        ReflectionTestUtils.setField(trainingGeneratedSlideNodeResource, "trainingGeneratedSlideNodeSearchRepository", trainingGeneratedSlideNodeSearchRepository);
        this.restTrainingGeneratedSlideNodeMockMvc = MockMvcBuilders.standaloneSetup(trainingGeneratedSlideNodeResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        trainingGeneratedSlideNode = new TrainingGeneratedSlideNode();
    }

    @Test
    @Transactional
    public void createTrainingGeneratedSlideNode() throws Exception {
        int databaseSizeBeforeCreate = trainingGeneratedSlideNodeRepository.findAll().size();

        // Create the TrainingGeneratedSlideNode

        restTrainingGeneratedSlideNodeMockMvc.perform(post("/api/trainingGeneratedSlideNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingGeneratedSlideNode)))
                .andExpect(status().isCreated());

        // Validate the TrainingGeneratedSlideNode in the database
        List<TrainingGeneratedSlideNode> trainingGeneratedSlideNodes = trainingGeneratedSlideNodeRepository.findAll();
        assertThat(trainingGeneratedSlideNodes).hasSize(databaseSizeBeforeCreate + 1);
        TrainingGeneratedSlideNode testTrainingGeneratedSlideNode = trainingGeneratedSlideNodes.get(trainingGeneratedSlideNodes.size() - 1);
    }

    @Test
    @Transactional
    public void getAllTrainingGeneratedSlideNodes() throws Exception {
        // Initialize the database
        trainingGeneratedSlideNodeRepository.saveAndFlush(trainingGeneratedSlideNode);

        // Get all the trainingGeneratedSlideNodes
        restTrainingGeneratedSlideNodeMockMvc.perform(get("/api/trainingGeneratedSlideNodes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(trainingGeneratedSlideNode.getId().intValue())));
    }

    @Test
    @Transactional
    public void getTrainingGeneratedSlideNode() throws Exception {
        // Initialize the database
        trainingGeneratedSlideNodeRepository.saveAndFlush(trainingGeneratedSlideNode);

        // Get the trainingGeneratedSlideNode
        restTrainingGeneratedSlideNodeMockMvc.perform(get("/api/trainingGeneratedSlideNodes/{id}", trainingGeneratedSlideNode.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(trainingGeneratedSlideNode.getId().intValue()));
    }

    @Test
    @Transactional
    public void getNonExistingTrainingGeneratedSlideNode() throws Exception {
        // Get the trainingGeneratedSlideNode
        restTrainingGeneratedSlideNodeMockMvc.perform(get("/api/trainingGeneratedSlideNodes/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTrainingGeneratedSlideNode() throws Exception {
        // Initialize the database
        trainingGeneratedSlideNodeRepository.saveAndFlush(trainingGeneratedSlideNode);

		int databaseSizeBeforeUpdate = trainingGeneratedSlideNodeRepository.findAll().size();

        // Update the trainingGeneratedSlideNode
        

        restTrainingGeneratedSlideNodeMockMvc.perform(put("/api/trainingGeneratedSlideNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingGeneratedSlideNode)))
                .andExpect(status().isOk());

        // Validate the TrainingGeneratedSlideNode in the database
        List<TrainingGeneratedSlideNode> trainingGeneratedSlideNodes = trainingGeneratedSlideNodeRepository.findAll();
        assertThat(trainingGeneratedSlideNodes).hasSize(databaseSizeBeforeUpdate);
        TrainingGeneratedSlideNode testTrainingGeneratedSlideNode = trainingGeneratedSlideNodes.get(trainingGeneratedSlideNodes.size() - 1);
    }

    @Test
    @Transactional
    public void deleteTrainingGeneratedSlideNode() throws Exception {
        // Initialize the database
        trainingGeneratedSlideNodeRepository.saveAndFlush(trainingGeneratedSlideNode);

		int databaseSizeBeforeDelete = trainingGeneratedSlideNodeRepository.findAll().size();

        // Get the trainingGeneratedSlideNode
        restTrainingGeneratedSlideNodeMockMvc.perform(delete("/api/trainingGeneratedSlideNodes/{id}", trainingGeneratedSlideNode.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<TrainingGeneratedSlideNode> trainingGeneratedSlideNodes = trainingGeneratedSlideNodeRepository.findAll();
        assertThat(trainingGeneratedSlideNodes).hasSize(databaseSizeBeforeDelete - 1);
    }
}
