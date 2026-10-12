/**
 * Whether the language picker shows on every launch, even with a language already stored. Only in
 * development (`__DEV__`, so Expo Go and the dev server), to test the picker without clearing the
 * app's data; a release build (the APK) asks only while no language is stored. A function (not a
 * constant) so `jest.setup.js` can turn it off for the flow tests, which would otherwise all open
 * on the picker; `__tests__/language.test.tsx` turns it back on.
 */
export const askLanguageOnLaunch = () => __DEV__;
