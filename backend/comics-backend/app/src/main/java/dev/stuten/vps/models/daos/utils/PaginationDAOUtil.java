package dev.stuten.vps.models.daos.utils;

import dev.stuten.vps.models.dtos.request.search.PaginationDTO;

public class PaginationDAOUtil {

    public static Integer getOffset(PaginationDTO pagination) {
        return (pagination.getPage() - 1) * pagination.getSize();
    }

    public static Integer getLimit(PaginationDTO pagination) {
        return pagination.getSize();
    }
}
