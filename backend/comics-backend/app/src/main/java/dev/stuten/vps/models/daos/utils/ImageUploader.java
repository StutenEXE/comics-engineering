package dev.stuten.vps.models.daos.utils;

import dev.stuten.vps.services.ImageStorageService;

public class ImageUploader {

    static ImageStorageService imageStorageService = new ImageStorageService();

    public static String uploadImage(String imgUrl) {
        return imageStorageService.uploadFromUrl(imgUrl).get();
    }

    public static Boolean deleteImage(String imgUrl) {
        if (imgUrl == null) {
            return true;
        }
        return imageStorageService.deleteFromUrl(imgUrl);
    }

    public static String deleteAndCreateImage(String currentUrl, String newUrl) {
        if (!newUrl.equals(currentUrl)) {
            if (currentUrl != null) {
                imageStorageService.deleteFromUrl(currentUrl);
            }
            return imageStorageService.uploadFromUrl(newUrl).get();
        }
        return currentUrl;
    }
}
