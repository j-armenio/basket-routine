import { Asset } from 'expo-asset';
import { loadThumbnail, thumbnailSource } from './videoThumbnail';

jest.mock('expo-asset', () => ({
  Asset: { loadAsync: jest.fn(async () => [{ localUri: 'file:///cache/ExponentAsset-1.mp4' }]) },
}));

describe('thumbnailSource', () => {
  test('decodes a file URI into the real path (Expo Go folder names have a %)', () => {
    expect(
      thumbnailSource(
        'file:///data/user/0/host.exp.exponent/files/ExperienceData/%2540jarmenio%252Fbasket-routine/exercise-media/1.mp4',
      ),
    ).toBe(
      'file:///data/user/0/host.exp.exponent/files/ExperienceData/%40jarmenio%2Fbasket-routine/exercise-media/1.mp4',
    );
  });

  test('leaves a plain path, a bundled asset and a malformed URI as they are', () => {
    expect(thumbnailSource('file:///data/files/exercise-media/1.mp4')).toBe(
      'file:///data/files/exercise-media/1.mp4',
    );
    expect(thumbnailSource(12)).toBe(12);
    expect(thumbnailSource('file:///bad/%E0%A4%A.mp4')).toBe('file:///bad/%E0%A4%A.mp4');
  });
});

describe('loadThumbnail', () => {
  test('reads a bundled video from its local file (a release build only gives a resource name)', async () => {
    const thumbnail = await loadThumbnail(4321);
    expect(Asset.loadAsync).toHaveBeenCalledWith(4321);
    expect(thumbnail).toMatchObject({ thumbnailOf: 'file:///cache/ExponentAsset-1.mp4' });
  });

  test('gives no thumbnail when the bundled video has no local file', async () => {
    jest.mocked(Asset.loadAsync).mockResolvedValueOnce([{ localUri: null } as Asset]);
    expect(await loadThumbnail(8765)).toBeNull();
  });
});
