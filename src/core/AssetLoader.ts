export type AssetConfig<T> = { path: string } & Partial<T>;

export type AssetTree<T> = AssetConfig<T> | { [key: string]: AssetTree<T> };

type AssetFactory<T> = (config: AssetConfig<T>) => Promise<T>;

type LoadedAssetTree<M extends AssetTree<T>, T> = M extends AssetConfig<T>
  ? T
  : {
      [K in keyof M]: M[K] extends AssetTree<T>
        ? LoadedAssetTree<M[K], T>
        : never;
    };

function isAssetConfig<T>(value: AssetTree<T>): value is AssetConfig<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "path" in value &&
    typeof value.path === "string"
  );
}

function countLeafNodes<T>(tree: AssetTree<T>): number {
  let total = 0;

  for (const value of Object.values(tree)) {
    total += isAssetConfig(value) ? 1 : countLeafNodes(value);
  }

  return total;
}

async function loadAssets<T, M extends AssetTree<T>>(
  assets: M,
  factory: AssetFactory<T>,
  onProgress?: (success: number, total: number) => void
): Promise<LoadedAssetTree<M, T>> {
  const total = countLeafNodes(assets);
  let success = 0;

  async function loadRecursive<TCurrentTree extends AssetTree<any>>(
    obj: TCurrentTree
  ): Promise<LoadedAssetTree<TCurrentTree, T>> {
    const result: { [key: string]: any } = {};

    await Promise.all(
      Object.entries(obj).map(async ([key, value]) => {
        if (isAssetConfig(value)) {
          try {
            result[key] = await factory(value);
            if (onProgress) onProgress(++success, total);
          } catch (err) {
            console.error(`Failed to load asset ${key}:`, err);
          }
        } else if (value && typeof value === "object") {
          result[key] = await loadRecursive(value);
        }
      })
    );

    return result as LoadedAssetTree<TCurrentTree, T>;
  }

  return loadRecursive(assets);
}

const imageFactory: AssetFactory<HTMLImageElement> = async (config) => {
  const img = new Image();
  img.src = config.path;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${config.path}`));
    };
  });
  return img;
};

const audioFactory: AssetFactory<HTMLAudioElement> = async (config) => {
  const audio = new Audio();
  audio.src = config.path;
  if (config.volume !== undefined) {
    audio.volume = config.volume;
  }

  await new Promise<void>((resolve, reject) => {
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => {
      reject(new Error(`Failed to load audio: ${config.path}`));
    };
  });
  return audio;
};

const createOnProgress = (type: string) => (loaded: number, total: number) =>
  console.log(`Loaded ${loaded}/${total} ${type}`);

export async function loadImages<
  T extends AssetTree<AssetConfig<HTMLImageElement>>
>(assets: T): Promise<LoadedAssetTree<T, HTMLImageElement>> {
  return loadAssets(assets, imageFactory, createOnProgress("images"));
}

export async function loadAudio<
  T extends AssetTree<AssetConfig<HTMLAudioElement>>
>(assets: T): Promise<LoadedAssetTree<T, HTMLAudioElement>> {
  return loadAssets(assets, audioFactory, createOnProgress("audio"));
}
