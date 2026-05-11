package com.factory.rfidinspection.service;

import com.factory.rfidinspection.domain.PalletType;
import org.springframework.stereotype.Component;

@Component
public class PalletTypeClassifier {

    private static final String TYPE_12_PATTERN = "^NPC-[A-Z]{6}12$";
    private static final String COSTCO_PATTERN = "^NPC-[A-Z]{6}C$";
    private static final String TRADERS_PATTERN = "^NPC-[A-Z]{6}T$";
    private static final String TYPE_11_PATTERN = "^NPC-[A-Z]{6}$";

    public PalletType classify(String tag) {
        if (tag == null || tag.isBlank()) {
            return PalletType.UNKNOWN;
        }

        String value = tag.toUpperCase();
        if (value.matches(TYPE_12_PATTERN)) {
            return PalletType.SP12;
        }
        if (value.matches(COSTCO_PATTERN)) {
            return PalletType.SP11C;
        }
        if (value.matches(TRADERS_PATTERN)) {
            return PalletType.SP11T;
        }
        if (value.matches(TYPE_11_PATTERN)) {
            return PalletType.SP11;
        }
        return PalletType.UNKNOWN;
    }
}
