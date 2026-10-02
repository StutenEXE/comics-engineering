package dev.stuten.vps.models.daos.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import dev.stuten.vps.services.ImageStorageService;

/**
 * Tracks the image changes made during a transaction (see Transactions.run) so
 * that storage stays consistent with the database :
 * - uploads are undone on rollback
 * - deletions are deferred until commit
 */
public class ImageUploader {

    private static final ImageStorageService imageStorageService = new ImageStorageService();

    private final List<String> uploaded = new ArrayList<>();
    private final List<String> pendingDeletes = new ArrayList<>();

    public String uploadImage(String imgUrl) {
        String storedUrl = imageStorageService.uploadFromUrl(imgUrl);
        uploaded.add(storedUrl);
        return storedUrl;
    }

    public void deleteImage(String imgUrl) {
        if (imgUrl != null) {
            pendingDeletes.add(imgUrl);
        }
    }

    public String deleteAndCreateImage(String currentUrl, String newUrl) {
        if (Objects.equals(newUrl, currentUrl)) {
            return currentUrl;
        }
        String storedUrl = uploadImage(newUrl);
        deleteImage(currentUrl);
        return storedUrl;
    }

    /**
     * Called once the transaction has committed : the database no longer
     * references the deleted images, remove them from storage.
     */
    public void commit() {
        // A failure here only leaves an unreferenced image behind, the data is safe
        deleteAllQuietly(pendingDeletes);
    }

    /**
     * Called when the transaction rolled back : the database never referenced the
     * uploaded images, remove them from storage.
     */
    public void rollback() {
        deleteAllQuietly(uploaded);
    }

    private static void deleteAllQuietly(List<String> imgUrls) {
        for (String imgUrl : imgUrls) {
            try {
                imageStorageService.deleteFromUrl(imgUrl);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        imgUrls.clear();
    }
}
