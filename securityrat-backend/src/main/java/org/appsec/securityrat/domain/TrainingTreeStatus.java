package org.appsec.securityrat.domain;

import java.io.Serializable;

public class TrainingTreeStatus implements Serializable {

    private boolean hasUpdates;

    public boolean getHasUpdates() {
        return hasUpdates;
    }

    public void setHasUpdates(boolean hasUpdates) {
        this.hasUpdates = hasUpdates;
    }

}
