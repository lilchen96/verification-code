export type VerificationCodeOptions = {
  width: number;
  height: number;
  targetWidth: number;
  targetHeight: number;
};

export type RadomAvoidArea = {
  lowerLimit: number;
  upperLimit: number;
};

export type Location = {
  x: number;
  y: number;
};

export type Area = {
  topLeft: Location;
  topRight: Location;
  bottomLeft: Location;
  bottomRight: Location;
};

export type VerificationCodeVerifyOptions = {
  background: string;
  targets: string[];
};
