import * as ImagePicker from 'expo-image-picker';

// Pick an image from the library, returns a compressed base64 data URI (or null)
export async function pickImage() {
  try {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return { error: 'Permission to access photos is required.' };
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,            // compress to keep size small
      base64: true,
    });
    if (result.canceled) return { canceled: true };
    const asset = result.assets[0];
    // Build a data URI we can store directly and render with <Image>
    const uri = `data:image/jpeg;base64,${asset.base64}`;
    return { uri };
  } catch (e) {
    return { error: 'Could not open photo library.' };
  }
}

// Take a photo with the camera
export async function takePhoto() {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return { error: 'Camera permission is required.' };
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
      base64: true,
    });
    if (result.canceled) return { canceled: true };
    const asset = result.assets[0];
    const uri = `data:image/jpeg;base64,${asset.base64}`;
    return { uri };
  } catch (e) {
    return { error: 'Could not open camera.' };
  }
}