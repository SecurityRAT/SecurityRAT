package org.appsec.securityRAT.domain;

import java.io.Serializable;
import java.util.List;

public class TrainingTreeStatus implements Serializable {

    private boolean hasUpdates;

    public boolean getHasUpdates() {
        return hasUpdates;
    }

    public void setHasUpdates(boolean hasUpdates) {
        this.hasUpdates = hasUpdates;
    }

}
