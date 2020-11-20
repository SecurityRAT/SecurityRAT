package org.appsec.securityrat.web.dto.importer;

public enum FrontendReplaceRule {
    /**
     * There is no attempt to find duplicates.
     */
    Duplicate,
    
    /**
     * A later occurring version of the same object will replace an earlier one.
     */
    Replace,
    
    /**
     * Existing objects are preserved.
     */
    Ignore
}
