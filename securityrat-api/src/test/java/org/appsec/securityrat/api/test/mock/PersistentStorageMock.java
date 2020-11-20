package org.appsec.securityrat.api.test.mock;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.appsec.securityrat.api.dto.SimpleDto;
import org.appsec.securityrat.api.provider.PersistentStorage;
import org.springframework.stereotype.Service;

@Service
public class PersistentStorageMock implements PersistentStorage {
    private static Object getPublicConstant(
            Class<?> numberClass,
            String constantName) {
        Field maxValueField;
        
        try {
            maxValueField = numberClass.getField(constantName);
        } catch (NoSuchFieldException ex) {
            throw new IllegalArgumentException(String.format(
                    "%s does not provide a %s field",
                    numberClass.getName(), constantName), ex);
        }
        
        try {
            return maxValueField.get(null);
        } catch (IllegalAccessException ex) {
            throw new IllegalArgumentException(String.format(
                    "%s of %s is no public constant",
                    constantName,
                    numberClass.getName()), ex);
        }
    }
    
    private final Map<Class<?>, List<Object>> storage;
    
    public PersistentStorageMock() {
        this.storage = new HashMap<>();
    }
    
    @Override
    public <TId, TSimpleDto extends SimpleDto<TId>> boolean create(
            TSimpleDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("dto is null");
        }
        
        if (dto.getId() != null) {
            return false;
        }
        
        Class<? extends SimpleDto> dtoClass = dto.getClass();
        Class<?> idType = dto.getIdentifierClass();
        
        // We only support numeric id types in this PersistentStorage
        // implementation
        
        if (!Number.class.isAssignableFrom(idType)) {
            throw new UnsupportedOperationException(String.format(
                    "This PersistentStorage implementation only supports "
                            + "numeric identifiers and type is %s",
                    idType.getName()));
        }
        
        List<Object> objStorage = this.storage.get(dtoClass);
        
        if (objStorage == null) {
            this.storage.put(dtoClass, objStorage = new ArrayList<>());
        }
        
        if (!objStorage.add(dto)) {
            throw new IllegalStateException("Unable to add dto to storage");
        }
        
        int idx = objStorage.indexOf(dto);
        
        // If the identifier type of the dto does not include the whole range of
        // a signed 32 bit integer, we need to verify that the assigned index
        // can be represented by that identifier type and does not lead to an
        // overflow.
        //
        // NOTE: The following code works only if idType extends
        //       java.lang.Number (which was validated before) and provides two
        //       public constants (access modifiers "public static"): MAX_VALUE
        //       and MIN_VALUE (both need to be instances of a class that
        //       extends java.lang.Number).
        //       This is true for all primitive type wrappers (Byte, Double,
        //       etc.), but not for non-primitive wrappers like BigDecimal.
        //       Also the following code may not work, if MAX_VALUE or MIN_VALUE
        //       is out the range of a java.lang.Long.
        
        long idMaximumValue = ((Number) PersistentStorageMock.getPublicConstant(
                idType, "MAX_VALUE")).longValue();
        
        long idMinimumValue = ((Number) PersistentStorageMock.getPublicConstant(
                idType, "MIN_VALUE")).longValue();
        
        if (idx > idMaximumValue || idx < idMinimumValue) {
            objStorage.remove(dto);
            return false;
        }
        
        // Finally, casting the idx to the idType. Since even non-primitive
        // types cannot be casted to each other, if one does not inherit the
        // other, the easiest way is to create a string from the idx and parse
        // it with the static valueOf implementation of idType.
        //
        // NOTE: Again, the following code will only work for idTypes that
        //       provide a "valueOf" method that accepts exactly one
        //       decimal-value-string. (True for all primitive wrappers.)
        
        Method valueOfMethod;
        
        try {
            valueOfMethod = idType.getMethod("valueOf", String.class);
        } catch (NoSuchMethodException ex) {
            throw new UnsupportedOperationException(String.format(
                    "%s does not provide a valueOf(String) method",
                    idType.getName()), ex);
        }
        
        TId dtoId;
        
        try {
            dtoId = (TId) valueOfMethod.invoke(null, Integer.toString(idx));
        } catch (IllegalAccessException | InvocationTargetException ex) {
            throw new UnsupportedOperationException(String.format(
                    "valueOf(String) implementation of %s is not publicly and "
                            + "statically accessible",
                    idType.getName()), ex);
        }
        
        dto.setId(dtoId);
        
        return true;
    }

    @Override
    public <TId, TSimpleDto extends SimpleDto<TId>> boolean update(TSimpleDto dto) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public <TId, TSimpleDto extends SimpleDto<TId>> boolean delete(TId id, Class<TSimpleDto> simpleDtoClass) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public <TId, TSimpleDto extends SimpleDto<TId>> TSimpleDto find(TId id, Class<TSimpleDto> simpleDtoClass) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public <TId, TSimpleDto extends SimpleDto<TId>> Set<TSimpleDto> findAll(Class<TSimpleDto> simpleDtoClass) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public <TId, TSimpleDto extends SimpleDto<TId>> List<TSimpleDto> search(String query, Class<TSimpleDto> simpleDtoClass) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    // Methods for the test validations
    
    public <TSimpleDto extends SimpleDto<?>> List<TSimpleDto> getStorage(
            Class<TSimpleDto> simpleDtoClass) {
        List<Object> dtoStorage = this.storage.get(simpleDtoClass);
        
        if (dtoStorage == null) {
            return Collections.emptyList();
        }
        
        return this.storage.get(simpleDtoClass)
                .stream()
                .map(dto -> (TSimpleDto) dto)
                .collect(Collectors.toList());
    }
    
    public void clear() {
        this.storage.clear();
    }
}
