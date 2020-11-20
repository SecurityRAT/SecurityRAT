package org.appsec.securityrat.web.dto.importer;

import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendObjectDto implements Dto {
    /**
     * The unique instance identifier of this object.
     * 
     * Since it is required that the identifier is unique on both sides, the
     * server and the client, we need to prefix them with a side-dependent
     * prefix:
     * 
     * <ul>
     *  <li>
     *   FrontendObjectDto instances that are provided by the <b>server-side</b>
     *   shall be prefixed with a <code>s/</code> prefix.
     *  </li>
     *  <li>
     *   FrontendObjectDto instances that are provided by the <b>client-side</b>
     *   shall be prefixed with a <code>c/</code> prefix.
     *  </li>
     * </ul>
     */
    private String identifier;
    private String typeIdentifier;
    private Set<FrontendAttributeValueDto> attributes;
    private FrontendReplaceRule replaceRule;
}
