declare module "*.html" {
  const rawHtmlFile: string;
  export = rawHtmlFile;
}

declare module "*.bmp" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "http://localhost:8081/set-propertyPanelMfe.js" {
  const parcel: any;
  export default parcel;
}

declare module "http://localhost:8082/set-alarmPanelMfe.js" {
  const parcel: any;
  export default parcel;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export = classes;
}