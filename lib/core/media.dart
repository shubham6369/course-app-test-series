import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';

class MediaHelper {
  static final ImagePicker _picker = ImagePicker();

  /// Picks an image from device gallery
  static Future<File?> pickImageFromGallery({
    int imageQuality = 85,
    double? maxWidth = 1920,
    double? maxHeight = 1080,
  }) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: imageQuality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      );
      if (file != null) {
        return File(file.path);
      }
    } catch (e) {
      debugPrint('MediaHelper.pickImageFromGallery error: $e');
    }
    return null;
  }

  /// Takes a photo using device camera
  static Future<File?> pickImageFromCamera({
    int imageQuality = 85,
    double? maxWidth = 1920,
    double? maxHeight = 1080,
  }) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: imageQuality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      );
      if (file != null) {
        return File(file.path);
      }
    } catch (e) {
      debugPrint('MediaHelper.pickImageFromCamera error: $e');
    }
    return null;
  }

  /// Caches a remote file (like an eBook PDF or question image) locally
  static Future<File?> cacheRemoteFile(String url, {String? fileName}) async {
    try {
      final dir = await getTemporaryDirectory();
      final name = fileName ?? 'cached_${url.split('/').last.split('?').first}';
      final savePath = '${dir.path}/$name';
      final file = File(savePath);

      if (await file.exists()) {
        return file;
      }

      final dio = Dio();
      await dio.download(url, savePath);
      return file;
    } catch (e) {
      debugPrint('MediaHelper.cacheRemoteFile error: $e');
      return null;
    }
  }

  /// Retrieves application documents storage directory
  static Future<String> getAppStoragePath() async {
    final dir = await getApplicationDocumentsDirectory();
    return dir.path;
  }

  /// Clears temporary cache files
  static Future<void> clearCache() async {
    try {
      final dir = await getTemporaryDirectory();
      if (await dir.exists()) {
        final files = dir.listSync();
        for (final entity in files) {
          if (entity is File) {
            await entity.delete();
          }
        }
      }
    } catch (e) {
      debugPrint('MediaHelper.clearCache error: $e');
    }
  }
}
