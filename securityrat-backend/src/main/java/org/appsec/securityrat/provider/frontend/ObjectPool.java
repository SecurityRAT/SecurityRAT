package org.appsec.securityrat.provider.frontend;

import java.util.HashMap;
import java.util.Map;

final class ObjectPool {
    private Map<String, Object> objectPool;
    
    ObjectPool() {
        this.objectPool = new HashMap<>();
    }
    
    Object find(String identifier) {
        return this.objectPool.get(identifier);
    }
    
    void add(String identifier, Object instance) {
        this.objectPool.put(identifier, instance);
    }
    
    void addAll(Map<String, Object> entities) {
        this.objectPool.putAll(entities);
    }
}
