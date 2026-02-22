export function disposeObject3D(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry?.dispose();

    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.filter(Boolean).forEach((mat) => {
      Object.values(mat).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      mat.dispose();
    });
  });
}
