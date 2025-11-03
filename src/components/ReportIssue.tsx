import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useApp } from '../contexts/AppContext';
import { Issue, IssueCategory, Department } from '../types';
import { toast } from 'sonner@2.0.3';
import { Camera, MapPin, CheckCircle, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

// Map categories to departments
const categoryToDepartment: Record<IssueCategory, Department> = {
  road: 'Roads & Infrastructure',
  water: 'Water Supply',
  electricity: 'Electricity & Power',
  sanitation: 'Sanitation & Waste',
  streetlight: 'Electricity & Power',
  drainage: 'Public Works',
  other: 'General',
};

interface ReportIssueProps {
  onSuccess?: () => void;
}

export const ReportIssue = ({ onSuccess }: ReportIssueProps) => {
  const { addIssue, currentUser } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('other');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get GPS location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setGpsError('');
    setIsGettingLocation(true);
    
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      toast.error('GPS Not Supported', {
        description: 'Your browser does not support geolocation.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        // Reverse geocode to get address (simplified)
        setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        setIsGettingLocation(false);
        toast.success('Location captured', {
          description: `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable. Please check your GPS.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        setGpsError(errorMessage);
        setIsGettingLocation(false);
        toast.error('Location Error', {
          description: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const startCamera = async () => {
    setCameraError('');
    setIsCameraLoading(true);
    console.log('Starting camera...');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported by your browser.');
      setIsCameraLoading(false);
      toast.error('Camera Not Supported', {
        description: 'Your browser does not support camera access.',
      });
      return;
    }

    try {
      console.log('Requesting camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      console.log('Camera permission granted, stream received');
      console.log('Stream active:', stream.active);
      console.log('Video tracks:', stream.getVideoTracks().length);
      
      streamRef.current = stream;
      setIsCameraActive(true);
      setIsCameraReady(false);

      // Wait for the video element to mount
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const videoElement = videoRef.current;
      if (!videoElement) {
        console.error('Video element not yet available after activating camera');
        setCameraError('Unable to initialise camera preview. Please refresh and try again.');
        setIsCameraLoading(false);
        return;
      }

      console.log('Attaching stream to video element...');

      const handleLoadedMetadata = async () => {
        try {
          await videoElement.play();
          const ensureVideoReady = () => {
            if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
              console.log('Video is now playing:', videoElement.videoWidth, 'x', videoElement.videoHeight);
              setIsCameraReady(true);
              setIsCameraLoading(false);
            } else {
              requestAnimationFrame(ensureVideoReady);
            }
          };

          ensureVideoReady();
          toast.success('Camera activated', {
            description: 'Ready to capture photo',
          });
        } catch (playError) {
          console.error('Play error:', playError);
          setCameraError('Failed to start video playback. Please try again.');
          setIsCameraActive(false);
          setIsCameraReady(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            streamRef.current = null;
          }
        }
      };

      videoElement.onloadedmetadata = handleLoadedMetadata;
      videoElement.srcObject = stream;
    } catch (error: any) {
      console.error('Camera error:', error);
      setIsCameraLoading(false);
      let errorMessage = 'Unable to access camera. ';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Camera permission denied. Please grant camera access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += 'Please check your camera permissions and try again.';
      }
      setCameraError(errorMessage);
      setIsCameraActive(false);
      toast.error('Camera Error', {
        description: errorMessage,
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
    setIsCameraActive(false);
    setIsCameraReady(false);
  };

  const capturePhoto = () => {
    if (!isCameraReady) {
      toast.error('Camera Initializing', {
        description: 'Please wait for the live preview before capturing.',
      });
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        toast.success('Photo captured', {
          description: 'Image captured successfully',
        });
        // Analyze the image after capturing
        analyzeImageWithAI(imageData);
      }
    }
  };

  const analyzeImageWithAI = async (imageData: string) => {
    setIsAnalyzingImage(true);
    try {
      // Convert base64 to blob
      const blob = await (await fetch(imageData)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');

      // Send to AI service
      const response = await fetch('https://untransacted-unfigurable-lucinda.ngrok-free.dev/classify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.warning('Unable to Auto-Classify', {
          description: errorData.error || 'Could not classify the image. Please fill in manually.',
        });
        setIsAnalyzingImage(false);
        return;
      }

      const result = await response.json();
      
      // Auto-fill category based on classification
      const categoryMap: Record<string, IssueCategory> = {
        'Pothole': 'road',
        'Improper Speedbreaker': 'road',
        'Traffic Signal Issue': 'road',
        'Garbage': 'sanitation',
        'Sewage Overflow': 'sanitation',
        'Broken Streetlight': 'streetlight',
        'Waterlogging': 'water',
        'Drainage Blockage': 'drainage',
        'Water Pipe Leakage': 'water',
        'Plastic Pollution in Water': 'water',
        'Illegal Construction': 'other',
        'Building Collapse': 'other',
        'Damaged Bridge': 'road',
        'Damaged Footpath': 'road',
        'Accident Spot': 'other',
        'Fire Hazard': 'other',
        'Public Safety Concern': 'other',
        'Fallen Tree': 'other',
        'Air Pollution': 'other',
        'Noise Pollution': 'other',
      };

      const detectedCategory = categoryMap[result.category] || 'other';
      const detectedTitle = result.category || 'Civic Issue Detected';

      // Auto-fill the fields
      setCategory(detectedCategory);
      setTitle(detectedTitle);
      setDescription(result.caption);

      toast.success('Image Analyzed!', {
        description: `Category: ${result.category} | Caption: ${result.caption}`,
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast.warning('Could not connect to AI service', {
        description: 'Please check if the AI service is running and fill in the details manually.',
      });
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage('');
    startCamera();
  };

  const removePhoto = () => {
    setCapturedImage('');
    stopCamera();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentUser) return;

    if (!latitude || !longitude) {
      toast.error('Location Required', {
        description: 'GPS location is required to prevent fraud. Please enable location services.',
      });
      return;
    }

    if (!capturedImage) {
      toast.error('Photo Required', {
        description: 'Live photo is required to verify the issue. Please capture a photo.',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000));

  const departmentKey = category as IssueCategory;
  const department = categoryToDepartment[departmentKey] ?? 'General';

    const newIssue: Issue = {
      id: Date.now().toString(),
      title,
      description,
      category,
      status: 'pending',
      location,
      latitude,
      longitude,
      imageUrl: capturedImage,
      reportedBy: currentUser.id,
      reporterName: currentUser.name,
      department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: [currentUser.id], // Auto-upvote by reporter
      upvoteCount: 1,
    };

    addIssue(newIssue);
    setIsSuccess(true);

    toast.success('Issue reported successfully!', {
      description: 'The municipal team will review your report shortly.',
    });

    // Reset form after animation
    setTimeout(() => {
      setTitle('');
      setDescription('');
      setCategory('other');
      setLocation('');
      setCapturedImage('');
      setIsSubmitting(false);
      setIsSuccess(false);
      onSuccess?.();
    }, 1500);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (isSuccess) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle className="h-10 w-10 text-white" />
        </motion.div>
        <motion.h3
          className="text-2xl mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Issue Reported!
        </motion.h3>
        <motion.p
          className="text-muted-foreground text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your report has been submitted and automatically assigned to the appropriate department staff.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GPS Alert */}
          {gpsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{gpsError}</span>
                <Button type="button" variant="outline" size="sm" onClick={getLocation}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : latitude && longitude ? (
            <Alert className="bg-green-50 border-green-200">
              <MapPin className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                GPS location verified: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </AlertDescription>
            </Alert>
          ) : isGettingLocation ? (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Getting your location... Please allow location access if prompted.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Waiting for GPS location...</span>
                <Button type="button" variant="outline" size="sm" onClick={getLocation}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Get Location
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the problem"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
              className="border-2 focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>

          {/* Category */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value: IssueCategory) => setCategory(value)}>
              <SelectTrigger className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="road">Road & Infrastructure</SelectItem>
                <SelectItem value="water">Water Supply</SelectItem>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="streetlight">Street Light</SelectItem>
                <SelectItem value="sanitation">Sanitation & Waste</SelectItem>
                <SelectItem value="drainage">Drainage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Description */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              required
              rows={4}
              className="border-2 focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>

          {/* Location Display */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label htmlFor="location">Location (GPS Coordinates) *</Label>
            <Input
              id="location"
              placeholder="Location will be captured automatically"
              value={location}
              readOnly
              className="border-2 bg-gray-50"
            />
          </motion.div>

          {/* Live Camera Capture */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Label>Live Photo Evidence * (Prevents Fraud)</Label>
            
            {!capturedImage && !isCameraActive && (
              <Button
                type="button"
                onClick={startCamera}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Camera className="mr-2 h-4 w-4" />
                Open Camera to Capture Photo
              </Button>
            )}

            {isCameraActive && (
              <div className="space-y-3">
                <div 
                  className="relative rounded-xl overflow-hidden border-4 border-blue-500 bg-black" 
                  style={{ 
                    minHeight: '400px',
                    width: '100%'
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full"
                    style={{ 
                      minHeight: '400px', 
                      maxHeight: '600px', 
                      objectFit: 'cover',
                      display: 'block',
                      width: '100%'
                    }}
                  />
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="text-sm font-medium">Initializing camera…</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
                    <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
                    CAMERA LIVE
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!isCameraReady}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    📸 Capture Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopCamera}
                    className="h-14"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-green-500">
                  <img src={capturedImage} alt="Captured" className="w-full h-auto" />
                  {isAnalyzingImage && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 text-white animate-spin" />
                      <span className="text-sm font-medium text-white">Analyzing with AI...</span>
                    </div>
                  )}
                  {!isAnalyzingImage && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={retakePhoto}
                    className="flex-1"
                    disabled={isAnalyzingImage}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retake Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={removePhoto}
                    disabled={isAnalyzingImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {cameraError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12"
              disabled={isSubmitting || !latitude || !longitude || !capturedImage}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Issue Report'
              )}
            </Button>
          </motion.div>

          <p className="text-xs text-center text-muted-foreground">
            * GPS and live photo are required to verify authenticity and prevent fraudulent reports
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
