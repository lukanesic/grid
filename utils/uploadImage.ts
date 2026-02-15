import { supabase } from "@/lib/supabase";

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param imageUri - Local URI of the image (from ImagePicker)
 * @param userId - User ID for organizing files
 * @param folder - Folder name in storage (e.g., 'avatars')
 * @returns Public URL of the uploaded image or null if failed
 */
export async function uploadImage(
  imageUri: string,
  userId: string,
  folder: string = "avatars",
): Promise<string | null> {
  try {
    // Extract file extension from URI
    const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";

    // Generate unique filename
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Convert URI to blob for upload
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      console.error("[uploadImage] Upload error:", error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("[uploadImage] Exception:", error);
    return null;
  }
}

/**
 * Deletes an image from Supabase Storage
 * @param imageUrl - Public URL of the image to delete
 * @returns true if successful, false otherwise
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract file path from public URL
    const urlParts = imageUrl.split("/storage/v1/object/public/avatars/");
    if (urlParts.length < 2) {
      console.error("[deleteImage] Invalid URL format");
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage.from("avatars").remove([filePath]);

    if (error) {
      console.error("[deleteImage] Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[deleteImage] Exception:", error);
    return false;
  }
}
