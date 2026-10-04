package dev.stuten.vps.models.dtos.request.search;

import org.jooq.Field;

/**
 * A field a list can be sorted on (see SortingDTO). Implemented by the
 * "...SortingFields" enums, whose JSON names are the accepted "sortField"
 * values.
 */
public interface SortableField {
    Field<?> getTableField();
}
