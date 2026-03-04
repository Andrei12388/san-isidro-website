declare module 'face-api.js' {
  export class TinyFaceDetectorOptions {
    constructor(options?: { inputSize?: number; scoreThreshold?: number });
    inputSize: number;
    scoreThreshold: number;
  }

  export interface FaceDetection {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    score: number;
  }

  export interface FaceLandmarks68 {
    positions: Point[];
    shift: Point;
  }

  export interface Point {
    x: number;
    y: number;
  }

  export interface WithFaceDetection<T> {
    detection: FaceDetection;
  }

  export interface WithFaceLandmarks<TSource, TFaceLandmarks = FaceLandmarks68> {
    landmarks: TFaceLandmarks;
    unshiftedLandmarks: TFaceLandmarks;
    alignedRect: FaceDetection;
    angle: { roll: number; pitch: number; yaw: number };
  }

  export interface WithFaceDescriptor<TSource> {
    descriptor: Float32Array;
  }

  export type WithFaceExpressions<TSource> = TSource & {
    expressions: FaceExpressions;
  };

  export interface FaceExpressions {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
    asMapped(): { [emotion: string]: number };
  }

  export type FullFaceDescription = WithFaceDetection<{}> &
    WithFaceLandmarks<WithFaceDetection<{}>> &
    WithFaceDescriptor<WithFaceLandmarks<WithFaceDetection<{}>>>;

  export class TinyFaceDetector {
    constructor(options?: TinyFaceDetectorOptions);
  }

  export class FaceLandmark68Net {}
  export class FaceRecognitionNet {}
  export class SsdMobilenetv1Options {}

  export interface NeuralNetwork<TNetParams = any> {
    load(url: string | TNetParams): Promise<void>;
    loadFromUri(uri: string): Promise<void>;
  }

  export const nets: {
    tinyFaceDetector: NeuralNetwork;
    faceLandmark68Net: NeuralNetwork;
    faceRecognitionNet: NeuralNetwork;
    ssdMobilenetv1: NeuralNetwork;
    tinyYolov2: NeuralNetwork;
    faceLandmark68TinyNet: NeuralNetwork;
    faceExpressionNet: NeuralNetwork;
    ageGenderNet: NeuralNetwork;
    mtcnn: NeuralNetwork;
  };

  export function loadTinyFaceDetectorModel(url: string): Promise<void>;
  export function loadFaceLandmarkModel(url: string): Promise<void>;
  export function loadFaceLandmarkTinyModel(url: string): Promise<void>;
  export function loadFaceRecognitionModel(url: string): Promise<void>;
  export function loadFaceExpressionModel(url: string): Promise<void>;
  export function loadAgeGenderModel(url: string): Promise<void>;
  export function loadSsdMobilenetv1Model(url: string): Promise<void>;
  export function loadMtcnnModel(url: string): Promise<void>;
  export function loadTinyYolov2Model(url: string): Promise<void>;

  export function fetchImage(uri: string): Promise<HTMLImageElement>;

  export function matchDimensions(
    canvas: HTMLCanvasElement,
    dimensions: { width: number; height: number }
  ): HTMLCanvasElement;

  export function createCanvasFromMedia(
    media: HTMLImageElement | HTMLVideoElement
  ): HTMLCanvasElement;

  export const draw: {
    drawDetections(
      canvas: HTMLCanvasElement,
      detections: FaceDetection | FaceDetection[]
    ): void;
    drawFaceLandmarks(
      canvas: HTMLCanvasElement,
      landmarks: FaceLandmarks68 | FaceLandmarks68[]
    ): void;
  };

  export function euclideanDistance(
    arr1: number[] | Float32Array,
    arr2: number[] | Float32Array
  ): number;

  // Chaining API
  export interface DetectionTask {
    withFaceLandmarks(): LandmarksTask;
    then<TResult1 = DetectionResult | undefined, TResult2 = never>(
      onfulfilled?: ((value: DetectionResult | undefined) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>;
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): Promise<DetectionResult | undefined | TResult>;
  }

  export interface LandmarksTask {
    withFaceDescriptor(): DescriptorTask;
    withFaceExpressions(): Promise<LandmarksResult & WithFaceExpressions<{}>>;
    then<TResult1 = LandmarksResult | undefined, TResult2 = never>(
      onfulfilled?: ((value: LandmarksResult | undefined) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>;
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): Promise<LandmarksResult | undefined | TResult>;
  }

  export interface DescriptorTask {
    then<TResult1 = DescriptorResult | undefined, TResult2 = never>(
      onfulfilled?: ((value: DescriptorResult | undefined) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>;
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): Promise<DescriptorResult | undefined | TResult>;
  }

  export interface DetectionResult extends WithFaceDetection<{}> {
    withFaceLandmarks(): LandmarksResult;
  }

  export interface LandmarksResult
    extends WithFaceDetection<{}>,
      WithFaceLandmarks<WithFaceDetection<{}>> {
    withFaceDescriptor(): DescriptorResult;
    withFaceExpressions(): WithFaceDetection<{}> &
      WithFaceLandmarks<WithFaceDetection<{}>> &
      WithFaceExpressions<{}>;
  }

  export interface DescriptorResult
    extends WithFaceDetection<{}>,
      WithFaceLandmarks<WithFaceDetection<{}>>,
      WithFaceDescriptor<{}> {}

  export function detectSingleFace(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | string,
    options?: TinyFaceDetectorOptions | TinyFaceDetector
  ): DetectionTask;

  export function detectAllFaces(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | string,
    options?: TinyFaceDetectorOptions | TinyFaceDetector
  ): Promise<DetectionResult[]>;
}
