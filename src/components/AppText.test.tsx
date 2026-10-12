import { fonts } from '@/theme/fonts';
import { render, screen } from '@testing-library/react-native';
import { AppText } from './AppText';

// Android picks a font file from the family, never from `fontWeight`: each variant and each
// `weight` has to resolve to its own family.
test('uses the Plus Jakarta Sans family of the variant, or of the weight given', async () => {
  await render(
    <>
      <AppText>Regular</AppText>
      <AppText variant="display">Title</AppText>
      <AppText weight="bold">Bold</AppText>
    </>,
  );

  expect(screen.getByText('Regular')).toHaveStyle({ fontFamily: fonts.regular });
  expect(screen.getByText('Title')).toHaveStyle({ fontFamily: fonts.extraBold });
  expect(screen.getByText('Bold')).toHaveStyle({ fontFamily: fonts.bold });
});
