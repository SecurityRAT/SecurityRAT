package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.Training;
import org.appsec.securityRAT.repository.TrainingRepository;
import org.appsec.securityRAT.repository.search.TrainingSearchRepository;

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
 * Test class for the TrainingResource REST controller.
 *
 * @see TrainingResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TrainingResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    @Inject
    private TrainingRepository trainingRepository;

    @Inject
    private TrainingSearchRepository trainingSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTrainingMockMvc;

    private Training training;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TrainingResource trainingResource = new TrainingResource();
        ReflectionTestUtils.setField(trainingResource, "trainingRepository", trainingRepository);
        ReflectionTestUtils.setField(trainingResource, "trainingSearchRepository", trainingSearchRepository);
        this.restTrainingMockMvc = MockMvcBuilders.standaloneSetup(trainingResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        training = new Training();
        training.setName(DEFAULT_NAME);
        training.setDescription(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void createTraining() throws Exception {
        int databaseSizeBeforeCreate = trainingRepository.findAll().size();

        // Create the Training

        restTrainingMockMvc.perform(post("/api/trainings")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(training)))
                .andExpect(status().isCreated());

        // Validate the Training in the database
        List<Training> trainings = trainingRepository.findAll();
        assertThat(trainings).hasSize(databaseSizeBeforeCreate + 1);
        Training testTraining = trainings.get(trainings.size() - 1);
        assertThat(testTraining.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testTraining.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void getAllTrainings() throws Exception {
        // Initialize the database
        trainingRepository.saveAndFlush(training);

        // Get all the trainings
        restTrainingMockMvc.perform(get("/api/trainings"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(training.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }

    @Test
    @Transactional
    public void getTraining() throws Exception {
        // Initialize the database
        trainingRepository.saveAndFlush(training);

        // Get the training
        restTrainingMockMvc.perform(get("/api/trainings/{id}", training.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(training.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingTraining() throws Exception {
        // Get the training
        restTrainingMockMvc.perform(get("/api/trainings/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTraining() throws Exception {
        // Initialize the database
        trainingRepository.saveAndFlush(training);

		int databaseSizeBeforeUpdate = trainingRepository.findAll().size();

        // Update the training
        training.setName(UPDATED_NAME);
        training.setDescription(UPDATED_DESCRIPTION);
        

        restTrainingMockMvc.perform(put("/api/trainings")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(training)))
                .andExpect(status().isOk());

        // Validate the Training in the database
        List<Training> trainings = trainingRepository.findAll();
        assertThat(trainings).hasSize(databaseSizeBeforeUpdate);
        Training testTraining = trainings.get(trainings.size() - 1);
        assertThat(testTraining.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTraining.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    public void deleteTraining() throws Exception {
        // Initialize the database
        trainingRepository.saveAndFlush(training);

		int databaseSizeBeforeDelete = trainingRepository.findAll().size();

        // Get the training
        restTrainingMockMvc.perform(delete("/api/trainings/{id}", training.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Training> trainings = trainingRepository.findAll();
        assertThat(trainings).hasSize(databaseSizeBeforeDelete - 1);
    }
}
