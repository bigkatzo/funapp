/**
 * Transcoding Worker
 * Processes video files using FFmpeg to generate HLS streams
 */

const ffmpeg = require('fluent-ffmpeg');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const Video = require('../models/video.model');
const logger = require('../utils/logger');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'fun-app-media-dev';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;
const TEMP_DIR = '/tmp/media';

/**
 * Transcoding quality presets
 */
const QUALITY_PRESETS = [
  { name: '360p', height: 360, videoBitrate: '500k', audioBitrate: '64k' },
  { name: '540p', height: 540, videoBitrate: '1000k', audioBitrate: '96k' },
  { name: '720p', height: 720, videoBitrate: '2500k', audioBitrate: '128k' },
  { name: '1080p', height: 1080, videoBitrate: '5000k', audioBitrate: '192k' }
];

/**
 * Setup transcoding worker
 */
module.exports = function(queue) {
  queue.process(async (job) => {
    const { videoId, uploadId, originalUrl, filename } = job.data;
    
    logger.info(`Starting transcoding job ${job.id} for video ${videoId}`);
    
    try {
      // Update video status
      const video = await Video.findById(videoId);
      if (!video) {
        throw new Error('Video not found');
      }
      
      // Create temp directories
      const workDir = path.join(TEMP_DIR, uploadId);
      await fs.mkdir(workDir, { recursive: true });
      
      // Download original file from S3
      job.progress(5);
      const localInputPath = path.join(workDir, filename);
      await downloadFromS3(originalUrl, localInputPath);
      
      // Get video metadata
      job.progress(10);
      const metadata = await getVideoMetadata(localInputPath);
      video.duration = metadata.duration;
      video.width = metadata.width;
      video.height = metadata.height;
      video.aspectRatio = `${metadata.width}:${metadata.height}`;
      await video.save();
      
      logger.info(`Video metadata: ${metadata.width}x${metadata.height}, ${metadata.duration}s`);
      
      // Generate thumbnail
      job.progress(15);
      const thumbnailPath = path.join(workDir, 'thumbnail.jpg');
      await generateThumbnail(localInputPath, thumbnailPath, metadata.duration);
      const thumbnailUrl = await uploadToS3(
        thumbnailPath,
        `videos/processed/${uploadId}/thumbnail.jpg`,
        'image/jpeg'
      );
      video.thumbnailUrl = getPublicUrl(thumbnailUrl);
      await video.save();
      
      logger.info('Thumbnail generated');
      
      // Transcode to HLS
      const outputs = [];
      let progressOffset = 20;
      const progressStep = 70 / QUALITY_PRESETS.length;
      
      for (const preset of QUALITY_PRESETS) {
        // Skip qualities higher than original
        if (preset.height > metadata.height) {
          continue;
        }
        
        logger.info(`Transcoding ${preset.name}...`);
        
        const outputDir = path.join(workDir, preset.name);
        await fs.mkdir(outputDir, { recursive: true });
        
        const playlistPath = path.join(outputDir, 'playlist.m3u8');
        
        await transcodeToHLS(
          localInputPath,
          playlistPath,
          preset,
          metadata.width,
          metadata.height,
          (progress) => {
            job.progress(progressOffset + (progress * progressStep / 100));
          }
        );
        
        // Upload HLS files to S3
        const hlsFiles = await fs.readdir(outputDir);
        for (const file of hlsFiles) {
          const localPath = path.join(outputDir, file);
          const s3Key = `videos/processed/${uploadId}/${preset.name}/${file}`;
          const contentType = file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T';
          await uploadToS3(localPath, s3Key, contentType);
        }
        
        // Calculate output size
        const stats = await fs.stat(localInputPath);
        const size = stats.size;
        
        outputs.push({
          quality: preset.name,
          resolution: `${calculateWidth(metadata.width, metadata.height, preset.height)}x${preset.height}`,
          bitrate: parseInt(preset.videoBitrate),
          url: getPublicUrl(`s3://${BUCKET_NAME}/videos/processed/${uploadId}/${preset.name}/playlist.m3u8`),
          size
        });
        
        progressOffset += progressStep;
        logger.info(`${preset.name} transcoding complete`);
      }
      
      // Generate master playlist
      job.progress(90);
      const masterPlaylist = generateMasterPlaylist(outputs);
      const masterPath = path.join(workDir, 'master.m3u8');
      await fs.writeFile(masterPath, masterPlaylist);
      
      const masterUrl = await uploadToS3(
        masterPath,
        `videos/processed/${uploadId}/master.m3u8`,
        'application/vnd.apple.mpegurl'
      );
      
      video.masterPlaylistUrl = getPublicUrl(masterUrl);
      video.outputs = outputs;
      
      // Clean up temp files
      job.progress(95);
      await fs.rm(workDir, { recursive: true, force: true });
      
      // Mark as completed
      await video.updateStatus('completed');
      
      job.progress(100);
      logger.info(`Transcoding completed for video ${videoId}`);
      
      return {
        videoId,
        uploadId,
        masterPlaylistUrl: video.masterPlaylistUrl,
        thumbnailUrl: video.thumbnailUrl,
        outputs: video.outputs
      };
      
    } catch (error) {
      logger.error(`Transcoding failed for job ${job.id}:`, error);
      
      // Update video status
      try {
        const video = await Video.findById(videoId);
        if (video) {
          await video.updateStatus('failed', error.message);
        }
      } catch (updateError) {
        logger.error('Failed to update video status:', updateError);
      }
      
      throw error;
    }
  });
  
  // Event listeners
  queue.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed:`, result);
  });
  
  queue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed:`, err);
  });
  
  logger.info('Transcoding worker registered');
};

/**
 * Download file from S3
 */
async function downloadFromS3(s3Url, localPath) {
  const key = s3Url.replace(`s3://${BUCKET_NAME}/`, '');
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });
  
  const response = await s3Client.send(command);
  const writeStream = require('fs').createWriteStream(localPath);
  
  return new Promise((resolve, reject) => {
    response.Body.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

/**
 * Upload file to S3
 */
async function uploadToS3(localPath, s3Key, contentType) {
  const fileStream = require('fs').createReadStream(localPath);
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: contentType
    }
  });
  
  await upload.done();
  return `s3://${BUCKET_NAME}/${s3Key}`;
}

/**
 * Get video metadata using FFmpeg
 */
function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      
      resolve({
        duration: Math.round(metadata.format.duration),
        width: videoStream.width,
        height: videoStream.height,
        codec: videoStream.codec_name,
        fps: eval(videoStream.r_frame_rate)
      });
    });
  });
}

/**
 * Generate thumbnail from video
 */
function generateThumbnail(videoPath, outputPath, duration) {
  return new Promise((resolve, reject) => {
    // Extract frame at 10% of duration
    const timestamp = Math.max(1, Math.floor(duration * 0.1));
    
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timestamp],
        filename: 'temp-thumb.jpg',
        folder: path.dirname(outputPath),
        size: '720x?'
      })
      .on('end', async () => {
        // Optimize with sharp
        try {
          await sharp(path.join(path.dirname(outputPath), 'temp-thumb.jpg'))
            .resize(720, null, { fit: 'inside' })
            .jpeg({ quality: 85 })
            .toFile(outputPath);
          
          await fs.unlink(path.join(path.dirname(outputPath), 'temp-thumb.jpg'));
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

/**
 * Transcode video to HLS format
 */
function transcodeToHLS(inputPath, outputPath, preset, originalWidth, originalHeight, onProgress) {
  return new Promise((resolve, reject) => {
    const targetWidth = calculateWidth(originalWidth, originalHeight, preset.height);
    
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
        `-b:v ${preset.videoBitrate}`,
        `-maxrate ${preset.videoBitrate}`,
        `-bufsize ${parseInt(preset.videoBitrate) * 2}k`,
        `-vf scale=${targetWidth}:${preset.height}`,
        '-c:a aac',
        `-b:a ${preset.audioBitrate}`,
        '-ac 2',
        '-hls_time 10',
        '-hls_playlist_type vod',
        '-hls_segment_filename', path.join(path.dirname(outputPath), 'segment_%03d.ts'),
        '-f hls'
      ])
      .output(outputPath)
      .on('progress', (progress) => {
        if (progress.percent) {
          onProgress(progress.percent);
        }
      })
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

/**
 * Calculate width maintaining aspect ratio
 */
function calculateWidth(originalWidth, originalHeight, targetHeight) {
  const aspectRatio = originalWidth / originalHeight;
  return Math.round(targetHeight * aspectRatio);
}

/**
 * Generate master HLS playlist
 */
function generateMasterPlaylist(outputs) {
  let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n\n';
  
  for (const output of outputs) {
    const [width, height] = output.resolution.split('x');
    playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${output.bitrate * 1000},RESOLUTION=${output.resolution}\n`;
    playlist += `${output.quality}/playlist.m3u8\n\n`;
  }
  
  return playlist;
}

/**
 * Convert S3 URL to public CloudFront URL
 */
function getPublicUrl(s3Url) {
  if (CLOUDFRONT_DOMAIN) {
    const key = s3Url.replace(`s3://${BUCKET_NAME}/`, '');
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  }
  // Fallback to S3 URL
  const key = s3Url.replace(`s3://${BUCKET_NAME}/`, '');
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}
