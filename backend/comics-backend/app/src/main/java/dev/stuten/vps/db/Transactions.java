package dev.stuten.vps.db;

import org.jooq.DSLContext;

import dev.stuten.vps.models.daos.utils.ImageUploader;

/**
 * Runs a unit of work inside a single database transaction.
 *
 * Images are not part of the database, so they are handled alongside it :
 * - images uploaded during the work are deleted if the transaction rolls back
 * - images deleted during the work are only removed from storage once the
 * transaction has committed
 */
public final class Transactions {

    private Transactions() {
    }

    /**
     * Gives access to the transaction to the work being run. DAOs created with
     * this DSL take part in the transaction.
     */
    public record TransactionContext(DSLContext dsl, ImageUploader images) {
    }

    @FunctionalInterface
    public interface TransactionalWork<T> {
        T run(TransactionContext tx) throws Exception;
    }

    /**
     * Runs the work in a transaction. Any exception thrown by the work rolls the
     * transaction back and is rethrown (checked exceptions are wrapped by jOOQ).
     */
    public static <T> T run(TransactionalWork<T> work) {
        ImageUploader images = new ImageUploader();
        T result;
        try {
            result = JooqProvider.get().transactionResult(
                    cfg -> work.run(new TransactionContext(cfg.dsl(), images)));
        } catch (RuntimeException e) {
            images.rollback();
            throw e;
        }
        images.commit();
        return result;
    }
}
