export function getOwnPropertyDescriptors(src: {} = {}) {
  const descriptors: { [key: string]: any } = {};
  Object.keys(src).forEach((key: string) => descriptors[key] = Object.getOwnPropertyDescriptor(src, key));
  return descriptors;
}
