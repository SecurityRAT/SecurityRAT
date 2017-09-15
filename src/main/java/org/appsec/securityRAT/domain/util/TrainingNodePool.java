package org.appsec.securityRAT.domain.util;


import org.appsec.securityRAT.domain.TrainingTreeNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * TrainingNodePool
 *
 * A singleton-like class to save nodes for later use.
 *
 * Used when updating the tree requires to delete customNodes (TrainingCustomSlideNode, TrainingBranchNode) from RequirementNodes.
 * If it turns out that a TrainingRequirementNode pointing to the previously deleted RequirementSkeleton, the saved nodes can be restored.
 * To preserve the saved nodes throughout different recursion steps this class provides exactly one instance per trainingId
 * (singleton-like).
 *
 * Only the base nodes (TrainingTreeNode instance) can be saved, so the node_type does not matter.
 */
public class TrainingNodePool {
    private static HashMap<Long, TrainingNodePool> instances = new HashMap<>();
    private HashMap<Long, List<TrainingTreeNode>> savedNodes; // requirementId, list of saved nodes
    protected TrainingNodePool() {
        savedNodes = new HashMap<>();
    }
    public static TrainingNodePool getInstance(Long trainingId) {
        if(instances.get(trainingId) == null) {
            instances.put(trainingId, new TrainingNodePool());
        }
        return instances.get(trainingId);
    }

    public void addCustomNode(Long requirementId, TrainingTreeNode customNode) {
        if(savedNodes.get(requirementId) == null)
            savedNodes.put(requirementId, new ArrayList<>());
        savedNodes.get(requirementId).add(customNode);
    }
    public List<TrainingTreeNode> getCustomNodes(Long requirementId) {
        return savedNodes.get(requirementId);
    }
    public void removeCustomNodes(Long requirementId) {
        savedNodes.get(requirementId).clear();
        savedNodes.remove(requirementId);
    }
    public void clearAll() {
        savedNodes.clear();
    }
    public HashMap<Long, List<TrainingTreeNode>> getAll() {
        return savedNodes;
    }
}
