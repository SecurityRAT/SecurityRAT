package org.appsec.securityrat.api.provider;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.training.TrainingBranchNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingCategoryNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingCustomSlideNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingGeneratedSlideNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingRequirementNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingTreeNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingTreeStatusDto;

public interface TrainingNodeProvider {
    // ================================ CREATE ================================
    
    boolean createBranchNode(TrainingBranchNodeDto dto);
    boolean createCategoryNode(TrainingCategoryNodeDto dto);
    boolean createCustomSlideNode(TrainingCustomSlideNodeDto dto);
    boolean createGeneratedSlideNode(TrainingGeneratedSlideNodeDto dto);
    boolean createRequirementNode(TrainingRequirementNodeDto dto);
    boolean createTreeNode(TrainingTreeNodeDto dto);
    
    // ================================ UPDATE ================================
    
    boolean updateBranchNode(TrainingBranchNodeDto dto);
    boolean updateCategoryNode(TrainingCategoryNodeDto dto);
    boolean updateCustomSlideNode(TrainingCustomSlideNodeDto dto);
    boolean updateGeneratedSlideNode(TrainingGeneratedSlideNodeDto dto);
    boolean updateRequirementNode(TrainingRequirementNodeDto dto);
    boolean updateTreeNode(TrainingTreeNodeDto dto);
    
    // ================================ DELETE ================================
    
    boolean deleteBranchNode(Long id);
    boolean deleteCategoryNode(Long id);
    boolean deleteCustomSlideNode(Long id);
    boolean deleteGeneratedSlideNode(Long id);
    boolean deleteRequirementNode(Long id);
    boolean deleteTreeNode(Long id);
    
    // ============================== GET BY ID ===============================
    
    TrainingBranchNodeDto findBranchNode(Long id);
    TrainingCategoryNodeDto findCategoryNode(Long id);
    TrainingCustomSlideNodeDto findCustomSlideNode(Long id);
    TrainingGeneratedSlideNodeDto findGeneratedSlideNode(Long id);
    TrainingRequirementNodeDto findRequirementNode(Long id);
    
    // =============================== GET ALL ================================
    
    Set<TrainingBranchNodeDto> findAllBranchNodes();
    Set<TrainingCategoryNodeDto> findAllCategoryNodes();
    Set<TrainingCustomSlideNodeDto> findAllCustomSlideNodes();
    Set<TrainingGeneratedSlideNodeDto> findAllGeneratedSlideNodes();
    Set<TrainingRequirementNodeDto> findAllRequirementNodes();
    List<TrainingTreeNodeDto> findAllTreeNodes();
    
    // ================================ SEARCH ================================
    
    List<TrainingBranchNodeDto> searchBranchNodes(String query);
    List<TrainingCategoryNodeDto> searchCategoryNodes(String query);
    List<TrainingCustomSlideNodeDto> searchCustomSlideNodes(String query);
    List<TrainingGeneratedSlideNodeDto> searchGeneratedSlideNodes(String query);
    List<TrainingRequirementNodeDto> searchRequirementNodes(String query);
    List<TrainingTreeNodeDto> searchTreeNodes(String query);
    
    // =========================== GET BY TREE NODE ===========================
    
    TrainingBranchNodeDto findBranchNodeByTreeNode(Long id);
    TrainingCategoryNodeDto findCategoryNodeByTreeNode(Long id);
    TrainingCustomSlideNodeDto findCustomSlideNodeByTreeNode(Long id);
    TrainingGeneratedSlideNodeDto findGeneratedSlideNodeByTreeNode(Long id);
    TrainingRequirementNodeDto findRequirementNodeByTreeNode(Long id);
    
    // ============================== ADDITIONAL ==============================
    
    TrainingTreeStatusDto updateTreeReadOnly(Long id);
    TrainingTreeStatusDto updateTree(TrainingTreeNodeDto idWrapped);
    TrainingTreeNodeDto getSubTreeById(
            Long id,
            boolean prepareContent,
            boolean includeIds,
            String parentName);
    
    TrainingTreeNodeDto getTrainingRoot(Long id);
    List<TrainingTreeNodeDto> getChildrenOf(Long id);
}
