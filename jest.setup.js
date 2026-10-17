// The swipe itself can't run in Jest (it's a Reanimated gesture on the UI thread), so the row
// renders as a plain view. Tests delete through SwipeToDelete's accessibility action instead,
// and the gesture is checked on the phone. The view keeps `onSwipeableOpen`, so a test can fire
// the end of a swipe (`swipeableOpen`) on it.
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const { View } = require('react-native');
  const Swipeable = ({ children, testID, onSwipeableOpen }) => (
    <View testID={testID} onSwipeableOpen={onSwipeableOpen}>
      {children}
    </View>
  );
  return { __esModule: true, default: Swipeable };
});

// The media modules have no native side in Jest. The file system is an in-memory set of file URIs
// (`__files`), so tests can check what was copied into the app's storage and what was deleted.
jest.mock('expo-file-system', () => {
  const files = new Set();
  const contents = new Map();
  const join = (parts) =>
    parts
      .map((part) => (typeof part === 'string' ? part : part.uri))
      .map((uri, i) => (i === 0 ? uri.replace(/\/+$/, '') : uri.replace(/^\/+|\/+$/g, '')))
      .join('/');
  class File {
    constructor(...parts) {
      this.uri = join(parts);
    }
    get exists() {
      return files.has(this.uri);
    }
    copySync(target) {
      files.add(target.uri);
    }
    create() {
      files.add(this.uri);
    }
    write(text) {
      files.add(this.uri);
      contents.set(this.uri, text);
    }
    textSync() {
      return contents.get(this.uri) ?? '';
    }
    delete() {
      files.delete(this.uri);
      contents.delete(this.uri);
    }
  }
  class Directory {
    constructor(...parts) {
      this.uri = `${join(parts)}/`;
    }
    create() {}
  }
  const Paths = { document: new Directory('file:///docs'), cache: new Directory('file:///cache') };
  return { __esModule: true, File, Directory, Paths, __files: files, __contents: contents };
});

jest.mock('expo-image-picker', () => ({
  __esModule: true,
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

// Sharing a workout file, choosing one to import and scanning a QR code: a test makes the picker
// return a file (its content in the file-system mock's `__contents`) or fires `barcodeScanned` on
// the camera view.
jest.mock('expo-sharing', () => ({
  __esModule: true,
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));

jest.mock('expo-document-picker', () => ({
  __esModule: true,
  getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

jest.mock('expo-camera', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    CameraView: (props) => <View testID="camera" onBarcodeScanned={props.onBarcodeScanned} />,
    useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
  };
});

// Renders the props that matter (`source`, `autoplay`) on a plain view.
jest.mock('expo-image', () => {
  const { forwardRef, useImperativeHandle } = require('react');
  const { View } = require('react-native');
  const Image = forwardRef(function Image(props, ref) {
    useImperativeHandle(ref, () => ({
      startAnimating: async () => {},
      stopAnimating: async () => {},
    }));
    return <View {...props} />;
  });
  return { __esModule: true, Image };
});

jest.mock('expo-video', () => {
  const { View } = require('react-native');
  const makePlayer = (source) => ({
    source,
    loop: false,
    muted: false,
    play: jest.fn(),
    pause: jest.fn(),
    release: jest.fn(),
    generateThumbnailsAsync: jest.fn(async () => [{ width: 1, height: 1, thumbnailOf: source }]),
  });
  return {
    __esModule: true,
    createVideoPlayer: (source) => makePlayer(source),
    // One player per source, like the real hook.
    useVideoPlayer: (source, setup) =>
      require('react').useMemo(() => {
        const player = makePlayer(source);
        setup?.(player);
        return player;
      }, [source]),
    VideoView: (props) => <View testID="video-view" {...props} />,
  };
});

// No vibrator in Jest: every function resolves, so tests can assert the calls and their constants.
jest.mock('expo-haptics', () => {
  const actual = jest.requireActual('expo-haptics/src/Haptics.types');
  return {
    __esModule: true,
    ...actual,
    performAndroidHapticsAsync: jest.fn(async () => {}),
    notificationAsync: jest.fn(async () => {}),
    impactAsync: jest.fn(async () => {}),
    selectionAsync: jest.fn(async () => {}),
  };
});

// The profile's and the language's key-value store (its own SQLite file on the phone) as an
// in-memory map, emptied through `__clear` between tests. Starts (and `__clear` restores) with a
// language already set, so every existing flow test still opens on the tabs, in English; a test
// that needs the first-launch gate removes `settings.language` itself.
jest.mock('expo-sqlite/kv-store', () => {
  const items = new Map();
  const seed = () => items.set('settings.language', 'en');
  seed();
  const Storage = {
    getItemSync: (key) => items.get(key) ?? null,
    setItemSync: (key, value) => {
      items.set(key, value);
    },
    removeItemSync: (key) => items.delete(key),
  };
  return {
    __esModule: true,
    default: Storage,
    Storage,
    __clear: () => {
      items.clear();
      seed();
    },
  };
});

// Every test renders through `useTranslation()` somewhere, but only `renderRouter('./app')`
// tests go through the real root layout (the only place that imports this in the app itself).
// Importing it here instead initializes i18next once per test file, in English, for every test.
require('./src/i18n/i18n');
