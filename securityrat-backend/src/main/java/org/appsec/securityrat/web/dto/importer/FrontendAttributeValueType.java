package org.appsec.securityrat.web.dto.importer;

public enum FrontendAttributeValueType {
    /**
     * The {@link FrontendAttributeValueDto#value} field contains the
     * attribute's actual value.
     */
    Value,
    
    /**
     * The {@link FrontendAttributeValueDto#value} field contains the unique
     * instance identifier of the attribute's value, which is another new object
     * that has been mapped.
     */
    PoolReference,
    
    /**
     * The {@link FrontendAttributeValueDto#value} field contains the unique
     * instance identifier of the attribute's value, which is a SecurityRAT
     * object that has already existed before the current mapping took place.
     */
    ExistingReference
}
