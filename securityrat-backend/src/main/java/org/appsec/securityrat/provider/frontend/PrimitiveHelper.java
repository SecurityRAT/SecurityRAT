package org.appsec.securityrat.provider.frontend;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

final class PrimitiveHelper {
    /**
     * A collection of all Java classes that are considered to be primitive.
     * 
     * All of those types need to be serializable by their implementation of
     * the {@link Object#toString()} method and deserializable by the
     * {@link PrimitiveHelper#parsePrimitive(java.lang.String, java.lang.Class)}
     * class.
     */
    static final Set<Class<?>> PRIMITIVE_CLASSES =
            new HashSet<>(Arrays.asList(
                    Byte.class, byte.class, Short.class, short.class,
                    Integer.class, int.class, Long.class, long.class,
                    Float.class, float.class, Double.class, double.class,
                    Character.class, char.class, String.class, Boolean.class,
                    boolean.class));
    
    public static Object parsePrimitive(String value, Class<?> targetType) {
        if (value == null) {
            throw new NullPointerException("value is null");
        }
        
        if (targetType == String.class) {
            return value;
        }
        
        // Unsigned integers

        if (targetType == Character.class || targetType == char.class) {
            return value.charAt(0);
        }
        
        // Signed integers
        
        if (targetType == Byte.class || targetType == byte.class) {
            return Byte.parseByte(value);
        }
        
        if (targetType == Short.class || targetType == short.class) {
            return Short.parseShort(value);
        }
        
        if (targetType == Integer.class || targetType == int.class) {
            return Integer.parseInt(value);
        }
        
        if (targetType == Long.class || targetType == long.class) {
            return Long.parseLong(value);
        }
        
        // Floating point numbers
        
        if (targetType == Float.class || targetType == float.class) {
            return Float.parseFloat(value);
        }
        
        if (targetType == Double.class || targetType == double.class) {
            return Double.parseDouble(value);
        }
        
        // Boolean
        
        if (targetType == Boolean.class || targetType == boolean.class) {
            return Boolean.parseBoolean(value);
        }
        
        // Non-primitives
        
        throw new IllegalArgumentException(
                "Class not primitive: " + targetType.getName());
    }
}
