package dev.stuten.vps.services;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.Objects;
import java.util.UUID;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

public class ImageStorageService {
    private final S3Client s3Client;

    private String endpoint = Objects.requireNonNull(System.getenv("S3_ENDPOINT"), "S3_ENDPOINT not set");
    private String region = Objects.requireNonNull(System.getenv("S3_REGION"), "S3_REGION not set");
    private String bucket = Objects.requireNonNull(System.getenv("S3_BUCKET"), "S3_BUCKET not set");
    private String keyId = Objects.requireNonNull(System.getenv("S3_ACCESS_KEY_ID"), "S3_ACCESS_KEY_ID not set");
    private String key = Objects.requireNonNull(System.getenv("S3_SECRET_ACCESS_KEY"), "S3_SECRET_ACCESS_KEY not set");
    private String publicUrl = Objects.requireNonNull(System.getenv("S3_PUBLIC_URL"), "S3_PUBLIC_URL not set");

    public ImageStorageService() {
        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(keyId, key)))
                .region(Region.of(region))
                .forcePathStyle(true) // required for Garage
                .build();
    }

    public String uploadFromUrl(String imageUrl) {
        // Validate URL
        if (!isValidImageUrl(imageUrl)) {
            throw new RuntimeException("Invalid image URL");
        }

        // Download image
        byte[] imageBytes;
        String contentType;
        try {
            HttpURLConnection conn = (HttpURLConnection) URI.create(imageUrl).toURL().openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);
            conn.setInstanceFollowRedirects(true);

            contentType = conn.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Invalid image content type");
            }

            try (InputStream is = conn.getInputStream()) {
                imageBytes = is.readAllBytes();
            }
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to download image from URL", e);
        }

        // Upload to S3
        try {
            String key = "uploads/" + UUID.randomUUID() + extensionFromContentType(contentType);
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromBytes(imageBytes));
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to upload image to S3", e);
        }

        // Return the public URL
        System.out.println("Image uploaded successfully to S3: " + publicUrl + "/" + key);
        return publicUrl + "/" + key;
    }

    private boolean isValidImageUrl(String url) {
        try {
            URI uri = new URI(url);
            return uri.getScheme().startsWith("http");
        } catch (Exception e) {
            return false;
        }
    }

    private String extensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> "";
        };
    }

    public boolean deleteFromUrl(String fileUrl) {
        try {
            URI uri = URI.create(fileUrl);
            String path = uri.getPath(); // /kys-test-media/uploads/uuid.jpg

            // Extract bucket and key from path
            String[] parts = path.substring(1).split("/", 2); // remove leading /
            if (parts.length < 2) {
                return false;
            }

            String bucketName = parts[0]; // kys-test-media
            String key = parts[1]; // uploads/uuid.jpg

            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to delete image from S3", e);
        }
    }
}