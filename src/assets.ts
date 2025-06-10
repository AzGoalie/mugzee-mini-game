type AssetConfig<T extends object = {}> = {
  path: string;
} & Partial<T>;

type AssetTree<T extends AssetConfig = AssetConfig<{}>> = {
  [key: string]: T | AssetTree<T>;
};

function isAssetConfig(value: any): value is AssetConfig<{}> {
  return (
    value !== null &&
    typeof value === "object" &&
    "path" in value &&
    typeof value.path === "string"
  );
}

function countLeafNodes<T extends AssetConfig>(tree: AssetTree<T>): number {
  let total = 0;

  for (const value of Object.values(tree)) {
    if (isAssetConfig(value)) {
      total++;
    } else if (value && typeof value === "object") {
      total += countLeafNodes(value as AssetTree<T>);
    }
  }

  return total;
}

type AssetFactory<T extends object> = (config: AssetConfig<T>) => Promise<T>;

type LoadedAssets<TTree extends AssetTree, TLoadedAsset> = {
  [K in keyof TTree]: TTree[K] extends AssetConfig
    ? TLoadedAsset
    : TTree[K] extends AssetTree
    ? LoadedAssets<TTree[K], TLoadedAsset>
    : never;
};

async function loadAssets<
  TInputTree extends AssetTree<any>,
  TLoadedAsset extends object
>(
  assets: TInputTree,
  factory: AssetFactory<TLoadedAsset>,
  onProgress?: (success: number, total: number) => void
): Promise<LoadedAssets<TInputTree, TLoadedAsset>> {
  const total = countLeafNodes(assets as AssetTree<AssetConfig<any>>);

  let success = 0;

  async function loadRecursive<TCurrentTree extends AssetTree<any>>(
    obj: TCurrentTree
  ): Promise<LoadedAssets<TCurrentTree, TLoadedAsset>> {
    const result: { [key: string]: any } = {};

    await Promise.all(
      Object.entries(obj).map(async ([key, value]) => {
        if (isAssetConfig(value)) {
          try {
            result[key] = await factory(value as AssetConfig<any>);
            if (onProgress) onProgress(++success, total);
          } catch (err) {
            console.error(`Failed to load asset ${key}:`, err);
          }
        } else if (value && typeof value === "object") {
          result[key] = await loadRecursive(value as AssetTree<any>);
        }
      })
    );

    return result as LoadedAssets<TCurrentTree, TLoadedAsset>;
  }

  return loadRecursive(assets);
}

const imageFactory: AssetFactory<HTMLImageElement> = async (config) => {
  console.log(`Loading image from: ${config.path}`);
  if (config.width) console.log(`Image width hint: ${config.width}`);
  const img = new Image();
  img.src = config.path;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => {
      console.error(`Error loading image: ${config.path}`, e);
      reject(new Error(`Failed to load image: ${config.path}`));
    };
  });
  return img;
};

const audioFactory: AssetFactory<HTMLAudioElement> = async (config) => {
  console.log(`Loading audio from: ${config.path}`);
  if (config.volume !== undefined)
    console.log(`Audio volume: ${config.volume}`);
  const audio = new Audio();
  audio.src = config.path;
  if (config.loop) audio.loop = config.loop;
  if (config.volume !== undefined) audio.volume = config.volume;

  await new Promise<void>((resolve, reject) => {
    audio.oncanplaythrough = () => resolve();
    audio.onerror = (e) => {
      console.error(`Error loading audio: ${config.path}`, e);
      reject(new Error(`Failed to load audio: ${config.path}`));
    };
  });
  return audio;
};

export async function loadImages<
  T extends AssetTree<AssetConfig<HTMLImageElement>>
>(assets: T): Promise<LoadedAssets<T, HTMLImageElement>> {
  return loadAssets(assets, imageFactory);
}

export async function loadAudio<
  T extends AssetTree<AssetConfig<HTMLAudioElement>>
>(assets: T): Promise<LoadedAssets<T, HTMLAudioElement>> {
  return loadAssets(assets, audioFactory);
}
