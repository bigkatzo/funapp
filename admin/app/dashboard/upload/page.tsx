'use client';

import { useState } from 'react';
import { mediaAPI } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, Film } from 'lucide-react';
import { toast } from 'sonner';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  uploadId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }
      
      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 500MB');
        return;
      }

      setFile(selectedFile);
      setUploadState({ status: 'idle', progress: 0 });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadState({ status: 'uploading', progress: 0 });

      // Step 1: Initialize multipart upload
      const initResponse = await mediaAPI.post<{ uploadId: string; key: string }>('/upload/init', {
        filename: file.name,
        contentType: file.type,
      });

      const { uploadId, key } = initResponse;

      // Step 2: Upload file with progress tracking
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      const uploadPromises: Promise<any>[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkNumber', (i + 1).toString());
        formData.append('totalChunks', totalChunks.toString());

        const promise = mediaAPI.upload<any>(
          `/upload/chunk/${uploadId}`,
          formData,
          (progress) => {
            const overallProgress = ((i + progress / 100) / totalChunks) * 100;
            setUploadState((prev) => ({
              ...prev,
              progress: Math.round(overallProgress),
            }));
          }
        );

        uploadPromises.push(promise);
      }

      await Promise.all(uploadPromises);

      // Step 3: Complete upload and trigger processing
      setUploadState({ status: 'processing', progress: 100 });

      const completeResponse = await mediaAPI.post<{
        videoUrl: string;
        thumbnailUrl: string;
      }>(`/upload/complete/${uploadId}`);

      setUploadState({
        status: 'completed',
        progress: 100,
        uploadId,
        videoUrl: completeResponse.videoUrl,
        thumbnailUrl: completeResponse.thumbnailUrl,
      });

      toast.success('Video uploaded and processing started!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadState({
        status: 'error',
        progress: 0,
        error: error.message || 'Upload failed',
      });
      toast.error('Upload failed. Please try again.');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadState({ status: 'idle', progress: 0 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Video</h1>
        <p className="text-muted-foreground">Upload and transcode video content</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Video Upload</CardTitle>
            <CardDescription>Select a video file to upload (max 500MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video">Video File</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
              />
            </div>

            {file && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Film className="h-8 w-8 text-purple-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {uploadState.status !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {uploadState.status === 'uploading' && 'Uploading...'}
                    {uploadState.status === 'processing' && 'Processing...'}
                    {uploadState.status === 'completed' && 'Completed!'}
                    {uploadState.status === 'error' && 'Error!'}
                  </span>
                  <span className="font-medium">{uploadState.progress}%</span>
                </div>
                <Progress value={uploadState.progress} />
              </div>
            )}

            {uploadState.status === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{uploadState.error}</AlertDescription>
              </Alert>
            )}

            {uploadState.status === 'completed' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Video uploaded successfully! Processing may take a few minutes.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={
                  !file ||
                  uploadState.status === 'uploading' ||
                  uploadState.status === 'processing' ||
                  uploadState.status === 'completed'
                }
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              
              {(uploadState.status === 'completed' || uploadState.status === 'error') && (
                <Button variant="outline" onClick={resetUpload}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Info */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
            <CardDescription>Best practices for video uploads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>MP4 (H.264/H.265)</li>
                <li>MOV (QuickTime)</li>
                <li>AVI, MKV, WebM</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recommended Settings</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Resolution: 1080x1920 (9:16 vertical)</li>
                <li>Bitrate: 5-10 Mbps</li>
                <li>Frame Rate: 24-30 fps</li>
                <li>Duration: 30 seconds - 10 minutes</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Processing</h4>
              <p className="text-sm text-muted-foreground">
                Videos are automatically transcoded to HLS format with multiple quality levels
                for adaptive streaming. Processing time depends on video length and quality.
              </p>
            </div>

            {uploadState.videoUrl && (
              <div>
                <h4 className="font-medium mb-2">Video URL</h4>
                <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                  {uploadState.videoUrl}
                </code>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
