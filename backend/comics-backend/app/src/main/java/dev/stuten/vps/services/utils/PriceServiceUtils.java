package dev.stuten.vps.services.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;

import dev.stuten.vps.models.dtos.simple.SimpleOwnedEditionDTO;

public class PriceServiceUtils {
    public static BigDecimal calculateCost(SimpleOwnedEditionDTO oe) {
        return oe.getPurchasePrice().add(oe.getFees());
    }

    public static BigDecimal calculateSavings(SimpleOwnedEditionDTO oe) {
        return oe.getRetailPrice().subtract(calculateCost(oe));
    }

    public static BigDecimal calculateReduction(SimpleOwnedEditionDTO oe) {
        return calculateSavings(oe).divide(oe.getRetailPrice(), RoundingMode.HALF_UP);
    }
}
